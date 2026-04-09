import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { query } from '../db/index.js';

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer sk_')) {
    next();
    return;
  }

  const key = header.slice(7);
  const keyHash = hashKey(key);

  try {
    const result = await query(
      `SELECT ak.id AS key_id, ak.user_id, ak.scopes, u.role
       FROM api_keys ak
       JOIN users u ON u.id = ak.user_id
       WHERE ak.key_hash = $1 AND ak.revoked_at IS NULL`,
      [keyHash],
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or revoked API key' } });
      return;
    }

    const row = result.rows[0];

    // Update last_used_at (fire-and-forget, don't block the request)
    query('UPDATE api_keys SET last_used_at = now() WHERE id = $1', [row.key_id]).catch((err) => {
      console.error('Failed to update last_used_at:', err);
    });

    req.user = {
      sub: row.user_id as string,
      role: row.role as string,
    };

    next();
  } catch (err) {
    console.error('API key auth error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Authentication failed' } });
  }
}
