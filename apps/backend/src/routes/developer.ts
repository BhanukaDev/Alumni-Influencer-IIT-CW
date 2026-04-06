import crypto from 'node:crypto';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

const createKeySchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(100),
});

const keyIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

function generateRawKey(): string {
  return `ak_${crypto.randomBytes(32).toString('base64url')}`;
}

function hashKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * @swagger
 * /developer/keys:
 *   post:
 *     tags:
 *       - Developer
 *     summary: Create a new API key
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *             required:
 *               - label
 *     responses:
 *       201:
 *         description: API key created
 */
router.post('/keys', async (req: Request, res: Response) => {
  const parsed = createKeySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const userId = req.session.userId!;
  const rawKey = generateRawKey();
  const keyHash = hashKey(rawKey);

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      label: parsed.data.label,
      keyHash,
    },
  });

  res.status(201).json({
    message: 'API key created. Store it safely — it will not be shown again.',
    key: rawKey,
    id: apiKey.id,
    label: apiKey.label,
    createdAt: apiKey.createdAt,
  });
});

/**
 * @swagger
 * /developer/keys:
 *   get:
 *     tags:
 *       - Developer
 *     summary: List all API keys for current user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of API keys
 */
router.get('/keys', async (req: Request, res: Response) => {
  const userId = req.session.userId!;

  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      label: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  res.json({ keys });
});

/**
 * @swagger
 * /developer/keys/{id}/stats:
 *   get:
 *     tags:
 *       - Developer
 *     summary: Get usage statistics for an API key
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: API key statistics with usage logs
 *       404:
 *         description: API key not found
 */
router.get('/keys/:id/stats', async (req: Request, res: Response) => {
  const parsedId = keyIdParamSchema.safeParse(req.params);
  if (!parsedId.success) {
    res.status(400).json({ error: 'Invalid key ID' });
    return;
  }

  const userId = req.session.userId!;
  const apiKey = await prisma.apiKey.findUnique({ where: { id: parsedId.data.id } });

  if (!apiKey || apiKey.userId !== userId) {
    res.status(404).json({ error: 'API key not found' });
    return;
  }

  const [totalRequests, logs] = await Promise.all([
    prisma.apiKeyUsageLog.count({ where: { apiKeyId: apiKey.id } }),
    prisma.apiKeyUsageLog.findMany({
      where: { apiKeyId: apiKey.id },
      orderBy: { accessedAt: 'desc' },
      take: 100,
    }),
  ]);

  res.json({
    id: apiKey.id,
    label: apiKey.label,
    createdAt: apiKey.createdAt,
    lastUsedAt: apiKey.lastUsedAt,
    revokedAt: apiKey.revokedAt,
    totalRequests,
    logs: logs.map((log) => ({
      endpoint: log.endpoint,
      method: log.method,
      accessedAt: log.accessedAt,
    })),
  });
});

/**
 * @swagger
 * /developer/keys/{id}:
 *   delete:
 *     tags:
 *       - Developer
 *     summary: Revoke an API key
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: API key revoked
 *       404:
 *         description: API key not found
 *       400:
 *         description: API key already revoked
 */
router.delete('/keys/:id', async (req: Request, res: Response) => {
  const parsedId = keyIdParamSchema.safeParse(req.params);
  if (!parsedId.success) {
    res.status(400).json({ error: 'Invalid key ID' });
    return;
  }

  const userId = req.session.userId!;
  const apiKey = await prisma.apiKey.findUnique({ where: { id: parsedId.data.id } });

  if (!apiKey || apiKey.userId !== userId) {
    res.status(404).json({ error: 'API key not found' });
    return;
  }

  if (apiKey.revokedAt !== null) {
    res.status(400).json({ error: 'API key is already revoked' });
    return;
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { revokedAt: new Date() },
  });

  res.json({ message: 'API key revoked successfully' });
});

export default router;
