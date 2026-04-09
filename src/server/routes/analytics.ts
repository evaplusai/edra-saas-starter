import { Router } from 'express';
import { z } from 'zod/v4';
import { query } from '../db/index.js';

const router = Router();

const pageviewSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required').max(100),
  page: z.string().min(1, 'Page is required').max(2000),
  referrer: z.string().max(2000).optional(),
});

// POST /analytics/pageview — record a pageview (no auth required)
router.post('/pageview', async (req, res) => {
  try {
    const parsed = pageviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message },
      });
      return;
    }

    const { sessionId, page, referrer } = parsed.data;
    const userAgent = req.headers['user-agent'] ?? null;

    await query(
      `INSERT INTO analytics_events (session_id, event_type, page, referrer, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, 'pageview', page, referrer ?? null, userAgent],
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Analytics pageview error:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to record pageview' },
    });
  }
});

export default router;
