import { Router } from 'express';
import { z } from 'zod/v4';
import { requireAuth } from '../middleware/auth.js';
import { createPresignedUpload } from '../services/upload.js';

const router = Router();

const presignSchema = z.object({
  filename: z.string().min(1, 'Filename is required').max(255),
  mimeType: z.string().min(1, 'Mime type is required').max(100),
  size: z.number().int().positive('Size must be positive'),
});

// POST /uploads/presign — generate presigned upload URL
router.post('/presign', requireAuth, async (req, res) => {
  try {
    const parsed = presignSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message },
      });
      return;
    }

    const { filename, mimeType, size } = parsed.data;
    const userId = req.user!.sub;

    const result = await createPresignedUpload(userId, filename, mimeType, size);

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    const isValidation = message.includes('Invalid file type') || message.includes('File too large');

    res.status(isValidation ? 400 : 500).json({
      error: {
        code: isValidation ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
        message,
      },
    });
  }
});

export default router;
