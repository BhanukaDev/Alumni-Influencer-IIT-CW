import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const profileCreateSchema = z.object({
  bio: z.string().max(5000).optional(),
  linkedinUrl: z.string().max(2048).optional(),
  imageUrl: z.string().url().max(2048).optional(),
  programme: z.string().max(255).optional(),
  graduationYear: z.coerce.number().int().min(1990).max(2100).optional(),
  industrySector: z.string().max(255).optional(),
});

const profileUpdateSchema = z.object({
  bio: z.string().max(5000).optional(),
  linkedinUrl: z.string().max(2048).optional(),
  programme: z.string().max(255).optional(),
  graduationYear: z.coerce.number().int().min(1990).max(2100).optional(),
  industrySector: z.string().max(255).optional(),
});

const profileImageSchema = z.object({
  imageUrl: z.string().url().max(2048),
});

const degreeSchema = z.object({
  name: z.string().min(1).max(255),
  university: z.string().min(1).max(255),
  url: z.string().url().max(2048).optional(),
  completionDate: z.coerce.date().optional(),
});

const certificationSchema = z.object({
  name: z.string().min(1).max(255),
  issuer: z.string().min(1).max(255),
  url: z.string().url().max(2048).optional(),
  completionDate: z.coerce.date().optional(),
});

const licenceSchema = z.object({
  name: z.string().min(1).max(255),
  body: z.string().min(1).max(255),
  url: z.string().url().max(2048).optional(),
  completionDate: z.coerce.date().optional(),
});

const courseSchema = z.object({
  name: z.string().min(1).max(255),
  provider: z.string().min(1).max(255),
  url: z.string().url().max(2048).optional(),
  completionDate: z.coerce.date().optional(),
});

const employmentSchema = z
  .object({
    company: z.string().min(1).max(255),
    role: z.string().min(1).max(255),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
  })
  .refine((value) => !value.endDate || value.endDate >= value.startDate, {
    message: 'endDate must be greater than or equal to startDate',
    path: ['endDate'],
  });

async function getOrCreateProfile(userId: number) {
  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.profile.create({
    data: { userId },
  });
}

async function getProfileOr404(userId: number, res: Response) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return null;
  }

  return profile;
}

router.use(requireAuth);

/**
 * @swagger
 * /profile:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get current user's profile
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile with related data
 *       404:
 *         description: Profile not found
 */
router.get('/', async (req: Request, res: Response) => {
  const userId = req.session.userId!;
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      degrees: { orderBy: { createdAt: 'desc' } },
      certifications: { orderBy: { createdAt: 'desc' } },
      licences: { orderBy: { createdAt: 'desc' } },
      courses: { orderBy: { createdAt: 'desc' } },
      employments: { orderBy: { startDate: 'desc' } },
    },
  });

  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  res.json({ profile });
});

/**
 * @swagger
 * /profile:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Create a new profile
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 maxLength: 5000
 *                 description: Professional biography
 *               linkedinUrl:
 *                 type: string
 *                 format: uri
 *                 maxLength: 2048
 *                 description: LinkedIn profile URL
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 maxLength: 2048
 *                 description: Profile image URL
 *           example:
 *             bio: "Full-stack engineer with 10+ years experience"
 *             linkedinUrl: "https://linkedin.com/in/john-doe"
 *             imageUrl: "https://example.com/photo.jpg"
 *     responses:
 *       201:
 *         description: Profile created
 *       409:
 *         description: Profile already exists
 */
router.post('/', async (req: Request, res: Response) => {
  const parsed = profileCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const userId = req.session.userId!;
  const existing = await prisma.profile.findUnique({ where: { userId } });
  if (existing) {
    res.status(409).json({ error: 'Profile already exists' });
    return;
  }

  const profile = await prisma.profile.create({
    data: {
      userId,
      bio: parsed.data.bio,
      linkedinUrl: parsed.data.linkedinUrl,
      imageUrl: parsed.data.imageUrl,
      programme: parsed.data.programme,
      graduationYear: parsed.data.graduationYear,
      industrySector: parsed.data.industrySector,
    },
  });

  res.status(201).json({ message: 'Profile created', profile });
});

