import { IProvisionRepository } from '../../../../domain/repositories/IProvisionRepository';
import { Provision, CreateProvisionDTO, UpdateProvisionDTO, ProvisionStatus } from '../../../../domain/entities/Provision';
import { ProvisionMapper } from '../mappers/ProvisionMapper';
import prisma from '../../../database/prisma';

/**
 * PrismaProvisionRepository
 *
 * Prisma implementation of IProvisionRepository interface.
 * Uses ProvisionMapper to convert between Prisma and Domain types.
 * Handles provision queries and materialized amount calculations.
 */
export class PrismaProvisionRepository implements IProvisionRepository {
  async create(data: CreateProvisionDTO): Promise<Provision> {
    const prismaProvision = await prisma.provision.create({
      data: {
        item: data.item,
        categoryId: data.categoryId,
        amount: data.amount,
        dueDate: data.dueDate,
        notes: data.notes,
      },
    });

    return ProvisionMapper.toDomain(prismaProvision);
  }

  async findById(id: string): Promise<Provision | null> {
    const prismaProvision = await prisma.provision.findUnique({
      where: { id },
    });

    if (!prismaProvision) return null;

    return ProvisionMapper.toDomain(prismaProvision);
  }

  async findAll(): Promise<Provision[]> {
    const prismaProvisions = await prisma.provision.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return prismaProvisions.map((prov: any) => ProvisionMapper.toDomain(prov));
  }

  async findByCategoryId(categoryId: string): Promise<Provision[]> {
    const prismaProvisions = await prisma.provision.findMany({
      where: { categoryId },
      orderBy: { dueDate: 'asc' },
    });

    return prismaProvisions.map((prov: any) => ProvisionMapper.toDomain(prov));
  }

  async findOpenProvisions(): Promise<Provision[]> {
    const prismaProvisions = await prisma.provision.findMany({
      where: { status: 'OPEN' },
      orderBy: { dueDate: 'asc' },
    });

    return prismaProvisions.map((prov: any) => ProvisionMapper.toDomain(prov));
  }

  async findByIdWithUsedAmount(id: string): Promise<Provision | null> {
    const prismaProvision = await prisma.provision.findUnique({
      where: { id },
    });

    if (!prismaProvision) return null;

    const provision = ProvisionMapper.toDomain(prismaProvision);
    const usedAmount = await this.calculateMaterializedAmount(id);
    provision.usedAmount = usedAmount;

    return provision;
  }

  async findAllWithUsedAmount(): Promise<Provision[]> {
    const prismaProvisions = await prisma.provision.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const provisionsWithUsedAmount = await Promise.all(
      prismaProvisions.map(async (prov: any) => {
        const provision = ProvisionMapper.toDomain(prov);
        const usedAmount = await this.calculateMaterializedAmount(prov.id);
        provision.usedAmount = usedAmount;
        return provision;
      })
    );

    return provisionsWithUsedAmount;
  }

  async findByCategoryIdWithUsedAmount(categoryId: string): Promise<Provision[]> {
    const prismaProvisions = await prisma.provision.findMany({
      where: { categoryId },
      orderBy: { dueDate: 'asc' },
    });

    const provisionsWithUsedAmount = await Promise.all(
      prismaProvisions.map(async (prov: any) => {
        const provision = ProvisionMapper.toDomain(prov);
        const usedAmount = await this.calculateMaterializedAmount(prov.id);
        provision.usedAmount = usedAmount;
        return provision;
      })
    );

    return provisionsWithUsedAmount;
  }

  async findOpenProvisionsWithUsedAmount(): Promise<Provision[]> {
    const prismaProvisions = await prisma.provision.findMany({
      where: { status: 'OPEN' },
      orderBy: { dueDate: 'asc' },
    });

    const provisionsWithUsedAmount = await Promise.all(
      prismaProvisions.map(async (prov: any) => {
        const provision = ProvisionMapper.toDomain(prov);
        const usedAmount = await this.calculateMaterializedAmount(prov.id);
        provision.usedAmount = usedAmount;
        return provision;
      })
    );

    return provisionsWithUsedAmount;
  }

  async update(id: string, data: UpdateProvisionDTO): Promise<Provision> {
    const prismaProvision = await prisma.provision.update({
      where: { id },
      data: {
        ...(data.item && { item: data.item }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.dueDate && { dueDate: data.dueDate }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return ProvisionMapper.toDomain(prismaProvision);
  }

  async delete(id: string): Promise<void> {
    await prisma.provision.delete({
      where: { id },
    });
  }

  async calculateMaterializedAmount(provisionId: string): Promise<number> {
    const result = await prisma.expense.aggregate({
      where: { provisionId },
      _sum: { amount: true },
    });

    if (!result._sum.amount) return 0;

    // Convert Prisma Decimal to number
    const amount = typeof result._sum.amount === 'object' && 'toNumber' in result._sum.amount
      ? (result._sum.amount as any).toNumber()
      : Number(result._sum.amount);

    // Return absolute value (positive number) because expenses are stored as negative
    return Math.abs(amount);
  }
}
