"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InMemoryCategoryRepository_1 = require("../../../../src/infrastructure/persistence/in-memory/InMemoryCategoryRepository");
describe('InMemoryCategoryRepository', () => {
    let repository;
    beforeEach(() => {
        repository = new InMemoryCategoryRepository_1.InMemoryCategoryRepository();
    });
    describe('create', () => {
        it('should create and store a category', async () => {
            const input = {
                name: 'Food',
                period: '2025-01',
                monthlyBudget: 500,
                notes: 'Grocery budget',
            };
            const result = await repository.create(input);
            expect(result.id).toBeDefined();
            expect(result.name).toBe('Food');
            expect(result.period).toBe('2025-01');
            expect(result.monthlyBudget).toBe(500);
            expect(result.notes).toBe('Grocery budget');
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
        });
        it('should generate unique IDs', async () => {
            const input = {
                name: 'Test',
                period: '2025-01',
                monthlyBudget: 100,
            };
            const cat1 = await repository.create(input);
            const cat2 = await repository.create(input);
            expect(cat1.id).not.toBe(cat2.id);
        });
    });
    describe('findById', () => {
        it('should find category by ID', async () => {
            const created = await repository.create({
                name: 'Food',
                period: '2025-01',
                monthlyBudget: 500,
            });
            const found = await repository.findById(created.id);
            expect(found).not.toBeNull();
            expect(found?.id).toBe(created.id);
            expect(found?.name).toBe('Food');
        });
        it('should return null for non-existent ID', async () => {
            const found = await repository.findById('non-existent-id');
            expect(found).toBeNull();
        });
    });
    describe('findAll', () => {
        it('should return all categories', async () => {
            await repository.create({
                name: 'Food',
                period: '2025-01',
                monthlyBudget: 500,
            });
            await repository.create({
                name: 'Transport',
                period: '2025-01',
                monthlyBudget: 200,
            });
            const all = await repository.findAll();
            expect(all).toHaveLength(2);
            expect(all[0].name).toBe('Food');
            expect(all[1].name).toBe('Transport');
        });
        it('should return empty array when no categories', async () => {
            const all = await repository.findAll();
            expect(all).toHaveLength(0);
        });
    });
    describe('findByPeriod', () => {
        it('should find categories by period', async () => {
            await repository.create({
                name: 'Food',
                period: '2025-01',
                monthlyBudget: 500,
            });
            await repository.create({
                name: 'Transport',
                period: '2025-02',
                monthlyBudget: 200,
            });
            await repository.create({
                name: 'Utilities',
                period: '2025-01',
                monthlyBudget: 100,
            });
            const period01 = await repository.findByPeriod('2025-01');
            expect(period01).toHaveLength(2);
            expect(period01[0].name).toBe('Food');
            expect(period01[1].name).toBe('Utilities');
        });
        it('should return empty array for period with no categories', async () => {
            const result = await repository.findByPeriod('2025-12');
            expect(result).toHaveLength(0);
        });
    });
    describe('update', () => {
        it('should update category', async () => {
            const created = await repository.create({
                name: 'Food',
                period: '2025-01',
                monthlyBudget: 500,
            });
            // Small delay to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 1));
            const updated = await repository.update(created.id, {
                name: 'Groceries',
                monthlyBudget: 600,
            });
            expect(updated.id).toBe(created.id);
            expect(updated.name).toBe('Groceries');
            expect(updated.monthlyBudget).toBe(600);
            expect(updated.period).toBe('2025-01');
            expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
        });
        it('should throw for non-existent ID', async () => {
            await expect(repository.update('non-existent', { name: 'Test' })).rejects.toThrow('not found');
        });
        it('should support partial updates', async () => {
            const created = await repository.create({
                name: 'Food',
                period: '2025-01',
                monthlyBudget: 500,
                notes: 'Original notes',
            });
            const updated = await repository.update(created.id, {
                name: 'Groceries',
            });
            expect(updated.name).toBe('Groceries');
            expect(updated.monthlyBudget).toBe(500);
            expect(updated.notes).toBe('Original notes');
        });
    });
    describe('delete', () => {
        it('should delete category', async () => {
            const created = await repository.create({
                name: 'Food',
                period: '2025-01',
                monthlyBudget: 500,
            });
            await repository.delete(created.id);
            const found = await repository.findById(created.id);
            expect(found).toBeNull();
        });
        it('should throw for non-existent ID', async () => {
            await expect(repository.delete('non-existent')).rejects.toThrow('not found');
        });
    });
    describe('clear', () => {
        it('should clear all categories', async () => {
            await repository.create({
                name: 'Food',
                period: '2025-01',
                monthlyBudget: 500,
            });
            await repository.create({
                name: 'Transport',
                period: '2025-01',
                monthlyBudget: 200,
            });
            repository.clear();
            const all = await repository.findAll();
            expect(all).toHaveLength(0);
        });
    });
    describe('size', () => {
        it('should return number of categories', async () => {
            expect(repository.size()).toBe(0);
            await repository.create({
                name: 'Food',
                period: '2025-01',
                monthlyBudget: 500,
            });
            expect(repository.size()).toBe(1);
            await repository.create({
                name: 'Transport',
                period: '2025-01',
                monthlyBudget: 200,
            });
            expect(repository.size()).toBe(2);
        });
    });
});
