import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

function hashKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

function parsePermissions(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function requireApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'API key required. Use Authorization: Bearer <key>' });
    return;
  }

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey) {
    res.status(401).json({ error: 'API key is empty' });
    return;
  }

  const keyHash = hashKey(rawKey);
  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });

  if (!apiKey || apiKey.revokedAt !== null) {
    res.status(401).json({ error: 'Invalid or revoked API key' });
    return;
  }

  void prisma
    .$transaction([
      prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      }),
      prisma.apiKeyUsageLog.create({
        data: {
          apiKeyId: apiKey.id,
          endpoint: req.path,
          method: req.method,
        },
      }),
    ])
    .catch((err: unknown) => {
      console.error('[apiKey] Usage logging failed', err);
    });

  req.apiKeyId = apiKey.id;
  req.apiKeyPermissions = parsePermissions(apiKey.permissions);
  next();
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.apiKeyPermissions?.includes(permission)) {
      res.status(403).json({ error: `Missing required permission: ${permission}` });
      return;
    }
    next();
  };
}
