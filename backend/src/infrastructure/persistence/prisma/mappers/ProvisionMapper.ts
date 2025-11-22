import { Provision as ProvisionEntity, ProvisionStatus as PrismaProvisionStatus } from '@prisma/client';
import { Provision, ProvisionStatus } from '../../../../domain/entities/Provision';
import { Money } from '../../../../domain/value-objects/Money';

/**
 * ProvisionMapper
 *
 * Responsable de convertir entre:
 * - Prisma Provision (modelo de BD con Decimal y ProvisionStatus enum)
 * - Domain Provision (entidad de dominio con tipos puros)
 *
 * VENTAJAS:
 * - Aísla Prisma del resto de la aplicación
 * - Conversiones centralizadas de Decimal → Money
 * - Conversiones de enums normalizadas
 * - Manejo de campos opcionales consistente
 */
export class ProvisionMapper {
  /**
   * Convertir Prisma ProvisionStatus → Domain ProvisionStatus
   */
  private static statusToDomain(
    prismaStatus: PrismaProvisionStatus
  ): ProvisionStatus {
    // Los enum values son iguales
    return prismaStatus as ProvisionStatus;
  }

  /**
   * Convertir Domain ProvisionStatus → Prisma ProvisionStatus
   */
  private static statusToPersistence(
    domainStatus: ProvisionStatus
  ): PrismaProvisionStatus {
    // Los enum values son iguales
    return domainStatus as PrismaProvisionStatus;
  }

  /**
   * Convertir Prisma Provision → Domain Provision
   * Transforma tipos Prisma (Decimal, etc) → tipos de dominio (Money)
   */
  static toDomain(prismaProvision: ProvisionEntity): Provision {
    return {
      id: prismaProvision.id,
      item: prismaProvision.item,
      categoryId: prismaProvision.categoryId,
      amount: Money.fromDecimal(prismaProvision.amount).value,
      usedAmount: Money.fromDecimal(prismaProvision.usedAmount).value, // ✅ MATERIALIZED: Now from DB
      dueDate: prismaProvision.dueDate,
      status: this.statusToDomain(prismaProvision.status),
      notes: prismaProvision.notes || undefined,
      createdAt: prismaProvision.createdAt,
      updatedAt: prismaProvision.updatedAt,
    };
  }

  /**
   * Convertir array de Prisma Provisions → array de Domain Provisions
   */
  static toDomainArray(prismaProvisions: ProvisionEntity[]): Provision[] {
    return prismaProvisions.map(prov => this.toDomain(prov));
  }

  /**
   * Convertir Domain Provision → Prisma Provision
   * Útil cuando necesitas crear/actualizar en BD
   */
  static toPersistence(
    provision: Provision
  ): Omit<ProvisionEntity, 'createdAt' | 'updatedAt'> {
    return {
      id: provision.id,
      item: provision.item,
      categoryId: provision.categoryId,
      amount: provision.amount as any, // Prisma manejará la conversión a Decimal
      usedAmount: provision.usedAmount as any, // ✅ MATERIALIZED: Include usedAmount in persistence
      dueDate: provision.dueDate,
      status: this.statusToPersistence(provision.status),
      notes: provision.notes || null,
    };
  }

  /**
   * Obtener el monto como objeto value object Money
   * Útil para operaciones aritméticas o comparaciones
   */
  static getAmount(prismaProvision: ProvisionEntity): Money {
    return Money.fromDecimal(prismaProvision.amount);
  }

  /**
   * Verificar si la provisión ha vencido
   */
  static isExpired(provision: Provision | ProvisionEntity): boolean {
    const dueDate = (provision as any).dueDate;
    return new Date() > dueDate;
  }

  /**
   * Verificar si la provisión está abierta
   */
  static isOpen(provision: Provision | ProvisionEntity): boolean {
    let status: ProvisionStatus;

    // Detectar si es Prisma (status es enum) o Domain (status es string)
    if (typeof (provision as any).status === 'object' || (provision as any).status === 'OPEN' || (provision as any).status === 'CLOSED') {
      // Es Prisma, necesita conversión
      const provisionStatus = (provision as any).status;
      status = this.statusToDomain(provisionStatus);
    } else {
      // Es Domain
      status = (provision as Provision).status;
    }

    return status === ProvisionStatus.OPEN;
  }

  /**
   * Verificar si la provisión está cerrada
   */
  static isClosed(provision: Provision | ProvisionEntity): boolean {
    let status: ProvisionStatus;

    // Detectar si es Prisma (status es enum) o Domain (status es string)
    if (typeof (provision as any).status === 'object' || (provision as any).status === 'OPEN' || (provision as any).status === 'CLOSED') {
      // Es Prisma, necesita conversión
      const provisionStatus = (provision as any).status;
      status = this.statusToDomain(provisionStatus);
    } else {
      // Es Domain
      status = (provision as Provision).status;
    }

    return status === ProvisionStatus.CLOSED;
  }
}
