import { randomUUID } from 'crypto';
import { Provision, CreateProvisionDTO, UpdateProvisionDTO, ProvisionStatus } from '../../../domain/entities/Provision';
import { IProvisionRepository } from '../../../domain/repositories/IProvisionRepository';

/**
 * Helper function to generate a unique UUID
 */
function generateId(): string {
  return randomUUID();
}

/**
 * InMemoryProvisionRepository
 *
 * In-memory implementation of IProvisionRepository for testing.
 * Stores provisions in a Map instead of the database.
 */
export class InMemoryProvisionRepository implements IProvisionRepository {
  private provisions: Map<string, Provision> = new Map();

  async create(data: CreateProvisionDTO): Promise<Provision> {
    const id = generateId();
    const now = new Date();

    const provision: Provision = {
      id,
      item: data.item,
      categoryId: data.categoryId,
      amount: data.amount,
      dueDate: data.dueDate,
      status: ProvisionStatus.OPEN,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    this.provisions.set(id, provision);
    return provision;
  }

  async findById(id: string): Promise<Provision | null> {
    return this.provisions.get(id) || null;
  }

  async findAll(): Promise<Provision[]> {
    return Array.from(this.provisions.values());
  }

  async findByCategoryId(categoryId: string): Promise<Provision[]> {
    return Array.from(this.provisions.values()).filter(
      prov => prov.categoryId === categoryId
    );
  }

  async findOpenProvisions(): Promise<Provision[]> {
    return Array.from(this.provisions.values()).filter(
      prov => prov.status === ProvisionStatus.OPEN
    );
  }

  async findByIdWithUsedAmount(id: string): Promise<Provision | null> {
    const provision = await this.findById(id);
    if (!provision) return null;

    const usedAmount = await this.calculateMaterializedAmount(id);
    return { ...provision, usedAmount };
  }

  async findAllWithUsedAmount(): Promise<Provision[]> {
    const provisions = await this.findAll();
    return Promise.all(
      provisions.map(async (prov) => ({
        ...prov,
        usedAmount: await this.calculateMaterializedAmount(prov.id),
      }))
    );
  }

  async findByCategoryIdWithUsedAmount(categoryId: string): Promise<Provision[]> {
    const provisions = await this.findByCategoryId(categoryId);
    return Promise.all(
      provisions.map(async (prov) => ({
        ...prov,
        usedAmount: await this.calculateMaterializedAmount(prov.id),
      }))
    );
  }

  async findOpenProvisionsWithUsedAmount(): Promise<Provision[]> {
    const provisions = await this.findOpenProvisions();
    return Promise.all(
      provisions.map(async (prov) => ({
        ...prov,
        usedAmount: await this.calculateMaterializedAmount(prov.id),
      }))
    );
  }

  async update(id: string, data: UpdateProvisionDTO): Promise<Provision> {
    const provision = this.provisions.get(id);
    if (!provision) {
      throw new Error(`Provision with id "${id}" not found`);
    }

    const updated: Provision = {
      ...provision,
      ...data,
      updatedAt: new Date(),
    };

    this.provisions.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.provisions.has(id)) {
      throw new Error(`Provision with id "${id}" not found`);
    }
    this.provisions.delete(id);
  }

  async calculateMaterializedAmount(provisionId: string): Promise<number> {
    // This would normally sum expenses linked to this provision
    // For in-memory testing, we return 0
    return 0;
  }

  /**
   * Clear all provisions (useful for test cleanup)
   */
  clear(): void {
    this.provisions.clear();
  }

  /**
   * Get size of repository (useful for assertions)
   */
  size(): number {
    return this.provisions.size;
  }
}
