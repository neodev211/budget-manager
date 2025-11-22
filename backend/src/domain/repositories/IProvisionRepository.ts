import { Provision, CreateProvisionDTO, UpdateProvisionDTO } from '../entities/Provision';

export interface IProvisionRepository {
  create(data: CreateProvisionDTO): Promise<Provision>;
  findById(id: string): Promise<Provision | null>;
  findAll(): Promise<Provision[]>;
  findByCategoryId(categoryId: string): Promise<Provision[]>;
  findOpenProvisions(): Promise<Provision[]>;
  update(id: string, data: UpdateProvisionDTO): Promise<Provision>;
  delete(id: string): Promise<void>;
  // ✅ MATERIALIZED: usedAmount is now part of Provision entity, no need for separate queries
  updateUsedAmount(provisionId: string, usedAmount: number): Promise<void>;
  // Validation: Calculate and compare materialized amount vs stored
  calculateMaterializedAmount(provisionId: string): Promise<number>;
}
