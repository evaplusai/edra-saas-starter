import { Router } from 'express';
import crypto from 'node:crypto';
import { query } from '../db/index.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../../types/auth.js';
import type { UserResponse } from '../../types/auth.js';
import { logActivity } from '../lib/activity-log.js';
import { enqueueJob } from '../lib/job-queue.js';

const router = Router();

function toUserResponse(row: Record<string, unknown>): UserResponse {
  return {
    id: row.id as string,
    email: row.email as string,
    name: (row.name as string) ?? null,
    avatar_url: (row.avatar_url as string) ?? null,
    role: row.role as string,
    email_verified: row.email_verified as boolean,
    created_at: (row.created_at as Date).toISOString(),
  };
}

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } });
      return;
    }

    const { name, email, password } = parsed.data;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists' } });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const result = await query(
      `INSERT INTO users (email, hashed_password, name, role, email_verified)
       VALUES ($1, $2, $3, 'user', false)
       RETURNING *`,
      [email.toLowerCase(), hashedPassword, name],
    );

    const user = toUserResponse(result.rows[0]);
    const token = signToken({ sub: user.id, role: user.role });

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, sessionToken, expiresAt],
    );

    await logActivity(user.id, 'signup', { email: user.email }, req.ip ?? undefined);

    const appUrl = process.env.APP_URL ?? 'http://localhost:5173';
    await enqueueJob('send_email', {
      to: user.email,
      template: 'welcome',
      vars: {
        name: user.name ?? user.email,
        verifyUrl: `${appUrl}/verify-email?token=${sessionToken}`,
      },
    });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } });
      return;
    }

    const { email, password } = parsed.data;

    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    const row = result.rows[0];
    const valid = await verifyPassword(password, row.hashed_password as string);
    if (!valid) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    const user = toUserResponse(row);
    const token = signToken({ sub: user.id, role: user.role });

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, sessionToken, expiresAt],
    );

    await logActivity(user.id, 'login', { email: user.email }, req.ip ?? undefined);

    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Login failed' } });
  }
});

// POST /auth/logout
router.post('/logout', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM sessions WHERE user_id = $1', [req.user!.sub]);
    res.status(204).send();
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Logout failed' } });
  }
});

// POST /auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } });
      return;
    }

    const { token } = parsed.data;

    const result = await query(
      `SELECT * FROM verification_tokens WHERE token = $1 AND type = 'email_verification' AND expires_at > now()`,
      [token],
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired verification token' } });
      return;
    }

    const verificationRow = result.rows[0];
    await query('UPDATE users SET email_verified = true WHERE id = $1', [verificationRow.user_id]);
    await query('DELETE FROM verification_tokens WHERE id = $1', [verificationRow.id]);

    res.json({ success: true });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Email verification failed' } });
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } });
      return;
    }

    const { email } = parsed.data;

    const userResult = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);

    // Always return success to prevent email enumeration
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id as string;
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await query(
        `INSERT INTO verification_tokens (user_id, token, type, expires_at)
         VALUES ($1, $2, 'password_reset', $3)`,
        [userId, token, expiresAt],
      );

      const userNameResult = await query('SELECT name, email FROM users WHERE id = $1', [userId]);
      const userName = (userNameResult.rows[0]?.name as string) ?? (userNameResult.rows[0]?.email as string) ?? '';
      const appUrl = process.env.APP_URL ?? 'http://localhost:5173';

      await enqueueJob('send_email', {
        to: email.toLowerCase(),
        template: 'password-reset',
        vars: {
          name: userName,
          resetUrl: `${appUrl}/reset-password?token=${token}`,
          expiresIn: '1 hour',
        },
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Password reset request failed' } });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } });
      return;
    }

    const { token, password } = parsed.data;

    const result = await query(
      `SELECT * FROM verification_tokens WHERE token = $1 AND type = 'password_reset' AND expires_at > now()`,
      [token],
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' } });
      return;
    }

    const verificationRow = result.rows[0];
    const hashedPassword = await hashPassword(password);

    await query('UPDATE users SET hashed_password = $1 WHERE id = $2', [hashedPassword, verificationRow.user_id]);
    await query('DELETE FROM verification_tokens WHERE id = $1', [verificationRow.id]);

    // Invalidate all existing sessions for security
    await query('DELETE FROM sessions WHERE user_id = $1', [verificationRow.user_id]);

    res.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Password reset failed' } });
  }
});

// GET /auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user!.sub]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }

    const user = toUserResponse(result.rows[0]);
    res.json({ user });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user' } });
  }
});

// GET /auth/google — redirect to Google consent screen
router.get('/google', (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: { code: 'CONFIG_ERROR', message: 'Google OAuth is not configured' } });
    return;
  }

  const appUrl = process.env.APP_URL ?? 'http://localhost:5173';
  const redirectUri = `${appUrl}/auth/google/callback`;
  const scope = encodeURIComponent('openid email profile');
  const state = crypto.randomUUID();

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&state=${state}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.redirect(url);
});

// GET /auth/google/callback — exchange code for tokens, create/link user, redirect
router.get('/google/callback', async (req, res) => {
  const appUrl = process.env.APP_URL ?? 'http://localhost:5173';

  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      res.redirect(`${appUrl}/login?error=missing_code`);
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      res.redirect(`${appUrl}/login?error=oauth_not_configured`);
      return;
    }

    const redirectUri = `${appUrl}/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', await tokenResponse.text());
      res.redirect(`${appUrl}/login?error=token_exchange_failed`);
      return;
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };

    // Fetch user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileResponse.ok) {
      console.error('Google profile fetch failed:', await profileResponse.text());
      res.redirect(`${appUrl}/login?error=profile_fetch_failed`);
      return;
    }

    const profile = (await profileResponse.json()) as {
      id: string;
      email: string;
      name?: string;
      picture?: string;
    };

    if (!profile.email) {
      res.redirect(`${appUrl}/login?error=no_email`);
      return;
    }

    // Find or create user
    let userRow: Record<string, unknown>;
    const existing = await query('SELECT * FROM users WHERE email = $1', [profile.email.toLowerCase()]);

    if (existing.rows.length > 0) {
      userRow = existing.rows[0];
      // Update avatar if not set
      if (!userRow.avatar_url && profile.picture) {
        await query('UPDATE users SET avatar_url = $1 WHERE id = $2', [profile.picture, userRow.id]);
        userRow.avatar_url = profile.picture;
      }
    } else {
      // Create new user (no password — OAuth-only account)
      const result = await query(
        `INSERT INTO users (email, name, avatar_url, role, email_verified)
         VALUES ($1, $2, $3, 'user', true)
         RETURNING *`,
        [profile.email.toLowerCase(), profile.name ?? null, profile.picture ?? null],
      );
      userRow = result.rows[0];
      await logActivity(userRow.id as string, 'signup', { email: profile.email, provider: 'google' }, req.ip ?? undefined);
    }

    const user = toUserResponse(userRow);
    const token = signToken({ sub: user.id, role: user.role });

    // Create session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, sessionToken, expiresAt],
    );

    await logActivity(user.id, 'login', { email: user.email, provider: 'google' }, req.ip ?? undefined);

    res.redirect(`${appUrl}/dashboard?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect(`${appUrl}/login?error=oauth_failed`);
  }
});

export default router;
