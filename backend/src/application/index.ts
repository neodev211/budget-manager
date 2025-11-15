/**
 * Application Layer
 *
 * Contiene toda la lógica de aplicación, incluyendo:
 * - Use Cases: Casos de uso del negocio
 * - Services: Servicios compartidos (validación, etc)
 * - DTOs: Objetos de transferencia de datos
 *
 * Esta capa es completamente independiente del framework
 * y de los detalles de implementación (Prisma, Express, etc).
 */

export * from './use-cases';
export { ValidationService, ValidationError } from './services/ValidationService';
