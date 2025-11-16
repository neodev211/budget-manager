import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * TypeORM DataSource Configuration
 *
 * This configuration demonstrates switching from Prisma to TypeORM.
 * Currently not initialized (proof of concept for ORM switching).
 *
 * To enable TypeORM:
 * 1. Uncomment the initialization code below
 * 2. Update DIContainer to use TypeORMCategoryRepository
 * 3. Implement remaining TypeORM repositories (Expense, Provision, Report)
 */

// Define TypeORM entities here (PostgreSQL example)
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'budget_manager',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [],
  migrations: [],
  subscribers: [],
});

// Initialize TypeORM when needed
// Uncomment this to enable TypeORM:
/*
export async function initializeTypeORM() {
  try {
    await AppDataSource.initialize();
    console.log('TypeORM initialized successfully');
  } catch (error) {
    console.error('Failed to initialize TypeORM:', error);
    throw error;
  }
}

export async function closeTypeORM() {
  try {
    await AppDataSource.destroy();
    console.log('TypeORM connection closed');
  } catch (error) {
    console.error('Failed to close TypeORM connection:', error);
  }
}
*/

export default AppDataSource;
