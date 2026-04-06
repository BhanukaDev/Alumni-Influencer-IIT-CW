import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    const account = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: account.user, pass: account.pass },
    });
    console.log('[email] Ethereal account:', account.user);
  }

  return transporter;
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const t = await getTransporter();
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  const url = `${frontendUrl}/verify-email?token=${token}`;
  if (process.env.NODE_ENV !== 'production') {
    console.log('[email] Verification link:', url);
  }
  const info = await t.sendMail({
    from: process.env.EMAIL_FROM ?? 'noreply@alumni.ac.uk',
    to,
    subject: 'Verify your email',
    html: `<p>Click to verify your account: <a href="${url}">${url}</a></p><p>Link expires in 24 hours.</p>`,
  });
  if (process.env.NODE_ENV !== 'production') {
    console.log('[email] Preview URL:', nodemailer.getTestMessageUrl(info));
  }
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const t = await getTransporter();
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  const url = `${frontendUrl}/reset-password?token=${token}`;
  if (process.env.NODE_ENV !== 'production') {
    console.log('[email] Reset link:', url);
  }
  const info = await t.sendMail({
    from: process.env.EMAIL_FROM ?? 'noreply@alumni.ac.uk',
    to,
    subject: 'Reset your password',
    html: `<p>Click to reset your password: <a href="${url}">${url}</a></p><p>Link expires in 1 hour.</p>`,
  });
  if (process.env.NODE_ENV !== 'production') {
    console.log('[email] Preview URL:', nodemailer.getTestMessageUrl(info));
  }
}
