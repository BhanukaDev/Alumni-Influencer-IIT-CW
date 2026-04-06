import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import session from 'express-session';
import Database from 'better-sqlite3';
import { z } from 'zod';
import prisma from './lib/prisma';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRouter from './routes/auth';

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

const profileSchema = z.object({
  fullName: z.string().min(1, 'fullName is required').max(200),
  email: z.string().email('email must be valid').max(320),
});

const campaignSchema = z.object({
  topic: z.string().min(1, 'topic is required').max(200),
  budget: z.number().nonnegative('budget must be zero or greater'),
});

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

app.post('/profile', async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const profile = await prisma.profileSubmission.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email.toLowerCase(),
    },
  });

  return res.status(201).json({
    message: 'Profile saved',
    profile,
  });
});

app.post('/campaign', async (req, res) => {
  const parsed = campaignSchema.safeParse({
    topic: req.body?.topic,
    budget: Number(req.body?.budget),
  });

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const campaign = await prisma.campaignSubmission.create({
    data: {
      topic: parsed.data.topic,
      budget: parsed.data.budget,
    },
  });

  return res.status(201).json({
    message: 'Campaign saved',
    campaign,
  });
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
