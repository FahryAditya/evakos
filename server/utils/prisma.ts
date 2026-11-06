import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'

const { Pool } = pg

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; pool?: pg.Pool }

const rawUrl = process.env.DATABASE_URL || ''
const cleanUrl = rawUrl
  .replace(/[?&]sslmode=[^&]+/, '')
  .replace(/[?&]pgbouncer=[^&]+/, '')

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.pool = pool
}
