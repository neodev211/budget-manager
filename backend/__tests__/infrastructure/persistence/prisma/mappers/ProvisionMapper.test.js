"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProvisionMapper_1 = require("../../../../../src/infrastructure/persistence/prisma/mappers/ProvisionMapper");
const client_1 = require("@prisma/client");
const Provision_1 = require("../../../../../src/domain/entities/Provision");
const Money_1 = require("../../../../../src/domain/value-objects/Money");
describe('ProvisionMapper', () => {
    // Mock Prisma Provision
    const mockPrismaProvision = {
        id: 'prov-1',
        item: 'Car repair',
        categoryId: 'cat-1',
        amount: {
            toNumber: () => -500.0,
        },
        dueDate: new Date('2025-03-31'),
        status: client_1.ProvisionStatus.OPEN,
        notes: 'Engine check',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
    };
    // Mock Domain Provision
    const mockDomainProvision = {
        id: 'prov-1',
        item: 'Car repair',
        categoryId: 'cat-1',
        amount: -500.0,
        usedAmount: undefined,
        dueDate: new Date('2025-03-31'),
        status: Provision_1.ProvisionStatus.OPEN,
        notes: 'Engine check',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
    };
    describe('toDomain', () => {
        it('should convert Prisma Provision to Domain Provision', () => {
            const result = ProvisionMapper_1.ProvisionMapper.toDomain(mockPrismaProvision);
            expect(result.id).toBe('prov-1');
            expect(result.item).toBe('Car repair');
            expect(result.categoryId).toBe('cat-1');
            expect(result.amount).toBe(-500.0);
            expect(result.usedAmount).toBeUndefined();
            expect(result.dueDate).toEqual(new Date('2025-03-31'));
            expect(result.status).toBe(Provision_1.ProvisionStatus.OPEN);
            expect(result.notes).toBe('Engine check');
        });
        it('should handle undefined notes', () => {
            const provisionWithoutNotes = {
                ...mockPrismaProvision,
                notes: null,
            };
            const result = ProvisionMapper_1.ProvisionMapper.toDomain(provisionWithoutNotes);
            expect(result.notes).toBeUndefined();
        });
        it('should convert all provision statuses', () => {
            const statuses = [client_1.ProvisionStatus.OPEN, client_1.ProvisionStatus.CLOSED];
            statuses.forEach(status => {
                const provision = {
                    ...mockPrismaProvision,
                    status,
                };
                const result = ProvisionMapper_1.ProvisionMapper.toDomain(provision);
                expect(result.status).toBe(status);
            });
        });
        it('should convert Decimal to proper number', () => {
            const result = ProvisionMapper_1.ProvisionMapper.toDomain(mockPrismaProvision);
            expect(result.amount).toBe(-500.0);
            expect(typeof result.amount).toBe('number');
        });
        it('should handle zero amount', () => {
            const zeroProvision = {
                ...mockPrismaProvision,
                amount: { toNumber: () => 0 },
            };
            const result = ProvisionMapper_1.ProvisionMapper.toDomain(zeroProvision);
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
                    amount: { toNumber: () => -200 },
                },
            ];
            const result = ProvisionMapper_1.ProvisionMapper.toDomainArray(provisions);
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('prov-1');
            expect(result[1].id).toBe('prov-2');
            expect(result[1].item).toBe('Medical checkup');
            expect(result[1].amount).toBe(-200);
        });
        it('should handle empty array', () => {
            const result = ProvisionMapper_1.ProvisionMapper.toDomainArray([]);
            expect(result).toHaveLength(0);
        });
    });
    describe('toPersistence', () => {
        it('should convert Domain Provision to Prisma format', () => {
            const result = ProvisionMapper_1.ProvisionMapper.toPersistence(mockDomainProvision);
            expect(result.id).toBe('prov-1');
            expect(result.item).toBe('Car repair');
            expect(result.categoryId).toBe('cat-1');
            expect(result.amount).toBe(-500.0);
            expect(result.dueDate).toEqual(new Date('2025-03-31'));
            expect(result.status).toBe(Provision_1.ProvisionStatus.OPEN);
            expect(result.notes).toBe('Engine check');
        });
        it('should convert undefined notes to null', () => {
            const provisionWithoutNotes = {
                ...mockDomainProvision,
                notes: undefined,
            };
            const result = ProvisionMapper_1.ProvisionMapper.toPersistence(provisionWithoutNotes);
            expect(result.notes).toBeNull();
        });
    });
    describe('getAmount', () => {
        it('should return Money value object', () => {
            const result = ProvisionMapper_1.ProvisionMapper.getAmount(mockPrismaProvision);
            expect(result).toBeInstanceOf(Money_1.Money);
            expect(result.value).toBe(-500.0);
        });
        it('should support arithmetic operations', () => {
            const amount = ProvisionMapper_1.ProvisionMapper.getAmount(mockPrismaProvision);
            const half = amount.divide(2);
            expect(half.value).toBe(-250);
        });
        it('should correctly identify negative amount', () => {
            const amount = ProvisionMapper_1.ProvisionMapper.getAmount(mockPrismaProvision);
            expect(amount.isNegative()).toBe(true);
        });
    });
    describe('isExpired', () => {
        it('should identify expired provision (past due date)', () => {
            const expiredProvision = {
                ...mockPrismaProvision,
                dueDate: new Date('2020-01-01'),
            };
            const result = ProvisionMapper_1.ProvisionMapper.isExpired(expiredProvision);
            expect(result).toBe(true);
        });
        it('should identify non-expired provision (future due date)', () => {
            const futureProvision = {
                ...mockPrismaProvision,
                dueDate: new Date('2030-12-31'),
            };
            const result = ProvisionMapper_1.ProvisionMapper.isExpired(futureProvision);
            expect(result).toBe(false);
        });
        it('should handle domain provision format', () => {
            const expiredProvision = {
                ...mockDomainProvision,
                dueDate: new Date('2020-01-01'),
            };
            const result = ProvisionMapper_1.ProvisionMapper.isExpired(expiredProvision);
            expect(result).toBe(true);
        });
    });
    describe('isOpen', () => {
        it('should identify open provision', () => {
            const openProvision = {
                ...mockPrismaProvision,
                status: client_1.ProvisionStatus.OPEN,
            };
            const result = ProvisionMapper_1.ProvisionMapper.isOpen(openProvision);
            expect(result).toBe(true);
        });
        it('should identify closed provision as not open', () => {
            const closedProvision = {
                ...mockPrismaProvision,
                status: client_1.ProvisionStatus.CLOSED,
            };
            const result = ProvisionMapper_1.ProvisionMapper.isOpen(closedProvision);
            expect(result).toBe(false);
        });
        it('should handle domain provision format', () => {
            const result = ProvisionMapper_1.ProvisionMapper.isOpen(mockDomainProvision);
            expect(result).toBe(true);
        });
    });
    describe('isClosed', () => {
        it('should identify closed provision', () => {
            const closedProvision = {
                ...mockPrismaProvision,
                status: client_1.ProvisionStatus.CLOSED,
            };
            const result = ProvisionMapper_1.ProvisionMapper.isClosed(closedProvision);
            expect(result).toBe(true);
        });
        it('should identify open provision as not closed', () => {
            const openProvision = {
                ...mockPrismaProvision,
                status: client_1.ProvisionStatus.OPEN,
            };
            const result = ProvisionMapper_1.ProvisionMapper.isClosed(openProvision);
            expect(result).toBe(false);
        });
        it('should handle domain provision format', () => {
            const closedProvision = {
                ...mockDomainProvision,
                status: Provision_1.ProvisionStatus.CLOSED,
            };
            const result = ProvisionMapper_1.ProvisionMapper.isClosed(closedProvision);
            expect(result).toBe(true);
        });
    });
    describe('Round-trip conversion', () => {
        it('should convert Prisma → Domain → Prisma without data loss', () => {
            // Prisma → Domain
            const domain = ProvisionMapper_1.ProvisionMapper.toDomain(mockPrismaProvision);
            // Domain → Prisma
            const persistence = ProvisionMapper_1.ProvisionMapper.toPersistence(domain);
            expect(persistence.id).toBe(mockPrismaProvision.id);
            expect(persistence.item).toBe(mockPrismaProvision.item);
            expect(persistence.categoryId).toBe(mockPrismaProvision.categoryId);
            expect(persistence.amount).toBe(-500.0);
            expect(persistence.dueDate).toEqual(mockPrismaProvision.dueDate);
            expect(persistence.status).toBe(Provision_1.ProvisionStatus.OPEN);
            expect(persistence.notes).toBe(mockPrismaProvision.notes);
        });
    });
    describe('Edge cases', () => {
        it('should handle provision with special characters', () => {
            const specialProvision = {
                ...mockPrismaProvision,
                item: 'Doctor @ Hospital "ABC"',
            };
            const result = ProvisionMapper_1.ProvisionMapper.toDomain(specialProvision);
            expect(result.item).toBe('Doctor @ Hospital "ABC"');
        });
        it('should handle large negative amounts', () => {
            const largeProvision = {
                ...mockPrismaProvision,
                amount: { toNumber: () => -99999.99 },
            };
            const result = ProvisionMapper_1.ProvisionMapper.toDomain(largeProvision);
            expect(result.amount).toBe(-99999.99);
        });
        it('should preserve exact decimal amounts', () => {
            const amounts = [-0.01, -0.5, -1.5, -99.99, -100.0];
            amounts.forEach(amount => {
                const provision = {
                    ...mockPrismaProvision,
                    amount: { toNumber: () => amount },
                };
                const result = ProvisionMapper_1.ProvisionMapper.toDomain(provision);
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
                const provision = {
                    ...mockPrismaProvision,
                    dueDate: date,
                };
                const result = ProvisionMapper_1.ProvisionMapper.toDomain(provision);
                expect(result.dueDate).toEqual(date);
            });
        });
    });
    describe('Status transitions', () => {
        it('should handle open to closed transition', () => {
            const openProvision = ProvisionMapper_1.ProvisionMapper.toDomain(mockPrismaProvision);
            expect(ProvisionMapper_1.ProvisionMapper.isOpen(openProvision)).toBe(true);
            expect(ProvisionMapper_1.ProvisionMapper.isClosed(openProvision)).toBe(false);
            const closedProvision = {
                ...openProvision,
                status: Provision_1.ProvisionStatus.CLOSED,
            };
            expect(ProvisionMapper_1.ProvisionMapper.isClosed(closedProvision)).toBe(true);
            expect(ProvisionMapper_1.ProvisionMapper.isOpen(closedProvision)).toBe(false);
        });
    });
    describe('Value object integration', () => {
        it('should create Money for amount operations', () => {
            const provision = ProvisionMapper_1.ProvisionMapper.toDomain(mockPrismaProvision);
            const money = new Money_1.Money(provision.amount);
            expect(money.isNegative()).toBe(true);
            expect(money.value).toBe(-500.0);
        });
        it('should support complex money operations', () => {
            const amount1 = ProvisionMapper_1.ProvisionMapper.getAmount(mockPrismaProvision);
            const amount2 = new Money_1.Money(-250);
            const total = amount1.add(amount2);
            expect(total.value).toBe(-750);
        });
    });
});
