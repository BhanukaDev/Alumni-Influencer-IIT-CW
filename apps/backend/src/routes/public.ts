import { Router } from 'express';
import prisma from '../lib/prisma';
import { requireApiKey, requirePermission } from '../middleware/apiKey';

const router = Router();

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getTomorrow(date: Date): Date {
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  return tomorrow;
}

function mapFeaturedAlumnus(winningBid: {
  user: {
    id: number;
    email: string;
    name: string | null;
    profile: {
      bio: string | null;
      linkedinUrl: string | null;
      imageUrl: string | null;
    } | null;
  };
  windowDate: Date;
} | null) {
  if (!winningBid) {
    return null;
  }

  return {
    userId: winningBid.user.id,
    name: winningBid.user.name ?? winningBid.user.email,
    bio: winningBid.user.profile?.bio ?? null,
    linkedinUrl: winningBid.user.profile?.linkedinUrl ?? null,
    imageUrl: winningBid.user.profile?.imageUrl ?? null,
    windowDate: winningBid.windowDate,
  };
}

/**
 * @swagger
 * /api/v1/alumni/today:
 *   get:
 *     tags:
 *       - Public
 *     summary: Get featured alumnus for today and upcoming day
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Featured alumnus information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 featuredAlumnus:
 *                   $ref: '#/components/schemas/FeaturedAlumnus'
 *                 upcomingAlumnus:
 *                   $ref: '#/components/schemas/FeaturedAlumnus'
 *       401:
 *         description: Missing or invalid API key
 */
router.get('/alumni/today', requireApiKey, requirePermission('read:alumni_of_day'), async (_req, res) => {
  const today = startOfDay(new Date());
  const tomorrow = getTomorrow(today);

  const [todayWinningBid, tomorrowWinningBid] = await Promise.all([
    prisma.bid.findFirst({
      where: {
        windowDate: today,
        status: 'WON',
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    }),
    prisma.bid.findFirst({
      where: {
        windowDate: tomorrow,
        status: 'WON',
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    }),
  ]);

  res.json({
    featuredAlumnus: mapFeaturedAlumnus(todayWinningBid),
    upcomingAlumnus: mapFeaturedAlumnus(tomorrowWinningBid),
  });
});

export default router;