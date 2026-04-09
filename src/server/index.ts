import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import apiKeyRoutes from './routes/api-keys.js';
import { apiKeyAuth } from './middleware/api-key-auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.APP_URL ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// API key authentication (runs before routes, passes through if no sk_ token)
app.use(apiKeyAuth);

// Routes
app.use('/auth', authRoutes);
app.use('/api-keys', apiKeyRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
