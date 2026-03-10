import {PrismaClient} from '../../../generated/prisma/client'
import {PrismaBetterSqlite3} from '@prisma/adapter-better-sqlite3'

declare global {
  // This prevents us from making multiple connections to the db when the
  // require cache is cleared.
  var __prisma: PrismaClient | undefined
}

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaBetterSqlite3({url: connectionString})

const prisma =
  global.__prisma ?? (global.__prisma = new PrismaClient({adapter}))

export const getPrisma = () => prisma
