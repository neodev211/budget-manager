import { ProvisionMapper } from '../../../../../src/infrastructure/persistence/prisma/mappers/ProvisionMapper';
import { Provision as ProvisionEntity, ProvisionStatus as PrismaProvisionStatus } from '@prisma/client';
import { Provision, ProvisionStatus } from '../../../../../src/domain/entities/Provision';
import { Money } from '../../../../../src/domain/value-objects/Money';

describe('ProvisionMapper', () => {
  // Mock Prisma Provision
  const mockPrismaProvision: ProvisionEntity = {
    id: 'prov-1',
    item: 'Car repair',
    categoryId: 'cat-1',
    amount: {
      toNumber: () => -500.0,
    } as any,
    dueDate: new Date('2025-03-31'),
    status: PrismaProvisionStatus.OPEN,
    notes: 'Engine check',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
  };

  // Mock Domain Provision
  const mockDomainProvision: Provision = {
    id: 'prov-1',
    item: 'Car repair',
    categoryId: 'cat-1',
    amount: -500.0,
    usedAmount: undefined,
    dueDate: new Date('2025-03-31'),
    status: ProvisionStatus.OPEN,
    notes: 'Engine check',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
  };

  describe('toDomain', () => {
    it('should convert Prisma Provision to Domain Provision', () => {
      const result = ProvisionMapper.toDomain(mockPrismaProvision);

      expect(result.id).toBe('prov-1');
      expect(result.item).toBe('Car repair');
      expect(result.categoryId).toBe('cat-1');
      expect(result.amount).toBe(-500.0);
      expect(result.usedAmount).toBeUndefined();
      expect(result.dueDate).toEqual(new Date('2025-03-31'));
      expect(result.status).toBe(ProvisionStatus.OPEN);
      expect(result.notes).toBe('Engine check');
    });

    it('should handle undefined notes', () => {
      const provisionWithoutNotes: ProvisionEntity = {
        ...mockPrismaProvision,
        notes: null,
      };

      const result = ProvisionMapper.toDomain(provisionWithoutNotes);
      expect(result.notes).toBeUndefined();
    });

    it('should convert all provision statuses', () => {
      const statuses = [PrismaProvisionStatus.OPEN, PrismaProvisionStatus.CLOSED];

      statuses.forEach(status => {
        const provision: ProvisionEntity = {
          ...mockPrismaProvision,
          status,
        };

        const result = ProvisionMapper.toDomain(provision);
        expect(result.status).toBe(status as ProvisionStatus);
      });
    });

    it('should convert Decimal to proper number', () => {
      const result = ProvisionMapper.toDomain(mockPrismaProvision);
      expect(result.amount).toBe(-500.0);
      expect(typeof result.amount).toBe('number');
    });

    it('should handle zero amount', () => {
      const zeroProvision: ProvisionEntity = {
        ...mockPrismaProvision,
        amount: { toNumber: () => 0 } as any,
      };

      const result = ProvisionMapper.toDomain(zeroProvision);
      expect(result.amount).toBe(0);
    });
  });

  describe('toDomainArray', () => {
    it('should convert array of Prisma Provisions to Domain Provisions', () => {
      const provisions = [
        mockPrismaProvision,
        {
          ...mockPrismaProvision,
          id: 'prov-2',
          item: 'Medical checkup',
          amount: { toNumber: () => -200 } as any,
        },
      ];

      const result = ProvisionMapper.toDomainArray(provisions);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('prov-1');
      expect(result[1].id).toBe('prov-2');
      expect(result[1].item).toBe('Medical checkup');
      expect(result[1].amount).toBe(-200);
    });

    it('should handle empty array', () => {
      const result = ProvisionMapper.toDomainArray([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('toPersistence', () => {
    it('should convert Domain Provision to Prisma format', () => {
      const result = ProvisionMapper.toPersistence(mockDomainProvision);

      expect(result.id).toBe('prov-1');
      expect(result.item).toBe('Car repair');
      expect(result.categoryId).toBe('cat-1');
      expect(result.amount).toBe(-500.0);
      expect(result.dueDate).toEqual(new Date('2025-03-31'));
      expect(result.status).toBe(ProvisionStatus.OPEN);
      expect(result.notes).toBe('Engine check');
    });

    it('should convert undefined notes to null', () => {
      const provisionWithoutNotes: Provision = {
        ...mockDomainProvision,
        notes: undefined,
      };

      const result = ProvisionMapper.toPersistence(provisionWithoutNotes);
      expect(result.notes).toBeNull();
    });
  });

  describe('getAmount', () => {
    it('should return Money value object', () => {
      const result = ProvisionMapper.getAmount(mockPrismaProvision);

      expect(result).toBeInstanceOf(Money);
      expect(result.value).toBe(-500.0);
    });

    it('should support arithmetic operations', () => {
      const amount = ProvisionMapper.getAmount(mockPrismaProvision);
      const half = amount.divide(2);

      expect(half.value).toBe(-250);
    });

    it('should correctly identify negative amount', () => {
      const amount = ProvisionMapper.getAmount(mockPrismaProvision);
      expect(amount.isNegative()).toBe(true);
    });
  });

  describe('isExpired', () => {
    it('should identify expired provision (past due date)', () => {
      const expiredProvision: ProvisionEntity = {
        ...mockPrismaProvision,
        dueDate: new Date('2020-01-01'),
      };

      const result = ProvisionMapper.isExpired(expiredProvision);
      expect(result).toBe(true);
    });

    it('should identify non-expired provision (future due date)', () => {
      const futureProvision: ProvisionEntity = {
        ...mockPrismaProvision,
        dueDate: new Date('2030-12-31'),
      };

      const result = ProvisionMapper.isExpired(futureProvision);
      expect(result).toBe(false);
    });

    it('should handle domain provision format', () => {
      const expiredProvision: Provision = {
        ...mockDomainProvision,
        dueDate: new Date('2020-01-01'),
      };

      const result = ProvisionMapper.isExpired(expiredProvision);
      expect(result).toBe(true);
    });
  });

  describe('isOpen', () => {
    it('should identify open provision', () => {
      const openProvision: ProvisionEntity = {
        ...mockPrismaProvision,
        status: PrismaProvisionStatus.OPEN,
      };

      const result = ProvisionMapper.isOpen(openProvision);
      expect(result).toBe(true);
    });

    it('should identify closed provision as not open', () => {
      const closedProvision: ProvisionEntity = {
        ...mockPrismaProvision,
        status: PrismaProvisionStatus.CLOSED,
      };

      const result = ProvisionMapper.isOpen(closedProvision);
      expect(result).toBe(false);
    });

    it('should handle domain provision format', () => {
      const result = ProvisionMapper.isOpen(mockDomainProvision);
      expect(result).toBe(true);
    });
  });

  describe('isClosed', () => {
    it('should identify closed provision', () => {
      const closedProvision: ProvisionEntity = {
        ...mockPrismaProvision,
        status: PrismaProvisionStatus.CLOSED,
      };

      const result = ProvisionMapper.isClosed(closedProvision);
      expect(result).toBe(true);
    });

    it('should identify open provision as not closed', () => {
      const openProvision: ProvisionEntity = {
        ...mockPrismaProvision,
        status: PrismaProvisionStatus.OPEN,
      };

      const result = ProvisionMapper.isClosed(openProvision);
      expect(result).toBe(false);
    });

    it('should handle domain provision format', () => {
      const closedProvision: Provision = {
        ...mockDomainProvision,
        status: ProvisionStatus.CLOSED,
      };

      const result = ProvisionMapper.isClosed(closedProvision);
      expect(result).toBe(true);
    });
  });

  describe('Round-trip conversion', () => {
    it('should convert Prisma → Domain → Prisma without data loss', () => {
      // Prisma → Domain
      const domain = ProvisionMapper.toDomain(mockPrismaProvision);

      // Domain → Prisma
      const persistence = ProvisionMapper.toPersistence(domain);

      expect(persistence.id).toBe(mockPrismaProvision.id);
      expect(persistence.item).toBe(mockPrismaProvision.item);
      expect(persistence.categoryId).toBe(mockPrismaProvision.categoryId);
      expect(persistence.amount).toBe(-500.0);
      expect(persistence.dueDate).toEqual(mockPrismaProvision.dueDate);
      expect(persistence.status).toBe(ProvisionStatus.OPEN);
      expect(persistence.notes).toBe(mockPrismaProvision.notes);
    });
  });

  describe('Edge cases', () => {
    it('should handle provision with special characters', () => {
      const specialProvision: ProvisionEntity = {
        ...mockPrismaProvision,
        item: 'Doctor @ Hospital "ABC"',
      };

      const result = ProvisionMapper.toDomain(specialProvision);
      expect(result.item).toBe('Doctor @ Hospital "ABC"');
    });

    it('should handle large negative amounts', () => {
      const largeProvision: ProvisionEntity = {
        ...mockPrismaProvision,
        amount: { toNumber: () => -99999.99 } as any,
      };

      const result = ProvisionMapper.toDomain(largeProvision);
      expect(result.amount).toBe(-99999.99);
    });

    it('should preserve exact decimal amounts', () => {
      const amounts = [-0.01, -0.5, -1.5, -99.99, -100.0];

      amounts.forEach(amount => {
        const provision: ProvisionEntity = {
          ...mockPrismaProvision,
          amount: { toNumber: () => amount } as any,
        };

        const result = ProvisionMapper.toDomain(provision);
        expect(result.amount).toBe(amount);
      });
    });

    it('should handle various due dates', () => {
      const dates = [
        new Date('2025-01-01'),
        new Date('2025-06-15'),
        new Date('2025-12-31'),
      ];

      dates.forEach(date => {
        const provision: ProvisionEntity = {
          ...mockPrismaProvision,
          dueDate: date,
        };

        const result = ProvisionMapper.toDomain(provision);
        expect(result.dueDate).toEqual(date);
      });
    });
  });

  describe('Status transitions', () => {
    it('should handle open to closed transition', () => {
      const openProvision = ProvisionMapper.toDomain(mockPrismaProvision);
      expect(ProvisionMapper.isOpen(openProvision)).toBe(true);
      expect(ProvisionMapper.isClosed(openProvision)).toBe(false);

      const closedProvision: Provision = {
        ...openProvision,
        status: ProvisionStatus.CLOSED,
      };

      expect(ProvisionMapper.isClosed(closedProvision)).toBe(true);
      expect(ProvisionMapper.isOpen(closedProvision)).toBe(false);
    });
  });

  describe('Value object integration', () => {
    it('should create Money for amount operations', () => {
      const provision = ProvisionMapper.toDomain(mockPrismaProvision);
      const money = new Money(provision.amount);

      expect(money.isNegative()).toBe(true);
      expect(money.value).toBe(-500.0);
    });

    it('should support complex money operations', () => {
      const amount1 = ProvisionMapper.getAmount(mockPrismaProvision);
      const amount2 = new Money(-250);

      const total = amount1.add(amount2);
      expect(total.value).toBe(-750);
    });
  });
});
