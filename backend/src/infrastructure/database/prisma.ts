import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // ✅ OPTIMIZED: Logging configuration for query performance monitoring
  log: [
    { emit: 'stdout', level: 'warn' },   // Log warnings and errors
    { emit: 'stdout', level: 'error' },
  ],
}).$extends({
  // ✅ OPTIMIZED: Extended client with query timing and operation tracking
  query: {
    $allModels: {
      async $allOperations({ args, query, operation, model }) {
        const start = Date.now();
        const result = await query(args);
        const duration = Date.now() - start;

        // Log all queries in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log(`📊 [${model}.${operation}] ${duration}ms`);
        }

        // Log slow queries in all environments (> 200ms)
        if (duration > 200) {
          console.warn(`⏱️ Slow [${model}.${operation}] (${duration}ms)`);
        }

        return result;
      },
    },
  },
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Closing database connection pool...');
  await prisma.$disconnect();
  console.log('✅ Connection pool closed');
  process.exit(0);
});

// Handle unexpected disconnections
process.on('exit', async () => {
  await prisma.$disconnect();
});

export default prisma;
