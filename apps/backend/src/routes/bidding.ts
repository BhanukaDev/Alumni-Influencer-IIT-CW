import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

const placeBidSchema = z.object({
  amount: z.number().positive('Bid amount must be greater than zero'),
});

const bidIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

function getTomorrowWindowDate(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

function getTodayClosingTime(): Date {
  const now = new Date();
  const closingTime = new Date(now);
  closingTime.setHours(18, 0, 0, 0);
  return closingTime;
}

async function getMonthlyAppearanceLimit(userId: number) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const record = await prisma.appearanceRecord.findUnique({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
  });

  const appearancesUsed = record?.count ?? 0;
  const maxAppearances = record?.eventBonus ? 4 : 3;

  return {
    appearancesUsed,
    maxAppearances,
    remaining: Math.max(0, maxAppearances - appearancesUsed),
  };
}

router.use(requireAuth);

/**
 * @swagger
 * /bidding/slot:
 *   get:
 *     tags:
 *       - Bidding
 *     summary: Get current bidding slot information
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Bidding slot details
 */
router.get('/slot', async (req: Request, res: Response) => {
  const userId = req.session.userId!;
  const windowDate = getTomorrowWindowDate();
  const closesAt = getTodayClosingTime();
  const now = new Date();

  const existingBid = await prisma.bid.findFirst({
    where: {
      userId,
      windowDate,
      status: 'PENDING',
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    windowDate,
    opensAt: now,
    closesAt,
    isOpen: now < closesAt,
    hasBid: Boolean(existingBid),
    bid: existingBid
      ? {
          id: existingBid.id,
          amount: existingBid.amount,
          status: existingBid.status,
          createdAt: existingBid.createdAt,
        }
      : null,
  });
});

/**
 * @swagger
 * /bidding:
 *   post:
 *     tags:
 *       - Bidding
 *     summary: Place a new bid
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *             required:
 *               - amount
 *     responses:
 *       201:
 *         description: Bid placed successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Monthly appearance limit reached
 *       409:
 *         description: Bid already exists for tomorrow
 */
router.post('/', async (req: Request, res: Response) => {
  const parsed = placeBidSchema.safeParse({
    amount: Number(req.body?.amount),
  });

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const userId = req.session.userId!;
  const monthlyLimit = await getMonthlyAppearanceLimit(userId);

  if (monthlyLimit.remaining <= 0) {
    res.status(403).json({
      error: `Monthly appearance limit reached (${monthlyLimit.maxAppearances}/${monthlyLimit.maxAppearances})`,
    });
    return;
  }

  const windowDate = getTomorrowWindowDate();
  const existingBid = await prisma.bid.findFirst({
    where: {
      userId,
      windowDate,
      status: 'PENDING',
    },
  });

  if (existingBid) {
    res.status(409).json({ error: 'You already have a bid for tomorrow. Use update instead.' });
    return;
  }

  const bid = await prisma.bid.create({
    data: {
      userId,
      amount: parsed.data.amount,
      windowDate,
      status: 'PENDING',
    },
  });

  res.status(201).json({
    message: 'Bid placed successfully',
    bid,
    monthlyLimit,
  });
});

/**
 * @swagger
 * /bidding/{id}:
 *   patch:
 *     tags:
 *       - Bidding
 *     summary: Update a pending bid
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Bid updated successfully
 *       400:
 *         description: Invalid bid or amount
 *       404:
 *         description: Bid not found
 */
router.patch('/:id', async (req: Request, res: Response) => {
  const parsedId = bidIdParamSchema.safeParse(req.params);
  const parsedBody = placeBidSchema.safeParse({ amount: Number(req.body?.amount) });

  if (!parsedId.success || !parsedBody.success) {
    res.status(400).json({
      error: {
        ...(parsedId.success ? {} : parsedId.error.flatten().fieldErrors),
        ...(parsedBody.success ? {} : parsedBody.error.flatten().fieldErrors),
      },
    });
    return;
  }

  const userId = req.session.userId!;
  const bid = await prisma.bid.findUnique({ where: { id: parsedId.data.id } });

  if (!bid || bid.userId !== userId) {
    res.status(404).json({ error: 'Bid not found' });
    return;
  }

  if (bid.status !== 'PENDING') {
    res.status(400).json({ error: 'Only pending bids can be updated' });
    return;
  }

  const tomorrowWindowDate = getTomorrowWindowDate();
  if (bid.windowDate.getTime() !== tomorrowWindowDate.getTime()) {
    res.status(400).json({ error: 'Only tomorrow bids can be updated' });
    return;
  }

  if (parsedBody.data.amount <= bid.amount) {
    res.status(400).json({ error: 'New bid amount must be greater than current amount' });
    return;
  }

  const updated = await prisma.bid.update({
    where: { id: bid.id },
    data: { amount: parsedBody.data.amount },
  });

  res.json({ message: 'Bid updated successfully', bid: updated });
});

/**
 * @swagger
 * /bidding/{id}:
 *   delete:
 *     tags:
 *       - Bidding
 *     summary: Cancel a pending bid
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
 *         description: Bid cancelled successfully
 *       400:
 *         description: Only pending bids can be cancelled
 *       404:
 *         description: Bid not found
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const parsedId = bidIdParamSchema.safeParse(req.params);
  if (!parsedId.success) {
    res.status(400).json({ error: parsedId.error.flatten().fieldErrors });
    return;
  }

  const userId = req.session.userId!;
  const bid = await prisma.bid.findUnique({ where: { id: parsedId.data.id } });

  if (!bid || bid.userId !== userId) {
    res.status(404).json({ error: 'Bid not found' });
    return;
  }

  if (bid.status !== 'PENDING') {
    res.status(400).json({ error: 'Only pending bids can be cancelled' });
    return;
  }

  const tomorrowWindowDate = getTomorrowWindowDate();
  if (bid.windowDate.getTime() !== tomorrowWindowDate.getTime()) {
    res.status(400).json({ error: 'Only tomorrow bids can be cancelled' });
    return;
  }

  const cancelled = await prisma.bid.update({
    where: { id: bid.id },
    data: { status: 'CANCELLED' },
  });

  res.json({ message: 'Bid cancelled successfully', bid: cancelled });
});

// GET /bidding/status
router.get('/status', async (req: Request, res: Response) => {
  const userId = req.session.userId!;
  const windowDate = getTomorrowWindowDate();

  const ownBid = await prisma.bid.findFirst({
    where: {
      userId,
      windowDate,
      status: 'PENDING',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!ownBid) {
    res.json({
      hasBid: false,
      status: 'no-bid',
      windowDate,
    });
    return;
  }

  const topBid = await prisma.bid.findFirst({
    where: {
      windowDate,
      status: 'PENDING',
    },
    orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }],
  });

  const isWinning = topBid?.id === ownBid.id;

  res.json({
    hasBid: true,
    status: isWinning ? 'winning' : 'losing',
    windowDate,
    bid: {
      id: ownBid.id,
      amount: ownBid.amount,
      createdAt: ownBid.createdAt,
    },
  });
});

// GET /bidding/history
router.get('/history', async (req: Request, res: Response) => {
  const userId = req.session.userId!;
  const bids = await prisma.bid.findMany({
    where: { userId },
    orderBy: [{ windowDate: 'desc' }, { createdAt: 'desc' }],
  });

  res.json({ items: bids });
});

// GET /bidding/monthly-limit
router.get('/monthly-limit', async (req: Request, res: Response) => {
  const userId = req.session.userId!;
  const monthlyLimit = await getMonthlyAppearanceLimit(userId);

  res.json({
    used: monthlyLimit.appearancesUsed,
    max: monthlyLimit.maxAppearances,
    remaining: monthlyLimit.remaining,
  });
});

export default router;
