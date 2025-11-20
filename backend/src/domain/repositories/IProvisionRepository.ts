import { Provision, CreateProvisionDTO, UpdateProvisionDTO } from '../entities/Provision';

export interface IProvisionRepository {
  create(data: CreateProvisionDTO): Promise<Provision>;
  findById(id: string): Promise<Provision | null>;
  findAll(): Promise<Provision[]>;
  findByCategoryId(categoryId: string): Promise<Provision[]>;
  findOpenProvisions(): Promise<Provision[]>;
  findByIdWithUsedAmount(id: string): Promise<Provision | null>;
  findAllWithUsedAmount(): Promise<Provision[]>;
  findByCategoryIdWithUsedAmount(categoryId: string): Promise<Provision[]>;
  findOpenProvisionsWithUsedAmount(): Promise<Provision[]>;
  update(id: string, data: UpdateProvisionDTO): Promise<Provision>;
  delete(id: string): Promise<void>;
  calculateMaterializedAmount(provisionId: string): Promise<number>;
}
