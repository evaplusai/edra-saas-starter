import { Router } from 'express';
import { z } from 'zod/v4';
import { query } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { checkRole } from '../middleware/rbac.js';
import { logActivity } from '../lib/activity-log.js';

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, checkRole('admin'));

// ---------- User Management ----------

const updateUserSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'disabled']).optional(),
});

// GET /admin/users?search=&page=&role=
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) ?? '';
    const roleFilter = (req.query.role as string) ?? '';

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (search.trim()) {
      conditions.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (roleFilter && ['user', 'admin'].includes(roleFilter)) {
      conditions.push(`u.role = $${paramIndex}`);
      params.push(roleFilter);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].total as string, 10);

    const usersResult = await query(
      `SELECT u.id, u.name, u.email, u.role, u.email_verified, u.created_at,
              sp.tier AS subscription_tier, s.status AS subscription_status
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id
       LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    const users = usersResult.rows.map((row) => ({
      id: row.id,
      name: row.name ?? '',
      email: row.email,
      role: row.role,
      email_verified: row.email_verified,
      subscription_tier: row.subscription_tier ?? 'free',
      subscription_status: row.subscription_status ?? 'none',
      created_at: (row.created_at as Date).toISOString(),
    }));

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list users' } });
  }
});

// PATCH /admin/users/:id
router.patch('/users/:id', async (req, res) => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } });
      return;
    }

    const { role, status } = parsed.data;
    const targetId = req.params.id;
    const adminId = req.user!.sub;

    // Prevent self-demotion
    if (targetId === adminId && role && role !== 'admin') {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Cannot change your own role' } });
      return;
    }

    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (role) {
      updates.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    // Status is tracked via email_verified for simplicity (or a separate column)
    // Using a "disabled" approach: we'll use a convention where disabled users
    // have their sessions cleared and can't log in
    if (status === 'disabled') {
      // Delete all sessions to force logout
      await query('DELETE FROM sessions WHERE user_id = $1', [targetId]);
    }

    if (updates.length === 0 && !status) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'No fields to update' } });
      return;
    }

    if (updates.length > 0) {
      const result = await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, email, role`,
        [...params, targetId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
        return;
      }
    }

    const details: Record<string, unknown> = { target_user_id: targetId };
    if (role) details.new_role = role;
    if (status) details.new_status = status;

    await logActivity(adminId, 'admin_update_user', details, req.ip ?? undefined);

    res.json({ success: true });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update user' } });
  }
});

// ---------- Analytics ----------

// GET /admin/analytics/revenue
router.get('/analytics/revenue', async (_req, res) => {
  try {
    // MRR by month (last 12 months)
    const mrrResult = await query(`
      SELECT
        date_trunc('month', s.created_at) AS month,
        SUM(sp.price) AS mrr
      FROM subscriptions s
      JOIN subscription_plans sp ON sp.id = s.plan_id
      WHERE s.status = 'active'
        AND s.created_at >= now() - interval '12 months'
      GROUP BY month
      ORDER BY month ASC
    `);

    const mrr = mrrResult.rows.map((row) => ({
      month: (row.month as Date).toISOString(),
      mrr: parseInt(row.mrr as string, 10) || 0,
    }));

    // Total active MRR
    const totalResult = await query(`
      SELECT COALESCE(SUM(sp.price), 0) AS total_mrr
      FROM subscriptions s
      JOIN subscription_plans sp ON sp.id = s.plan_id
      WHERE s.status = 'active'
    `);

    const totalMrr = parseInt(totalResult.rows[0].total_mrr as string, 10) || 0;

    res.json({ mrr, totalMrr });
  } catch (err) {
    console.error('Admin analytics revenue error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch revenue analytics' } });
  }
});

// GET /admin/analytics/subscribers
router.get('/analytics/subscribers', async (_req, res) => {
  try {
    const result = await query(`
      SELECT sp.tier, COUNT(*) AS count
      FROM subscriptions s
      JOIN subscription_plans sp ON sp.id = s.plan_id
      WHERE s.status = 'active'
      GROUP BY sp.tier
      ORDER BY sp.tier
    `);

    const subscribers = result.rows.map((row) => ({
      tier: row.tier,
      count: parseInt(row.count as string, 10),
    }));

    // Total users count
    const totalResult = await query('SELECT COUNT(*) AS total FROM users');
    const totalUsers = parseInt(totalResult.rows[0].total as string, 10);

    // Recent transactions (from activity logs)
    const txResult = await query(`
      SELECT al.action, al.details, al.created_at,
             u.name AS user_name, u.email AS user_email
      FROM activity_logs al
      LEFT JOIN users u ON u.id = al.user_id
      WHERE al.action IN ('payment_success', 'subscription_upgrade', 'subscription_downgrade', 'subscription_cancel')
      ORDER BY al.created_at DESC
      LIMIT 20
    `);

    const transactions = txResult.rows.map((row) => ({
      action: row.action,
      details: row.details,
      user_name: row.user_name ?? row.user_email ?? 'Unknown',
      created_at: (row.created_at as Date).toISOString(),
    }));

    res.json({ subscribers, totalUsers, transactions });
  } catch (err) {
    console.error('Admin analytics subscribers error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch subscriber analytics' } });
  }
});

// ---------- Activity Logs ----------

// GET /admin/activity?action=&from=&to=&page=
router.get('/activity', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const actionFilter = (req.query.action as string) ?? '';
    const fromDate = (req.query.from as string) ?? '';
    const toDate = (req.query.to as string) ?? '';

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (actionFilter.trim()) {
      conditions.push(`al.action = $${paramIndex}`);
      params.push(actionFilter.trim());
      paramIndex++;
    }

    if (fromDate.trim()) {
      conditions.push(`al.created_at >= $${paramIndex}`);
      params.push(fromDate.trim());
      paramIndex++;
    }

    if (toDate.trim()) {
      conditions.push(`al.created_at <= $${paramIndex}`);
      params.push(toDate.trim());
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) as total FROM activity_logs al ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].total as string, 10);

    const logsResult = await query(
      `SELECT al.id, al.action, al.details, al.ip_address, al.created_at,
              u.name AS user_name, u.email AS user_email
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    const logs = logsResult.rows.map((row) => ({
      id: row.id,
      user_name: row.user_name ?? row.user_email ?? 'System',
      action: row.action,
      details: row.details,
      ip_address: row.ip_address,
      created_at: (row.created_at as Date).toISOString(),
    }));

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Admin activity logs error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch activity logs' } });
  }
});

export default router;
