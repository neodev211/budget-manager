import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // ✅ OPTIMIZED: Logging configuration for query performance monitoring
  log: [
    { emit: 'stdout', level: 'warn' },   // Log warnings and errors
    { emit: 'stdout', level: 'error' },
  ],
}).$extends({
  // ✅ OPTIMIZED: Extended client with query timing
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        const start = Date.now();
        const result = await query(args);
        const duration = Date.now() - start;

        // Log slow queries (> 200ms)
        if (duration > 200) {
          console.warn(`⏱️ Slow query (${duration}ms):`, args);
        }

        return result;
      },
    },
  },
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