/**
 * @swagger
 * /profile:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Update current user's profile
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 maxLength: 5000
 *                 description: Professional biography
 *               linkedinUrl:
 *                 type: string
 *                 format: uri
 *                 maxLength: 2048
 *                 description: LinkedIn profile URL
 *           example:
 *             bio: "Updated bio"
 *             linkedinUrl: "https://linkedin.com/in/jane-smith"
 *     responses:
 *       200:
 *         description: Profile updated
 *       404:
 *         description: Profile not found
 */
router.patch('/', async (req: Request, res: Response) => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const profile = await getProfileOr404(req.session.userId!, res);
  if (!profile) return;

  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data: {
      bio: parsed.data.bio ?? profile.bio,
      linkedinUrl: parsed.data.linkedinUrl ?? profile.linkedinUrl,
      programme: parsed.data.programme ?? profile.programme,
      graduationYear: parsed.data.graduationYear ?? profile.graduationYear,
      industrySector: parsed.data.industrySector ?? profile.industrySector,
    },
  });

  res.json({ message: 'Profile updated', profile: updated });
});

// POST /profile/image
router.post('/image', async (req: Request, res: Response) => {
  const parsed = profileImageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const profile = await getProfileOr404(req.session.userId!, res);
  if (!profile) return;

  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data: { imageUrl: parsed.data.imageUrl },
  });

  res.json({ message: 'Profile image updated', profile: updated });
});

// GET /profile/completion
router.get('/completion', async (req: Request, res: Response) => {
  const profile = await prisma.profile.findUnique({
    where: { userId: req.session.userId! },
    include: {
      degrees: { select: { id: true } },
      certifications: { select: { id: true } },
      licences: { select: { id: true } },
      courses: { select: { id: true } },
      employments: { select: { id: true } },
    },
  });

  if (!profile) {
    res.json({ completion: 0, missing: ['profile'] });
    return;
  }

  const checks = [
    { key: 'bio', complete: Boolean(profile.bio && profile.bio.trim().length > 0) },
    { key: 'linkedinUrl', complete: Boolean(profile.linkedinUrl) },
    { key: 'imageUrl', complete: Boolean(profile.imageUrl) },
    { key: 'degrees', complete: profile.degrees.length > 0 },
    { key: 'certifications', complete: profile.certifications.length > 0 },
    { key: 'licences', complete: profile.licences.length > 0 },
    { key: 'courses', complete: profile.courses.length > 0 },
    { key: 'employments', complete: profile.employments.length > 0 },
  ];

  const completed = checks.filter((item) => item.complete).length;
  const completion = Math.round((completed / checks.length) * 100);
  const missing = checks.filter((item) => !item.complete).map((item) => item.key);

  res.json({ completion, missing });
});

// POST /profile/degrees
router.post('/degrees', async (req: Request, res: Response) => {
  const parsed = degreeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const profile = await getOrCreateProfile(req.session.userId!);
  const degree = await prisma.degree.create({
    data: {
      profileId: profile.id,
      ...parsed.data,
    },
  });

  res.status(201).json({ message: 'Degree created', degree });
});

// PATCH /profile/degrees/:id
router.patch('/degrees/:id', async (req: Request, res: Response) => {
  const parsedId = idParamSchema.safeParse(req.params);
  const parsedBody = degreeSchema.partial().safeParse(req.body);
  if (!parsedId.success || !parsedBody.success) {
    res.status(400).json({
      error: {
        ...(parsedId.success ? {} : parsedId.error.flatten().fieldErrors),
        ...(parsedBody.success ? {} : parsedBody.error.flatten().fieldErrors),
      },
    });
    return;
  }

  const profile = await getProfileOr404(req.session.userId!, res);
  if (!profile) return;

  const degree = await prisma.degree.findUnique({ where: { id: parsedId.data.id } });
  if (!degree || degree.profileId !== profile.id) {
    res.status(404).json({ error: 'Degree not found' });
    return;
  }

  const updated = await prisma.degree.update({
    where: { id: degree.id },
    data: parsedBody.data,
  });

  res.json({ message: 'Degree updated', degree: updated });
});

