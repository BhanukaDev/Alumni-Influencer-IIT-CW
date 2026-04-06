import { Router } from 'express';
import prisma from '../lib/prisma';

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

router.get('/alumni/today', async (_req, res) => {
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