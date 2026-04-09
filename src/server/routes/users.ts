import { Router } from 'express';
import { z } from 'zod/v4';
import { query } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { logActivity } from '../lib/activity-log.js';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  avatar_url: z.string().url('Must be a valid URL').optional(),
  current_password: z.string().min(8).optional(),
  new_password: z.string().min(8, 'New password must be at least 8 characters').optional(),
}).refine(
  (data) => {
    if (data.new_password && !data.current_password) return false;
    return true;
  },
  { message: 'Current password is required when setting a new password' },
);

const updatePreferencesSchema = z.object({
  email_marketing: z.boolean().optional(),
  email_product: z.boolean().optional(),
  in_app: z.boolean().optional(),
});

// PATCH /users/me — update profile
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } });
      return;
    }

    const { name, avatar_url, current_password, new_password } = parsed.data;
    const userId = req.user!.sub;

    // Handle password change
    if (new_password && current_password) {
      const userResult = await query('SELECT hashed_password FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
        return;
      }

      const valid = await verifyPassword(current_password, userResult.rows[0].hashed_password as string);
      if (!valid) {
        res.status(400).json({ error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' } });
        return;
      }

      const hashed = await hashPassword(new_password);
      await query('UPDATE users SET hashed_password = $1 WHERE id = $2', [hashed, userId]);

      await logActivity(userId, 'password_change', {}, req.ip ?? undefined);
    }

    // Handle profile fields
    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex}`);
      params.push(avatar_url);
      paramIndex++;
    }

    if (updates.length > 0) {
      await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        [...params, userId],
      );
    }

    // Fetch updated user
    const result = await query(
      'SELECT id, email, name, avatar_url, role, email_verified, created_at FROM users WHERE id = $1',
      [userId],
    );

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        avatar_url: user.avatar_url ?? null,
        role: user.role,
        email_verified: user.email_verified,
        created_at: (user.created_at as Date).toISOString(),
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' } });
  }
});

// GET /users/me/preferences
router.get('/me/preferences', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const result = await query(
      'SELECT preferences FROM users WHERE id = $1',
      [userId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }

    const preferences = (result.rows[0].preferences as Record<string, unknown>) ?? {
      email_marketing: false,
      email_product: true,
      in_app: true,
    };

    res.json({ preferences });
  } catch (err) {
    console.error('Get preferences error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch preferences' } });
  }
});

// PATCH /users/me/preferences
router.patch('/me/preferences', requireAuth, async (req, res) => {
  try {
    const parsed = updatePreferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } });
      return;
    }

    const userId = req.user!.sub;

    // Get current preferences
    const current = await query('SELECT preferences FROM users WHERE id = $1', [userId]);
    const existing = (current.rows[0]?.preferences as Record<string, unknown>) ?? {};

    const updated = { ...existing, ...parsed.data };

    await query(
      'UPDATE users SET preferences = $1 WHERE id = $2',
      [JSON.stringify(updated), userId],
    );

    res.json({ preferences: updated });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update preferences' } });
  }
});

export default router;