// DELETE /profile/degrees/:id
router.delete('/degrees/:id', async (req: Request, res: Response) => {
  const parsedId = idParamSchema.safeParse(req.params);
  if (!parsedId.success) {
    res.status(400).json({ error: parsedId.error.flatten().fieldErrors });
    return;
  }

  const profile = await getProfileOr404(req.session.userId!, res);
  if (!profile) return;

  const degree = await prisma.degree.findUnique({ where: { id: parsedId.data.id } });
  if (!degree || degree.profileId !== profile.id) {
    res.status(404).json({ error: 'Degree not found' });
    return;
  }

  await prisma.degree.delete({ where: { id: degree.id } });
  res.json({ message: 'Degree deleted' });
});

// POST /profile/certifications
router.post('/certifications', async (req: Request, res: Response) => {
  const parsed = certificationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const profile = await getOrCreateProfile(req.session.userId!);
  const certification = await prisma.certification.create({
    data: {
      profileId: profile.id,
      ...parsed.data,
    },
  });

  res.status(201).json({ message: 'Certification created', certification });
});

// PATCH /profile/certifications/:id
router.patch('/certifications/:id', async (req: Request, res: Response) => {
  const parsedId = idParamSchema.safeParse(req.params);
  const parsedBody = certificationSchema.partial().safeParse(req.body);
  if (!parsedId.success || !parsedBody.success) {
    res.status(400).json({
      error: {
        ...(parsedId.success ? {} : parsedId.error.flatten().fieldErrors),
        ...(parsedBody.success ? {} : parsedBody.error.flatten().fieldErrors),
      },
    });
    return;
  }

  const profile = await getProfileOr404(req.session.userId!, res);
  if (!profile) return;

  const certification = await prisma.certification.findUnique({ where: { id: parsedId.data.id } });
  if (!certification || certification.profileId !== profile.id) {
    res.status(404).json({ error: 'Certification not found' });
    return;
  }

  const updated = await prisma.certification.update({
    where: { id: certification.id },
    data: parsedBody.data,
  });

  res.json({ message: 'Certification updated', certification: updated });
});

// DELETE /profile/certifications/:id
router.delete('/certifications/:id', async (req: Request, res: Response) => {
  const parsedId = idParamSchema.safeParse(req.params);
  if (!parsedId.success) {
    res.status(400).json({ error: parsedId.error.flatten().fieldErrors });
    return;
  }

  const profile = await getProfileOr404(req.session.userId!, res);
  if (!profile) return;

  const certification = await prisma.certification.findUnique({ where: { id: parsedId.data.id } });
  if (!certification || certification.profileId !== profile.id) {
    res.status(404).json({ error: 'Certification not found' });
    return;
  }

  await prisma.certification.delete({ where: { id: certification.id } });
  res.json({ message: 'Certification deleted' });
});

// POST /profile/licences
router.post('/licences', async (req: Request, res: Response) => {
  const parsed = licenceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const profile = await getOrCreateProfile(req.session.userId!);
  const licence = await prisma.licence.create({
    data: {
      profileId: profile.id,
      ...parsed.data,
    },
  });

  res.status(201).json({ message: 'Licence created', licence });
});

// PATCH /profile/licences/:id
router.patch('/licences/:id', async (req: Request, res: Response) => {
  const parsedId = idParamSchema.safeParse(req.params);
  const parsedBody = licenceSchema.partial().safeParse(req.body);
  if (!parsedId.success || !parsedBody.success) {
    res.status(400).json({
      error: {
        ...(parsedId.success ? {} : parsedId.error.flatten().fieldErrors),
        ...(parsedBody.success ? {} : parsedBody.error.flatten().fieldErrors),
      },
    });
    return;
  }

  const profile = await getProfileOr404(req.session.userId!, res);
  if (!profile) return;

  const licence = await prisma.licence.findUnique({ where: { id: parsedId.data.id } });
  if (!licence || licence.profileId !== profile.id) {
    res.status(404).json({ error: 'Licence not found' });
    return;
  }

  const updated = await prisma.licence.update({
    where: { id: licence.id },
    data: parsedBody.data,
  });

  res.json({ message: 'Licence updated', licence: updated });
});

// DELETE /profile/licences/:id
router.delete('/licences/:id', async (req: Request, res: Response) => {
  const parsedId = idParamSchema.safeParse(req.params);
  if (!parsedId.success) {
    res.status(400).json({ error: parsedId.error.flatten().fieldErrors });
    return;
  }

  const profile = await getProfileOr404(req.session.userId!, res);
  if (!profile) return;

  const licence = await prisma.licence.findUnique({ where: { id: parsedId.data.id } });
  if (!licence || licence.profileId !== profile.id) {
    res.status(404).json({ error: 'Licence not found' });
    return;
  }

  await prisma.licence.delete({ where: { id: licence.id } });
  res.json({ message: 'Licence deleted' });
});

