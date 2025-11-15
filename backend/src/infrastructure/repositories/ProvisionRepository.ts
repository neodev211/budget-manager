import { IProvisionRepository } from '../../domain/repositories/IProvisionRepository';
import { Provision, CreateProvisionDTO, UpdateProvisionDTO, ProvisionStatus } from '../../domain/entities/Provision';
import prisma from '../database/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class ProvisionRepository implements IProvisionRepository {
  private toNumber(decimal: Decimal): number {
    return decimal.toNumber();
  }

  async create(data: CreateProvisionDTO): Promise<Provision> {
    const provision = await prisma.provision.create({
      data: {
        item: data.item,
        categoryId: data.categoryId,
        amount: data.amount,
        dueDate: data.dueDate,
        notes: data.notes,
      },
    });

    const usedAmount = await this.calculateMaterializedAmount(provision.id);

    return {
      ...provision,
      amount: this.toNumber(provision.amount),
      usedAmount,
      status: provision.status as ProvisionStatus,
      notes: provision.notes || undefined,
    };
  }

  async findById(id: string): Promise<Provision | null> {
    const provision = await prisma.provision.findUnique({
      where: { id },
    });

    if (!provision) return null;

    const usedAmount = await this.calculateMaterializedAmount(provision.id);

    return {
      ...provision,
      amount: this.toNumber(provision.amount),
      usedAmount,
      status: provision.status as ProvisionStatus,
      notes: provision.notes || undefined,
    };
  }

  async findAll(): Promise<Provision[]> {
    const provisions = await prisma.provision.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      provisions.map(async (prov: any) => {
        const usedAmount = await this.calculateMaterializedAmount(prov.id);
        return {
          ...prov,
          amount: this.toNumber(prov.amount),
          usedAmount,
          status: prov.status as ProvisionStatus,
          notes: prov.notes || undefined,
        };
      })
    );
  }

  async findByCategoryId(categoryId: string): Promise<Provision[]> {
    const provisions = await prisma.provision.findMany({
      where: { categoryId },
      orderBy: { dueDate: 'asc' },
    });

    return Promise.all(
      provisions.map(async (prov: any) => {
        const usedAmount = await this.calculateMaterializedAmount(prov.id);
        return {
          ...prov,
          amount: this.toNumber(prov.amount),
          usedAmount,
          status: prov.status as ProvisionStatus,
          notes: prov.notes || undefined,
        };
      })
    );
  }

  async findOpenProvisions(): Promise<Provision[]> {
    const provisions = await prisma.provision.findMany({
      where: { status: 'OPEN' },
      orderBy: { dueDate: 'asc' },
    });

    return Promise.all(
      provisions.map(async (prov: any) => {
        const usedAmount = await this.calculateMaterializedAmount(prov.id);
        return {
          ...prov,
          amount: this.toNumber(prov.amount),
          usedAmount,
          status: prov.status as ProvisionStatus,
          notes: prov.notes || undefined,
        };
      })
    );
  }

  async update(id: string, data: UpdateProvisionDTO): Promise<Provision> {
    const provision = await prisma.provision.update({
      where: { id },
      data: {
        ...(data.item && { item: data.item }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.dueDate && { dueDate: data.dueDate }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    const usedAmount = await this.calculateMaterializedAmount(provision.id);

    return {
      ...provision,
      amount: this.toNumber(provision.amount),
      usedAmount,
      status: provision.status as ProvisionStatus,
      notes: provision.notes || undefined,
    };
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

    return result._sum.amount ? this.toNumber(result._sum.amount) : 0;
  }

  async copyToCategory(sourceProvisionId: string, targetCategoryId: string): Promise<Provision> {
    // Obtener la provisión original
    const sourceProvision = await prisma.provision.findUnique({
      where: { id: sourceProvisionId },
    });

    if (!sourceProvision) {
      throw new Error('Source provision not found');
    }

    // Calcular la nueva fecha de vencimiento (último día del mes siguiente)
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

    // Crear la nueva provisión
    const newProvision = await prisma.provision.create({
      data: {
        item: sourceProvision.item,
        categoryId: targetCategoryId,
        amount: sourceProvision.amount,
        dueDate: nextMonth,
        status: 'OPEN',
        notes: sourceProvision.notes,
      },
    });

    return {
      ...newProvision,
      amount: this.toNumber(newProvision.amount),
      usedAmount: 0, // Siempre 0 al copiar
      status: newProvision.status as ProvisionStatus,
      notes: newProvision.notes || undefined,
    };
  }

  async bulkCopyToCategory(provisionIds: string[], targetCategoryId: string): Promise<Provision[]> {
    // Obtener todas las provisiones a copiar
    const sourceProvisions = await prisma.provision.findMany({
      where: { id: { in: provisionIds } },
    });

    if (sourceProvisions.length === 0) {
      throw new Error('No provisions found');
    }

    // Calcular la nueva fecha de vencimiento (último día del mes siguiente)
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

    // Crear todas las nuevas provisiones
    const newProvisions = await Promise.all(
      sourceProvisions.map(async (sourceProvision) => {
        const newProvision = await prisma.provision.create({
          data: {
            item: sourceProvision.item,
            categoryId: targetCategoryId,
            amount: sourceProvision.amount,
            dueDate: nextMonth,
            status: 'OPEN',
            notes: sourceProvision.notes,
          },
        });

        return {
          ...newProvision,
          amount: this.toNumber(newProvision.amount),
          usedAmount: 0, // Siempre 0 al copiar
          status: newProvision.status as ProvisionStatus,
          notes: newProvision.notes || undefined,
        };
      })
    );

    return newProvisions;
  }
}
