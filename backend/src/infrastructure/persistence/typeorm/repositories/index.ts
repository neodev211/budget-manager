/**
 * TypeORM Repositories
 *
 * Alternative ORM implementations using TypeORM.
 * Implement domain repository interfaces and use TypeORM's
 * entity mapping to convert between database and domain types.
 *
 * This demonstrates complete ORM decoupling:
 * - Same interfaces as Prisma repositories
 * - Different implementation using TypeORM
 * - Controllers and Use Cases are completely agnostic to ORM choice
 */

export { TypeORMCategoryRepository } from './TypeORMCategoryRepository';
