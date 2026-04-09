import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import apiKeyRoutes from './routes/api-keys.js';
import notificationRoutes from './routes/notifications.js';
import billingRoutes from './routes/billing.js';
import adminRoutes from './routes/admin.js';
import usersRoutes from './routes/users.js';
import uploadRoutes from './routes/uploads.js';
import analyticsRoutes from './routes/analytics.js';
import { apiKeyAuth } from './middleware/api-key-auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.APP_URL ?? 'http://localhost:5173',
  credentials: true,
}));
// Stripe webhook needs raw body — must be registered before express.json()
app.use('/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// API key authentication (runs before routes, passes through if no sk_ token)
app.use(apiKeyAuth);

// Routes
app.use('/auth', authRoutes);
app.use('/api-keys', apiKeyRoutes);
app.use('/notifications', notificationRoutes);
app.use('/billing', billingRoutes);
app.use('/admin', adminRoutes);
app.use('/users', usersRoutes);
app.use('/uploads', uploadRoutes);
app.use('/analytics', analyticsRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
