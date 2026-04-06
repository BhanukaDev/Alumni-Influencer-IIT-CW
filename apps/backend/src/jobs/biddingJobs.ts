import cron from 'node-cron';
import prisma from '../lib/prisma';

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getTomorrowWindowDate(now: Date): Date {
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  return startOfDay(tomorrow);
}

function getCurrentMonthKey(now: Date) {
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

function getWindowMonthKey(windowDate: Date) {
  return {
    month: windowDate.getMonth() + 1,
    year: windowDate.getFullYear(),
  };
}

export async function runDailyWinnerSelection(now: Date = new Date()): Promise<void> {
  const windowDate = getTomorrowWindowDate(now);

  const pendingBids = await prisma.bid.findMany({
    where: {
      windowDate,
      status: 'PENDING',
    },
    orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }],
  });

  if (pendingBids.length === 0) {
    return;
  }

  const winner = pendingBids[0];
  const losers = pendingBids.slice(1);
  const monthKey = getWindowMonthKey(windowDate);

  await prisma.$transaction(async (tx) => {
    await tx.bid.update({
      where: { id: winner.id },
      data: { status: 'WON' },
    });

    if (losers.length > 0) {
      await tx.bid.updateMany({
        where: {
          id: { in: losers.map((bid) => bid.id) },
        },
        data: { status: 'LOST' },
      });
    }

    const existingRecord = await tx.appearanceRecord.findUnique({
      where: {
        userId_month_year: {
          userId: winner.userId,
          month: monthKey.month,
          year: monthKey.year,
        },
      },
    });

    if (existingRecord) {
      await tx.appearanceRecord.update({
        where: { id: existingRecord.id },
        data: { count: { increment: 1 } },
      });
    } else {
      await tx.appearanceRecord.create({
        data: {
          userId: winner.userId,
          month: monthKey.month,
          year: monthKey.year,
          count: 1,
          eventBonus: false,
        },
      });
    }
  });
}

export async function runMonthlyCounterReset(now: Date = new Date()): Promise<void> {
  const monthKey = getCurrentMonthKey(now);
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  await prisma.$transaction(
    users.map((user) =>
      prisma.appearanceRecord.upsert({
        where: {
          userId_month_year: {
            userId: user.id,
            month: monthKey.month,
            year: monthKey.year,
          },
        },
        update: {},
        create: {
          userId: user.id,
          month: monthKey.month,
          year: monthKey.year,
          count: 0,
          eventBonus: false,
        },
      }),
    ),
  );
}

export function registerBiddingJobs(): void {
  cron.schedule('51 12 * * *', async () => {
    try {
      await runDailyWinnerSelection();
      console.log('[jobs] Daily bidding winner selection completed');
    } catch (error) {
      console.error('[jobs] Daily bidding winner selection failed', error);
    }
  });

  cron.schedule('0 0 1 * *', async () => {
    try {
      await runMonthlyCounterReset();
      console.log('[jobs] Monthly appearance counter reset completed');
    } catch (error) {
      console.error('[jobs] Monthly appearance counter reset failed', error);
    }
  });

  void runMonthlyCounterReset().catch((error) => {
    console.error('[jobs] Monthly appearance counter initialization failed', error);
  });
}