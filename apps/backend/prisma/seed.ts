import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';

const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = 'Password123!';

const alumni = [
  { name: 'Ashan Perera', email: 'ashan.perera@iit.ac.lk', programme: 'Computer Science', graduationYear: 2021, industrySector: 'Technology' },
  { name: 'Dilini Fernando', email: 'dilini.fernando@iit.ac.lk', programme: 'Computer Science', graduationYear: 2022, industrySector: 'Finance' },
  { name: 'Nuwan Silva', email: 'nuwan.silva@iit.ac.lk', programme: 'Software Engineering', graduationYear: 2021, industrySector: 'Technology' },
  { name: 'Sachini Jayawardena', email: 'sachini.j@iit.ac.lk', programme: 'Software Engineering', graduationYear: 2023, industrySector: 'E-commerce' },
  { name: 'Kasun Bandara', email: 'kasun.bandara@iit.ac.lk', programme: 'Business Management', graduationYear: 2020, industrySector: 'Consulting' },
  { name: 'Thilini Wickramasinghe', email: 'thilini.w@iit.ac.lk', programme: 'Business Management', graduationYear: 2022, industrySector: 'Finance' },
  { name: 'Ravindu Gunawardena', email: 'ravindu.g@iit.ac.lk', programme: 'Data Science', graduationYear: 2022, industrySector: 'Technology' },
  { name: 'Isuri Rathnayake', email: 'isuri.r@iit.ac.lk', programme: 'Data Science', graduationYear: 2023, industrySector: 'Healthcare' },
  { name: 'Dimuth Samarawickrama', email: 'dimuth.s@iit.ac.lk', programme: 'Cybersecurity', graduationYear: 2021, industrySector: 'Technology' },
  { name: 'Oshadi Mendis', email: 'oshadi.m@iit.ac.lk', programme: 'Cybersecurity', graduationYear: 2023, industrySector: 'Finance' },
  { name: 'Chanaka Dissanayake', email: 'chanaka.d@iit.ac.lk', programme: 'Information Technology', graduationYear: 2020, industrySector: 'Education' },
  { name: 'Malsha Kumari', email: 'malsha.k@iit.ac.lk', programme: 'Information Technology', graduationYear: 2024, industrySector: 'Technology' },
  { name: 'Tharindu Amarasinghe', email: 'tharindu.a@iit.ac.lk', programme: 'Computer Science', graduationYear: 2023, industrySector: 'Consulting' },
  { name: 'Pavithra Senanayake', email: 'pavithra.s@iit.ac.lk', programme: 'Software Engineering', graduationYear: 2020, industrySector: 'Healthcare' },
  { name: 'Lahiru Rajapaksha', email: 'lahiru.r@iit.ac.lk', programme: 'Data Science', graduationYear: 2024, industrySector: 'E-commerce' },
  { name: 'Nimasha Wijesinghe', email: 'nimasha.w@iit.ac.lk', programme: 'Business Management', graduationYear: 2021, industrySector: 'Consulting' },
  { name: 'Buddhika Karunaratne', email: 'buddhika.k@iit.ac.lk', programme: 'Computer Science', graduationYear: 2020, industrySector: 'Technology' },
  { name: 'Sanduni Liyanage', email: 'sanduni.l@iit.ac.lk', programme: 'Cybersecurity', graduationYear: 2022, industrySector: 'Finance' },
];

