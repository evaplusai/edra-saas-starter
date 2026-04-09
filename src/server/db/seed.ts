import dotenv from 'dotenv';
dotenv.config();

import { hashPassword } from '../lib/password.js';
import pool, { query } from './index.js';

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: string;
  email_verified: boolean;
}

const seedUsers: SeedUser[] = [
  {
    email: 'admin@example.com',
    password: 'password123',
    name: 'Admin User',
    role: 'admin',
    email_verified: true,
  },
  {
    email: 'user@example.com',
    password: 'password123',
    name: 'Regular User',
    role: 'user',
    email_verified: true,
  },
];

async function seed(): Promise<void> {
  console.log('Seeding database...');

  for (const user of seedUsers) {
    const hashed = await hashPassword(user.password);

    await query(
      `INSERT INTO users (email, hashed_password, name, role, email_verified)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [user.email, hashed, user.name, user.role, user.email_verified],
    );

    console.log(`  Seeded user: ${user.email} (${user.role})`);
  }

  console.log('Seeding complete.');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
