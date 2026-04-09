import dotenv from 'dotenv';
dotenv.config();

import { query } from './db/index.js';
import { processJob } from './jobs/handlers.js';
import pool from './db/index.js';

const POLL_INTERVAL_MS = 5000;
const BATCH_SIZE = 5;

let running = true;

interface JobRow {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
}

async function pollJobs(): Promise<void> {
  const result = await query<JobRow>(
    `UPDATE jobs
     SET status = 'processing', started_at = now()
     WHERE id IN (
       SELECT id FROM jobs
       WHERE status = 'pending' AND run_at <= now()
       ORDER BY run_at
       LIMIT $1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING id, type, payload, attempts, max_attempts`,
    [BATCH_SIZE],
  );

  for (const job of result.rows) {
    try {
      console.log(`[worker] Processing job ${job.id} (${job.type})`);
      await processJob(job.type, job.payload);

      await query(
        `UPDATE jobs SET status = 'completed', completed_at = now() WHERE id = $1`,
        [job.id],
      );
      console.log(`[worker] Completed job ${job.id}`);
    } catch (err) {
      const attempts = job.attempts + 1;
      const error = err instanceof Error ? err.message : String(err);

      if (attempts >= job.max_attempts) {
        await query(
          `UPDATE jobs SET status = 'failed', attempts = $1, error = $2 WHERE id = $3`,
          [attempts, error, job.id],
        );
        console.error(`[worker] Job ${job.id} failed permanently after ${attempts} attempts: ${error}`);
      } else {
        const backoffMs = Math.pow(attempts, 2) * 1000;
        await query(
          `UPDATE jobs
           SET status = 'pending', attempts = $1, error = $2,
               run_at = now() + ($3 || ' milliseconds')::interval
           WHERE id = $4`,
          [attempts, error, backoffMs, job.id],
        );
        console.warn(`[worker] Job ${job.id} failed (attempt ${attempts}/${job.max_attempts}), retrying in ${backoffMs}ms`);
      }
    }
  }
}

async function run(): Promise<void> {
  console.log('[worker] Starting job worker...');

  while (running) {
    try {
      await pollJobs();
    } catch (err) {
      console.error('[worker] Poll error:', err);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  console.log('[worker] Shutting down...');
  await pool.end();
  console.log('[worker] Stopped.');
}

function shutdown(): void {
  console.log('[worker] Received shutdown signal');
  running = false;
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

run().catch((err) => {
  console.error('[worker] Fatal error:', err);
  process.exit(1);
});
