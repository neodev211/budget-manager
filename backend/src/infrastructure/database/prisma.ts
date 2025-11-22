import { PrismaClient } from '@prisma/client';
import { LoggerService } from '../../application/services/LoggerService';

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
          LoggerService.database(`[${model}.${operation}]`, duration);
        } else if (duration > 200) {
          // Log slow queries in all environments (> 200ms)
          LoggerService.database(`[${model}.${operation}]`, duration);
        }

        return result;
      },
    },
  },
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  LoggerService.info('Closing database connection pool...');
  await prisma.$disconnect();
  LoggerService.info('Connection pool closed');
  process.exit(0);
});

// Handle unexpected disconnections
process.on('exit', async () => {
  await prisma.$disconnect();
});

export default prisma;
