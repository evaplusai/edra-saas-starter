import crypto from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { query } from '../db/index.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

interface PresignResult {
  uploadUrl: string;
  key: string;
}

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.S3_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? '',
      secretAccessKey: process.env.S3_SECRET_KEY ?? '',
    },
  });
}

export function validateUpload(
  mimeType: string,
  size: number,
): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  if (size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_SIZE_BYTES / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

export async function createPresignedUpload(
  userId: string,
  filename: string,
  mimeType: string,
  size: number,
): Promise<PresignResult> {
  const validation = validateUpload(mimeType, size);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const ext = filename.split('.').pop() ?? 'bin';
  const key = `uploads/${userId}/${crypto.randomUUID()}.${ext}`;

  const client = getS3Client();
  const bucket = process.env.S3_BUCKET ?? '';

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: mimeType,
    ContentLength: size,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

  await query(
    `INSERT INTO file_uploads (user_id, key, filename, mime_type, size)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, key, filename, mimeType, size],
  );

  return { uploadUrl, key };
}