const certificationPool: { name: string; issuer: string; monthsAfterGrad: number }[] = [
  { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', monthsAfterGrad: 8 },
  { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', monthsAfterGrad: 14 },
  { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', monthsAfterGrad: 6 },
  { name: 'Certified Kubernetes Administrator', issuer: 'CNCF', monthsAfterGrad: 12 },
  { name: 'Docker Certified Associate', issuer: 'Docker Inc.', monthsAfterGrad: 10 },
  { name: 'Docker Certified Associate', issuer: 'Docker Inc.', monthsAfterGrad: 18 },
  { name: 'Google Cloud Professional Data Engineer', issuer: 'Google', monthsAfterGrad: 16 },
  { name: 'Microsoft Azure Fundamentals', issuer: 'Microsoft', monthsAfterGrad: 7 },
  { name: 'Certified Scrum Master', issuer: 'Scrum Alliance', monthsAfterGrad: 5 },
  { name: 'Certified Scrum Master', issuer: 'Scrum Alliance', monthsAfterGrad: 9 },
  { name: 'CompTIA Security+', issuer: 'CompTIA', monthsAfterGrad: 11 },
  { name: 'Tableau Desktop Specialist', issuer: 'Tableau', monthsAfterGrad: 13 },
  { name: 'Python Institute PCEP', issuer: 'Python Institute', monthsAfterGrad: 4 },
  { name: 'HashiCorp Terraform Associate', issuer: 'HashiCorp', monthsAfterGrad: 20 },
  { name: 'Microsoft Azure Fundamentals', issuer: 'Microsoft', monthsAfterGrad: 9 },
];

const coursePool: { name: string; provider: string; monthsAfterGrad: number }[] = [
  { name: 'Docker & Kubernetes: The Practical Guide', provider: 'Udemy', monthsAfterGrad: 6 },
  { name: 'Python for Data Science and ML', provider: 'Coursera', monthsAfterGrad: 4 },
  { name: 'Machine Learning A-Z', provider: 'Udemy', monthsAfterGrad: 8 },
  { name: 'React - The Complete Guide', provider: 'Udemy', monthsAfterGrad: 5 },
  { name: 'AWS Cloud Practitioner Essentials', provider: 'AWS Training', monthsAfterGrad: 3 },
  { name: 'Agile Project Management', provider: 'Coursera', monthsAfterGrad: 7 },
  { name: 'SQL for Data Analysis', provider: 'Udacity', monthsAfterGrad: 6 },
  { name: 'Cybersecurity Fundamentals', provider: 'edX', monthsAfterGrad: 10 },
  { name: 'Terraform for Beginners', provider: 'Udemy', monthsAfterGrad: 12 },
  { name: 'Data Visualization with Tableau', provider: 'Coursera', monthsAfterGrad: 9 },
  { name: 'Node.js - The Complete Guide', provider: 'Udemy', monthsAfterGrad: 5 },
  { name: 'Deep Learning Specialization', provider: 'Coursera', monthsAfterGrad: 15 },
];

const employmentPool: { company: string; role: string; monthsAfterGrad: number }[] = [
  { company: 'IFS', role: 'Software Engineer', monthsAfterGrad: 2 },
  { company: 'WSO2', role: 'Associate Software Engineer', monthsAfterGrad: 1 },
  { company: 'Sysco LABS', role: 'Software Engineer', monthsAfterGrad: 3 },
  { company: 'Zone24x7', role: 'Full Stack Developer', monthsAfterGrad: 2 },
  { company: 'Pearson Lanka', role: 'Data Analyst', monthsAfterGrad: 4 },
  { company: 'Virtusa', role: 'Software Engineer', monthsAfterGrad: 2 },
  { company: 'Calcey Technologies', role: 'Junior Developer', monthsAfterGrad: 1 },
  { company: 'Mitra Innovation', role: 'Cloud Engineer', monthsAfterGrad: 3 },
  { company: 'Fortude', role: 'DevOps Engineer', monthsAfterGrad: 6 },
  { company: 'hSenid Mobile', role: 'Backend Developer', monthsAfterGrad: 2 },
  { company: 'Commercial Bank', role: 'IT Security Analyst', monthsAfterGrad: 3 },
  { company: 'Dialog Axiata', role: 'Data Scientist', monthsAfterGrad: 5 },
  { company: 'Deloitte', role: 'Technology Consultant', monthsAfterGrad: 4 },
  { company: 'Accenture', role: 'Cloud Architect', monthsAfterGrad: 8 },
  { company: 'HCL Technologies', role: 'Product Manager', monthsAfterGrad: 7 },
  { company: 'PickMe', role: 'Full Stack Developer', monthsAfterGrad: 2 },
  { company: 'Daraz', role: 'Data Analyst', monthsAfterGrad: 3 },
  { company: 'LSEG', role: 'Software Engineer', monthsAfterGrad: 1 },
];

function addMonths(baseYear: number, months: number): Date {
  const date = new Date(baseYear, 5, 1); // June of graduation year
  date.setMonth(date.getMonth() + months);
  return date;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function main() {
  console.log('Seeding database...');

  await prisma.apiKeyUsageLog.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.appearanceRecord.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.course.deleteMany();
  await prisma.licence.deleteMany();
  await prisma.degree.deleteMany();
  await prisma.employment.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  for (const alumnus of alumni) {
    const user = await prisma.user.create({
      data: {
        name: alumnus.name,
        email: alumnus.email,
        passwordHash,
        role: 'ALUMNUS',
        isVerified: true,
      },
    });

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        bio: `${alumnus.name} graduated from IIT in ${alumnus.graduationYear} with a degree in ${alumnus.programme}.`,
        programme: alumnus.programme,
        graduationYear: alumnus.graduationYear,
        industrySector: alumnus.industrySector,
      },
    });

    await prisma.degree.create({
      data: {
        profileId: profile.id,
        name: `BSc (Hons) ${alumnus.programme}`,
        university: 'Informatics Institute of Technology',
        completionDate: new Date(alumnus.graduationYear, 5, 30),
      },
    });

    const certs = pickRandom(certificationPool, Math.floor(Math.random() * 3) + 2);
    for (const cert of certs) {
      await prisma.certification.create({
        data: {
          profileId: profile.id,
          name: cert.name,
          issuer: cert.issuer,
          completionDate: addMonths(alumnus.graduationYear, cert.monthsAfterGrad),
        },
      });
    }

    const courses = pickRandom(coursePool, Math.floor(Math.random() * 3) + 2);
    for (const course of courses) {
      await prisma.course.create({
        data: {
          profileId: profile.id,
          name: course.name,
          provider: course.provider,
          completionDate: addMonths(alumnus.graduationYear, course.monthsAfterGrad),
        },
      });
    }

    const jobs = pickRandom(employmentPool, Math.floor(Math.random() * 2) + 1);
    for (const job of jobs) {
      const startDate = addMonths(alumnus.graduationYear, job.monthsAfterGrad);
      await prisma.employment.create({
        data: {
          profileId: profile.id,
          company: job.company,
          role: job.role,
          startDate,
        },
      });
    }
  }

  const devUser = await prisma.user.create({
    data: {
      name: 'Analytics Admin',
      email: 'admin@iit.ac.lk',
      passwordHash,
      role: 'DEVELOPER',
      isVerified: true,
    },
  });

  console.log(`Seeded ${alumni.length} alumni and 1 developer account.`);
  console.log(`Developer email: ${devUser.email}`);
  console.log(`All accounts use password: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
