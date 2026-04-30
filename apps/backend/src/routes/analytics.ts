import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireApiKey, requirePermission } from '../middleware/apiKey';

const router = Router();

router.use(requireApiKey);

router.get('/overview', requirePermission('read:analytics'), async (_req, res) => {
  const [alumniCount, certificationCount, courseCount, employmentCount] = await Promise.all([
    prisma.user.count({ where: { role: 'ALUMNUS' } }),
    prisma.certification.count(),
    prisma.course.count(),
    prisma.employment.count(),
  ]);

  res.json({
    alumni: alumniCount,
    certifications: certificationCount,
    courses: courseCount,
    employments: employmentCount,
  });
});

router.get('/skills-gap', requirePermission('read:analytics'), async (_req, res) => {
  const certifications = await prisma.certification.groupBy({
    by: ['name'],
    _count: { name: true },
    orderBy: { _count: { name: 'desc' } },
    take: 20,
  });

  res.json(certifications.map((c) => ({ name: c.name, count: c._count.name })));
});

router.get('/top-courses', requirePermission('read:analytics'), async (_req, res) => {
  const courses = await prisma.course.groupBy({
    by: ['name'],
    _count: { name: true },
    orderBy: { _count: { name: 'desc' } },
    take: 20,
  });

  res.json(courses.map((c) => ({ name: c.name, count: c._count.name })));
});

router.get('/employment-by-sector', requirePermission('read:analytics'), async (_req, res) => {
  const sectors = await prisma.profile.groupBy({
    by: ['industrySector'],
    _count: { industrySector: true },
    where: { industrySector: { not: null } },
    orderBy: { _count: { industrySector: 'desc' } },
  });

  res.json(sectors.map((s) => ({ sector: s.industrySector, count: s._count.industrySector })));
});

router.get('/employment-by-role', requirePermission('read:analytics'), async (_req, res) => {
  const roles = await prisma.employment.groupBy({
    by: ['role'],
    _count: { role: true },
    orderBy: { _count: { role: 'desc' } },
    take: 20,
  });

  res.json(roles.map((r) => ({ role: r.role, count: r._count.role })));
});

router.get('/certifications-over-time', requirePermission('read:analytics'), async (_req, res) => {
  const certs = await prisma.certification.findMany({
    where: { completionDate: { not: null } },
    select: { completionDate: true },
    orderBy: { completionDate: 'asc' },
  });

  const grouped: Record<string, number> = {};
  for (const cert of certs) {
    if (!cert.completionDate) continue;
    const key = `${cert.completionDate.getFullYear()}-${String(cert.completionDate.getMonth() + 1).padStart(2, '0')}`;
    grouped[key] = (grouped[key] ?? 0) + 1;
  }

  res.json(Object.entries(grouped).map(([month, count]) => ({ month, count })));
});

router.get('/alumni-by-programme', requirePermission('read:analytics'), async (_req, res) => {
  const groups = await prisma.profile.groupBy({
    by: ['programme'],
    _count: { programme: true },
    where: { programme: { not: null } },
    orderBy: { _count: { programme: 'desc' } },
  });

  res.json(groups.map((g) => ({ programme: g.programme, count: g._count.programme })));
});

router.get('/alumni-by-graduation-year', requirePermission('read:analytics'), async (_req, res) => {
  const groups = await prisma.profile.groupBy({
    by: ['graduationYear'],
    _count: { graduationYear: true },
    where: { graduationYear: { not: null } },
    orderBy: { graduationYear: 'asc' },
  });

  res.json(groups.map((g) => ({ year: g.graduationYear, count: g._count.graduationYear })));
});

router.get('/alumni', requirePermission('read:alumni'), async (req: Request, res: Response) => {
  const programme = req.query.programme as string | undefined;
  const graduationYear = req.query.graduationYear ? Number(req.query.graduationYear) : undefined;
  const industrySector = req.query.industrySector as string | undefined;

  const alumni = await prisma.profile.findMany({
    where: {
      ...(programme ? { programme } : {}),
      ...(graduationYear && !Number.isNaN(graduationYear) ? { graduationYear } : {}),
      ...(industrySector ? { industrySector } : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      degrees: { select: { name: true, university: true, completionDate: true } },
      certifications: { select: { name: true, issuer: true } },
      courses: { select: { name: true, provider: true } },
      employments: { select: { company: true, role: true, startDate: true, endDate: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ alumni });
});

export default router;
