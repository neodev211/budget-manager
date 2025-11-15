/**
 * Data Mappers - Aislación de Prisma
 *
 * Los mappers convierten entre:
 * - Prisma models (con tipos como Decimal, enums)
 * - Domain entities (tipos puros, value objects)
 *
 * Beneficios:
 * - Aísla la lógica de dominio de Prisma
 * - Centraliza conversiones de tipos
 * - Facilita cambio de ORM en el futuro
 * - Mejora testabilidad
 */
export { CategoryMapper } from './CategoryMapper';
export { ExpenseMapper } from './ExpenseMapper';
export { ProvisionMapper } from './ProvisionMapper';
