import cron from 'node-cron';
import prisma from '../lib/prisma';

const BIDDING_TIMEZONE = process.env.BIDDING_TIMEZONE ?? 'Asia/Colombo';
const BIDDING_TEST_OFFSET_MINUTES = Number(process.env.BIDDING_TEST_OFFSET_MINUTES ?? '0');

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

function registerTestWinnerSelectionTimer(): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  if (!Number.isFinite(BIDDING_TEST_OFFSET_MINUTES) || BIDDING_TEST_OFFSET_MINUTES <= 0) {
    return;
  }

  const delayMs = Math.round(BIDDING_TEST_OFFSET_MINUTES * 60 * 1000);
  const runAt = new Date(Date.now() + delayMs);

  console.log(
    `[jobs] Test winner selection scheduled for ${runAt.toISOString()} (${BIDDING_TEST_OFFSET_MINUTES} minutes from now)`,
  );

  setTimeout(() => {
    void runDailyWinnerSelection()
      .then(() => {
        console.log('[jobs] Test winner selection completed');
      })
      .catch((error) => {
        console.error('[jobs] Test winner selection failed', error);
      });
  }, delayMs);
}

export function registerBiddingJobs(): void {
  // Select the winner when bidding closes at 6:00 PM local time.
  cron.schedule('0 18 * * *', async () => {
    try {
      await runDailyWinnerSelection();
      console.log(`[jobs] Daily bidding winner selection completed (${BIDDING_TIMEZONE})`);
    } catch (error) {
      console.error('[jobs] Daily bidding winner selection failed', error);
    }
  }, { timezone: BIDDING_TIMEZONE });

  cron.schedule('0 0 1 * *', async () => {
    try {
      await runMonthlyCounterReset();
      console.log(`[jobs] Monthly appearance counter reset completed (${BIDDING_TIMEZONE})`);
    } catch (error) {
      console.error('[jobs] Monthly appearance counter reset failed', error);
    }
  }, { timezone: BIDDING_TIMEZONE });

  void runMonthlyCounterReset().catch((error) => {
    console.error('[jobs] Monthly appearance counter initialization failed', error);
  });

  registerTestWinnerSelectionTimer();
}