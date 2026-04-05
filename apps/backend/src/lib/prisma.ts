import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';
import path from 'node:path';

const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const dbPath = dbUrl.replace(/^file:/, '');
const resolvedPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.resolve(process.cwd(), dbPath);

const adapter = new PrismaBetterSqlite3({ url: resolvedPath });
const prisma = new PrismaClient({ adapter });

export default prisma;
