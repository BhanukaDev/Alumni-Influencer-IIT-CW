import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { generateToken, tokenExpiry } from '../lib/token';
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email';

const router = Router();

const SALT_ROUNDS = 12;
const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN ?? 'iit.ac.lk';

const registerSchema = z.object({
  email: z
    .string()
    .email()
    .refine((e) => e.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`), {
      message: `Email must be from @${ALLOWED_DOMAIN}`,
    }),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({ email: z.string().email() });

const resetSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const { email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const verifyToken = generateToken();
  const verifyTokenExpiry = tokenExpiry(24);

  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      verifyToken,
      verifyTokenExpiry,
    },
  });

  await sendVerificationEmail(email.toLowerCase(), verifyToken);

  res.status(201).json({ message: 'Registered. Check your email to verify your account.' });
});

// GET /auth/verify-email?token=
router.get('/verify-email', async (req: Request, res: Response) => {
  const token = req.query.token as string | undefined;
  if (!token) {
    res.status(400).json({ error: 'Token is required' });
    return;
  }

  const user = await prisma.user.findFirst({ where: { verifyToken: token } });
  if (!user || !user.verifyTokenExpiry || user.verifyTokenExpiry < new Date()) {
    res.status(400).json({ error: 'Invalid or expired verification token' });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verifyToken: null, verifyTokenExpiry: null },
  });

  res.json({ message: 'Email verified. You can now log in.' });
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  if (!user.isVerified) {
    res.status(403).json({ error: 'Please verify your email before logging in' });
    return;
  }

  req.session.userId = user.id;
  req.session.role = user.role;

  res.json({ message: 'Logged in', role: user.role });
});

// GET /auth/session
router.get('/session', (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    userId: req.session.userId,
    role: req.session.role,
  });
});

// POST /auth/logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Could not log out' });
      return;
    }
    res.clearCookie('sid');
    res.json({ message: 'Logged out' });
  });
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });

  // Always respond the same to prevent email enumeration
  if (user && user.isVerified) {
    const resetToken = generateToken();
    const resetTokenExpiry = tokenExpiry(1);
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });
    await sendPasswordResetEmail(user.email, resetToken);
  }

  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// POST /auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const { token, password } = parsed.data;
  const user = await prisma.user.findFirst({ where: { resetToken: token } });

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    res.status(400).json({ error: 'Invalid or expired reset token' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  res.json({ message: 'Password reset successfully. You can now log in.' });
});

export default router;
