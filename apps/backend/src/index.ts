import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import session from 'express-session';
import Database from 'better-sqlite3';
import { registerBiddingJobs } from './jobs/biddingJobs';
import prisma from './lib/prisma';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRouter from './routes/auth';
import biddingRouter from './routes/bidding';
import profileRouter from './routes/profile';
import publicRouter from './routes/public';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const BetterSqliteStore = require('better-sqlite3-session-store') as (
  s: typeof session,
) => new (opts: { client: Database.Database; expired?: { clear: boolean; intervalMs: number } }) => session.Store;

const app = express();
const port = Number(process.env.PORT) || 3000;
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ error: 'Too many requests, please try again later.' });
    },
  }),
);

const SqliteStore = BetterSqliteStore(session);
const sessionDb = new Database('sessions.db');

app.use(
  session({
    store: new SqliteStore({ client: sessionDb, expired: { clear: true, intervalMs: 900000 } }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    name: 'sid',
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use('/auth', authRouter);
app.use('/api/v1', publicRouter);
app.use('/bidding', biddingRouter);
app.use('/profile', profileRouter);

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.get('/profile-submissions', async (_req, res) => {
  const profiles = await prisma.profileSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return res.json({ items: profiles });
});

app.get('/campaign-submissions', async (_req, res) => {
  const campaigns = await prisma.campaignSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return res.json({ items: campaigns });
});

app.post('/campaign', async (req, res) => {
  const topic = typeof req.body?.topic === 'string' ? req.body.topic : '';
  const budget = Number(req.body?.budget);

  if (!topic || Number.isNaN(budget) || budget < 0) {
    return res.status(400).json({ error: 'Invalid campaign payload' });
  }

  const campaign = await prisma.campaignSubmission.create({
    data: {
      topic,
      budget,
    },
  });

  return res.status(201).json({
    message: 'Campaign saved',
    campaign,
  });
});

app.use(notFound);
app.use(errorHandler);

registerBiddingJobs();

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
