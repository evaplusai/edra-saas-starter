import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod/v4';
import { query } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  scopes: z.array(z.string()).default([]),
});

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function generateKey(): string {
  const bytes = crypto.randomBytes(32);
  return `sk_${bytes.toString('hex')}`;
}

function maskKey(key: string): string {
  // Show prefix only: sk_abcd...
  return `${key.slice(0, 7)}...${'*'.repeat(8)}`;
}

// POST /api-keys — generate a new API key
router.post('/', requireAuth, async (req, res) => {
  try {
    const parsed = createApiKeySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } });
      return;
    }

    const { name, scopes } = parsed.data;
    const userId = req.user!.sub;

    // Check active key limit (max 10 per user)
    const countResult = await query(
      'SELECT COUNT(*) as count FROM api_keys WHERE user_id = $1 AND revoked_at IS NULL',
      [userId],
    );
    const activeCount = parseInt(countResult.rows[0].count as string, 10);
    if (activeCount >= 10) {
      res.status(400).json({ error: { code: 'LIMIT_REACHED', message: 'Maximum of 10 active API keys allowed' } });
      return;
    }

    const plainKey = generateKey();
    const keyHash = hashKey(plainKey);

    const result = await query(
      `INSERT INTO api_keys (user_id, name, key_hash, scopes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, scopes, created_at`,
      [userId, name, keyHash, scopes],
    );

    const row = result.rows[0];

    res.status(201).json({
      apiKey: {
        id: row.id,
        name: row.name,
        key: plainKey,
        scopes: row.scopes,
        created_at: (row.created_at as Date).toISOString(),
      },
    });
  } catch (err) {
    console.error('Create API key error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create API key' } });
  }
});

// GET /api-keys — list user's API keys (masked)
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.sub;

    const result = await query(
      `SELECT id, name, key_hash, scopes, last_used_at, created_at, revoked_at
       FROM api_keys
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    const keys = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      prefix: maskKey(row.key_hash as string),
      scopes: row.scopes,
      last_used_at: row.last_used_at ? (row.last_used_at as Date).toISOString() : null,
      created_at: (row.created_at as Date).toISOString(),
      revoked: row.revoked_at !== null,
    }));

    res.json({ apiKeys: keys });
  } catch (err) {
    console.error('List API keys error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list API keys' } });
  }
});

// DELETE /api-keys/:id — revoke an API key
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const keyId = req.params.id;

    const result = await query(
      `UPDATE api_keys SET revoked_at = now()
       WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
       RETURNING id`,
      [keyId, userId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API key not found or already revoked' } });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error('Revoke API key error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to revoke API key' } });
  }
});

export default router;
