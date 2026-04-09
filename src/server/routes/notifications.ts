import { Router } from 'express';
import { query } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /notifications?page=1&limit=20
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user!.sub, limit, offset],
    );

    const countResult = await query(
      'SELECT COUNT(*)::int AS total FROM notifications WHERE user_id = $1',
      [req.user!.sub],
    );

    res.json({
      notifications: result.rows,
      total: countResult.rows[0].total,
      page,
      limit,
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch notifications' } });
  }
});

// GET /notifications/unread-count
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read = false',
      [req.user!.sub],
    );

    res.json({ count: result.rows[0].count });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch unread count' } });
  }
});

// PATCH /notifications/mark-all-read
router.patch('/mark-all-read', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `UPDATE notifications SET read = true
       WHERE user_id = $1 AND read = false
       RETURNING id`,
      [req.user!.sub],
    );

    res.json({ updated: result.rows.length });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to mark all notifications as read' } });
  }
});

// PATCH /notifications/:id/read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `UPDATE notifications SET read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user!.sub],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });
      return;
    }

    res.json({ notification: result.rows[0] });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to mark notification as read' } });
  }
});

export default router;
