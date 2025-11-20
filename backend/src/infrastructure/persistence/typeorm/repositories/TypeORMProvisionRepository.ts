import { IProvisionRepository } from '../../../../domain/repositories/IProvisionRepository';
import { Provision, CreateProvisionDTO, UpdateProvisionDTO, ProvisionStatus } from '../../../../domain/entities/Provision';
import prisma from '../../../database/prisma';

/**
 * TypeORMProvisionRepository
 *
 * Functional implementation accessing real database via Prisma.
 * Demonstrates that the same interface works with different implementations.
 */
export class TypeORMProvisionRepository implements IProvisionRepository {
  async create(data: CreateProvisionDTO): Promise<Provision> {
    const provision = await prisma.provision.create({
      data: {
        item: data.item,
        amount: data.amount,
        categoryId: data.categoryId,
        dueDate: data.dueDate,
        notes: data.notes,
      },
    });

    return {
      id: provision.id,
      item: provision.item,
      amount: Number(provision.amount),
      categoryId: provision.categoryId,
      dueDate: provision.dueDate,
      status: provision.status as ProvisionStatus,
      notes: provision.notes || undefined,
      createdAt: provision.createdAt,
      updatedAt: provision.updatedAt,
    };
  }

  async findAll(): Promise<Provision[]> {
    const provisions = await prisma.provision.findMany();

    return provisions.map((prov) => ({
      id: prov.id,
      item: prov.item,
      amount: Number(prov.amount),
      categoryId: prov.categoryId,
      dueDate: prov.dueDate,
      status: prov.status as ProvisionStatus,
      notes: prov.notes || undefined,
      createdAt: prov.createdAt,
      updatedAt: prov.updatedAt,
    }));
  }

  async findById(id: string): Promise<Provision | null> {
    const provision = await prisma.provision.findUnique({
      where: { id },
    });

    if (!provision) return null;

    return {
      id: provision.id,
      item: provision.item,
      amount: Number(provision.amount),
      categoryId: provision.categoryId,
      dueDate: provision.dueDate,
      status: provision.status as ProvisionStatus,
      notes: provision.notes || undefined,
      createdAt: provision.createdAt,
      updatedAt: provision.updatedAt,
    };
  }

  async findByCategoryId(categoryId: string): Promise<Provision[]> {
    const provisions = await prisma.provision.findMany({
      where: { categoryId },
    });

    return provisions.map((prov) => ({
      id: prov.id,
      item: prov.item,
      amount: Number(prov.amount),
      categoryId: prov.categoryId,
      dueDate: prov.dueDate,
      status: prov.status as ProvisionStatus,
      notes: prov.notes || undefined,
      createdAt: prov.createdAt,
      updatedAt: prov.updatedAt,
    }));
  }

  async findOpenProvisions(): Promise<Provision[]> {
    const provisions = await prisma.provision.findMany({
      where: { status: 'OPEN' },
    });

    return provisions.map((prov) => ({
      id: prov.id,
      item: prov.item,
      amount: Number(prov.amount),
      categoryId: prov.categoryId,
      dueDate: prov.dueDate,
      status: prov.status as ProvisionStatus,
      notes: prov.notes || undefined,
      createdAt: prov.createdAt,
      updatedAt: prov.updatedAt,
    }));
  }

  async findByIdWithUsedAmount(id: string): Promise<Provision | null> {
    const provision = await this.findById(id);
    if (!provision) return null;

    const usedAmount = await this.calculateMaterializedAmount(id);
    return { ...provision, usedAmount };
  }

  async findAllWithUsedAmount(): Promise<Provision[]> {
    const provisions = await this.findAll();
    const provisionsWithUsedAmount = await Promise.all(
      provisions.map(async (prov) => ({
        ...prov,
        usedAmount: await this.calculateMaterializedAmount(prov.id),
      }))
    );
    return provisionsWithUsedAmount;
  }

  async findByCategoryIdWithUsedAmount(categoryId: string): Promise<Provision[]> {
    const provisions = await this.findByCategoryId(categoryId);
    const provisionsWithUsedAmount = await Promise.all(
      provisions.map(async (prov) => ({
        ...prov,
        usedAmount: await this.calculateMaterializedAmount(prov.id),
      }))
    );
    return provisionsWithUsedAmount;
  }

  async findOpenProvisionsWithUsedAmount(): Promise<Provision[]> {
    const provisions = await this.findOpenProvisions();
    const provisionsWithUsedAmount = await Promise.all(
      provisions.map(async (prov) => ({
        ...prov,
        usedAmount: await this.calculateMaterializedAmount(prov.id),
      }))
    );
    return provisionsWithUsedAmount;
  }

  async update(id: string, data: UpdateProvisionDTO): Promise<Provision> {
    const provision = await prisma.provision.update({
      where: { id },
      data: {
        item: data.item,
        amount: data.amount,
        dueDate: data.dueDate,
        status: data.status,
        notes: data.notes,
      },
    });

    return {
      id: provision.id,
      item: provision.item,
      amount: Number(provision.amount),
      categoryId: provision.categoryId,
      dueDate: provision.dueDate,
      status: provision.status as ProvisionStatus,
      notes: provision.notes || undefined,
      createdAt: provision.createdAt,
      updatedAt: provision.updatedAt,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.provision.delete({
      where: { id },
    });
  }

  async calculateMaterializedAmount(provisionId: string): Promise<number> {
    const expenses = await prisma.expense.aggregate({
      where: { provisionId },
      _sum: { amount: true },
    });

    return expenses._sum.amount ? Math.abs(Number(expenses._sum.amount)) : 0;
  }

  async copyToCategory(
    provisionId: string,
    targetCategoryId: string
  ): Promise<Provision> {
    const provision = await prisma.provision.findUnique({
      where: { id: provisionId },
    });

    if (!provision) {
      throw new Error('Provision not found');
    }

    const copied = await prisma.provision.create({
      data: {
        item: provision.item,
        amount: provision.amount,
        categoryId: targetCategoryId,
        dueDate: provision.dueDate,
        notes: provision.notes,
      },
    });

    return {
      id: copied.id,
      item: copied.item,
      amount: Number(copied.amount),
      categoryId: copied.categoryId,
      dueDate: copied.dueDate,
      status: copied.status as ProvisionStatus,
      notes: copied.notes || undefined,
      createdAt: copied.createdAt,
      updatedAt: copied.updatedAt,
    };
  }

  async bulkCopyToCategory(
    provisionIds: string[],
    targetCategoryId: string
  ): Promise<Provision[]> {
    const provisions = await prisma.provision.findMany({
      where: { id: { in: provisionIds } },
    });

    const copied = await Promise.all(
      provisions.map((prov) =>
        prisma.provision.create({
          data: {
            item: prov.item,
            amount: prov.amount,
            categoryId: targetCategoryId,
            dueDate: prov.dueDate,
            notes: prov.notes,
          },
        })
      )
    );

    return copied.map((prov) => ({
      id: prov.id,
      item: prov.item,
      amount: Number(prov.amount),
      categoryId: prov.categoryId,
      dueDate: prov.dueDate,
      status: prov.status as ProvisionStatus,
      notes: prov.notes || undefined,
      createdAt: prov.createdAt,
      updatedAt: prov.updatedAt,
    }));
  }
}
