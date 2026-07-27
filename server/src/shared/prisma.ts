import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// Create PostgreSQL connection pool with optimized settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 30000, // Return error after 30 seconds if unable to connect
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

prisma.$on('query', (e: any) => {
  // যদি কোনো কুয়েরি ১০০ মিলিসেকেন্ডের বেশি সময় নেয়, তবে টার্মিনালে ওয়ার্নিং দিবে
  if (e.duration > 100) {
    console.warn('⚠️ Slow query detected:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  }
});

// prisma.$on('warn', (e) => {
//     console.log(e)
// })

// prisma.$on('info', (e) => {
//     console.log(e)
// })

// prisma.$on('error', (e) => {
//     console.log(e)
// })

export default prisma;