// POST /profile/courses
router.post('/courses', async (req: Request, res: Response) => {
  const parsed = courseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const profile = await getOrCreateProfile(req.session.userId!);
  const course = await prisma.course.create({
    data: {
      profileId: profile.id,
      ...parsed.data,
    },
  });

  res.status(201).json({ message: 'Course created', course });
});

// PATCH /profile/courses/:id
router.patch('/courses/:id', async (req: Request, res: Response) => {
  const parsedId = idParamSchema.safeParse(req.params);
  const parsedBody = courseSchema.partial().safeParse(req.body);
  if (!parsedId.success || !parsedBody.success) {
    res.status(400).json({
      error: {
        ...(parsedId.success ? {} : parsedId.error.flatten().fieldErrors),
        ...(parsedBody.success ? {} : parsedBody.error.flatten().fieldErrors),
      },
    });
    return;
  }

  const profile = await getProfileOr404(req.session.userId!, res);
  if (!profile) return;

  const course = await prisma.course.findUnique({ where: { id: parsedId.data.id } });
  if (!course || course.profileId !== profile.id) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const updated = await prisma.course.update({
    where: { id: course.id },
    data: parsedBody.data,
  });

  res.json({ message: 'Course updated', course: updated });
});

// DELETE /profile/courses/:id
router.delete('/courses/:id', async (req: Request, res: Response) => {
  const parsedId = idParamSchema.safeParse(req.params);
  if (!parsedId.success) {
    res.status(400).json({ error: parsedId.error.flatten().fieldErrors });
    return;
  }

  const profile = await getProfileOr404(req.session.userId!, res);
  if (!profile) return;

  const course = await prisma.course.findUnique({ where: { id: parsedId.data.id } });
  if (!course || course.profileId !== profile.id) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  await prisma.course.delete({ where: { id: course.id } });
  res.json({ message: 'Course deleted' });
});

// POST /profile/employments
router.post('/employments', async (req: Request, res: Response) => {
  const parsed = employmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const profile = await getOrCreateProfile(req.session.userId!);
  const employment = await prisma.employment.create({
    data: {
      profileId: profile.id,
      ...parsed.data,
    },
  });

  res.status(201).json({ message: 'Employment created', employment });
});

// PATCH /profile/employments/:id
router.patch('/employments/:id', async (req: Request, res: Response) => {
  const parsedId = idParamSchema.safeParse(req.params);
  const parsedBody = employmentSchema.partial().safeParse(req.body);
  if (!parsedId.success || !parsedBody.success) {
    res.status(400).json({
      error: {
        ...(parsedId.success ? {} : parsedId.error.flatten().fieldErrors),
        ...(parsedBody.success ? {} : parsedBody.error.flatten().fieldErrors),
      },
    });
    return;
  }

  const profile = await getProfileOr404(req.session.userId!, res);
  if (!profile) return;

  const employment = await prisma.employment.findUnique({ where: { id: parsedId.data.id } });
  if (!employment || employment.profileId !== profile.id) {
    res.status(404).json({ error: 'Employment not found' });
    return;
  }

  const updated = await prisma.employment.update({
    where: { id: employment.id },
    data: parsedBody.data,
  });

  res.json({ message: 'Employment updated', employment: updated });
});

// DELETE /profile/employments/:id
router.delete('/employments/:id', async (req: Request, res: Response) => {
  const parsedId = idParamSchema.safeParse(req.params);
  if (!parsedId.success) {
    res.status(400).json({ error: parsedId.error.flatten().fieldErrors });
    return;
  }

  const profile = await getProfileOr404(req.session.userId!, res);
  if (!profile) return;

  const employment = await prisma.employment.findUnique({ where: { id: parsedId.data.id } });
  if (!employment || employment.profileId !== profile.id) {
    res.status(404).json({ error: 'Employment not found' });
    return;
  }

  await prisma.employment.delete({ where: { id: employment.id } });
  res.json({ message: 'Employment deleted' });
});

export default router;

