import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

router.get('/alumni/today', async (_req, res) => {
  const today = startOfDay(new Date());

  const winningBid = await prisma.bid.findFirst({
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
  });

  if (!winningBid || !winningBid.user.profile) {
    res.json({ featuredAlumnus: null });
    return;
  }

  res.json({
    featuredAlumnus: {
      userId: winningBid.user.id,
      name: winningBid.user.name ?? winningBid.user.email,
      bio: winningBid.user.profile.bio,
      linkedinUrl: winningBid.user.profile.linkedinUrl,
      imageUrl: winningBid.user.profile.imageUrl,
      windowDate: winningBid.windowDate,
    },
  });
});

export default router;