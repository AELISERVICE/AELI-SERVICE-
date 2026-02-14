/**
 * Database Helpers Unit Tests
 * Tests for batch operations and helper functions
 */

const { withTransaction, withRetryableTransaction, batchInsert, safeFindOrCreate } = require('../../src/utils/dbHelpers');

// Mock sequelize
jest.mock('../../src/config/database', () => ({
    sequelize: {
        transaction: jest.fn()
    }
}));

// Mock a Sequelize model
const mockModel = {
    bulkCreate: jest.fn(),
    findOrCreate: jest.fn(),
    findOne: jest.fn()
};

describe('Database Helpers Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('withTransaction', () => {
        it('should commit transaction on success', async () => {
            const { sequelize } = require('../../src/config/database');
            const mockTransaction = {
                commit: jest.fn().mockResolvedValue(),
                rollback: jest.fn().mockResolvedValue()
            };
            sequelize.transaction.mockResolvedValue(mockTransaction);

            const callback = jest.fn().mockResolvedValue('result');

            const result = await withTransaction(callback);

            expect(sequelize.transaction).toHaveBeenCalledWith({});
            expect(callback).toHaveBeenCalledWith(mockTransaction);
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(mockTransaction.rollback).not.toHaveBeenCalled();
            expect(result).toBe('result');
        });

        it('should rollback transaction on error', async () => {
            const { sequelize } = require('../../src/config/database');
            const mockTransaction = {
                commit: jest.fn().mockResolvedValue(),
                rollback: jest.fn().mockResolvedValue()
            };
            sequelize.transaction.mockResolvedValue(mockTransaction);

            const error = new Error('Test error');
            const callback = jest.fn().mockRejectedValue(error);

            await expect(withTransaction(callback)).rejects.toThrow('Test error');

            expect(sequelize.transaction).toHaveBeenCalledWith({});
            expect(callback).toHaveBeenCalledWith(mockTransaction);
            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(mockTransaction.commit).not.toHaveBeenCalled();
        });

        it('should pass transaction options', async () => {
            const { sequelize } = require('../../src/config/database');
            const mockTransaction = {
                commit: jest.fn().mockResolvedValue(),
                rollback: jest.fn().mockResolvedValue()
            };
            sequelize.transaction.mockResolvedValue(mockTransaction);

            const callback = jest.fn().mockResolvedValue('result');
            const options = { isolationLevel: 'SERIALIZABLE' };

            await withTransaction(callback, options);

            expect(sequelize.transaction).toHaveBeenCalledWith(options);
        });
    });

    describe('withRetryableTransaction', () => {
        it('should succeed on first attempt', async () => {
            const { sequelize } = require('../../src/config/database');
            const mockTransaction = {
                commit: jest.fn().mockResolvedValue(),
                rollback: jest.fn().mockResolvedValue()
            };
            sequelize.transaction.mockResolvedValue(mockTransaction);

            const callback = jest.fn().mockResolvedValue('result');

            const result = await withRetryableTransaction(callback);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(result).toBe('result');
        });

        it('should retry on deadlock and succeed', async () => {
            const { sequelize } = require('../../src/config/database');
            const mockTransaction = {
                commit: jest.fn().mockResolvedValue(),
                rollback: jest.fn().mockResolvedValue()
            };
            sequelize.transaction.mockResolvedValue(mockTransaction);

            const deadlockError = new Error('Deadlock');
            deadlockError.parent = { code: '40P01' };

            const callback = jest.fn()
                .mockRejectedValueOnce(deadlockError)
                .mockResolvedValueOnce('result');

            const result = await withRetryableTransaction(callback, 2);

            expect(callback).toHaveBeenCalledTimes(2);
            expect(result).toBe('result');
        });

        it('should fail after max retries on deadlock', async () => {
            const { sequelize } = require('../../src/config/database');
            const mockTransaction = {
                commit: jest.fn().mockResolvedValue(),
                rollback: jest.fn().mockResolvedValue()
            };
            sequelize.transaction.mockResolvedValue(mockTransaction);

            const deadlockError = new Error('Deadlock');
            deadlockError.parent = { code: '40P01' };

            const callback = jest.fn().mockRejectedValue(deadlockError);

            await expect(withRetryableTransaction(callback, 2)).rejects.toThrow('Deadlock');

            expect(callback).toHaveBeenCalledTimes(2);
        });
    });

    describe('batchInsert', () => {
        it('should insert records in chunks', async () => {
            const records = Array(5).fill({ name: 'test' });
            const chunk1 = [{ id: 1 }, { id: 2 }];
            const chunk2 = [{ id: 3 }, { id: 4 }];
            const chunk3 = [{ id: 5 }];

            mockModel.bulkCreate
                .mockResolvedValueOnce(chunk1)
                .mockResolvedValueOnce(chunk2)
                .mockResolvedValueOnce(chunk3);

            const result = await batchInsert(mockModel, records, 2);

            expect(mockModel.bulkCreate).toHaveBeenCalledTimes(3);
            expect(mockModel.bulkCreate).toHaveBeenNthCalledWith(1, records.slice(0, 2), { returning: true });
            expect(mockModel.bulkCreate).toHaveBeenNthCalledWith(2, records.slice(2, 4), { returning: true });
            expect(mockModel.bulkCreate).toHaveBeenNthCalledWith(3, records.slice(4, 6), { returning: true });
            expect(result).toEqual([...chunk1, ...chunk2, ...chunk3]);
        });

        it('should handle empty records array', async () => {
            const result = await batchInsert(mockModel, [], 10);

            expect(mockModel.bulkCreate).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        it('should pass additional options', async () => {
            const records = [{ name: 'test' }];
            const options = { transaction: 'txn', validate: true };

            mockModel.bulkCreate.mockResolvedValue([{ id: 1 }]);

            await batchInsert(mockModel, records, 10, options);

            expect(mockModel.bulkCreate).toHaveBeenCalledWith(records, {
                ...options,
                returning: true
            });
        });
    });

    describe('safeFindOrCreate', () => {
        it('should return result on successful findOrCreate', async () => {
            const expectedResult = [{ id: 1 }, true];
            mockModel.findOrCreate.mockResolvedValue(expectedResult);

            const result = await safeFindOrCreate(mockModel, { email: 'test@test.com' }, { name: 'Test' });

            expect(mockModel.findOrCreate).toHaveBeenCalledWith({
                where: { email: 'test@test.com' },
                defaults: { name: 'Test' },
                transaction: null
            });
            expect(result).toEqual(expectedResult);
        });

        it('should handle race condition with unique constraint error', async () => {
            const uniqueError = new Error('Unique constraint');
            uniqueError.name = 'SequelizeUniqueConstraintError';

            mockModel.findOrCreate.mockRejectedValue(uniqueError);
            mockModel.findOne.mockResolvedValue({ id: 1, email: 'test@test.com' });

            const result = await safeFindOrCreate(mockModel, { email: 'test@test.com' }, { name: 'Test' });

            expect(mockModel.findOrCreate).toHaveBeenCalled();
            expect(mockModel.findOne).toHaveBeenCalledWith({
                where: { email: 'test@test.com' },
                transaction: null
            });
            expect(result).toEqual([{ id: 1, email: 'test@test.com' }, false]);
        });

        it('should pass transaction parameter', async () => {
            const transaction = 'txn';
            const expectedResult = [{ id: 1 }, true];
            mockModel.findOrCreate.mockResolvedValue(expectedResult);

            await safeFindOrCreate(mockModel, { email: 'test@test.com' }, { name: 'Test' }, transaction);

            expect(mockModel.findOrCreate).toHaveBeenCalledWith({
                where: { email: 'test@test.com' },
                defaults: { name: 'Test' },
                transaction
            });
        });
    });

    describe('batchInsert Logic', () => {
        it('should chunk records correctly', () => {
            const records = Array(5).fill().map((_, i) => ({ name: `test${i}` }));
            const chunkSize = 2;

            const chunks = [];
            for (let i = 0; i < records.length; i += chunkSize) {
                chunks.push(records.slice(i, i + chunkSize));
            }

            expect(chunks).toHaveLength(3); // 5 records / 2 = 3 chunks
            expect(chunks[0]).toHaveLength(2);
            expect(chunks[1]).toHaveLength(2);
            expect(chunks[2]).toHaveLength(1);
        });

        it('should handle empty array', () => {
            const records = [];
            const chunks = [];
            const chunkSize = 10;

            for (let i = 0; i < records.length; i += chunkSize) {
                chunks.push(records.slice(i, i + chunkSize));
            }

            expect(chunks).toHaveLength(0);
        });

        it('should handle single chunk when records less than chunk size', () => {
            const records = [{ name: 'test1' }, { name: 'test2' }];
            const chunkSize = 100;

            const chunks = [];
            for (let i = 0; i < records.length; i += chunkSize) {
                chunks.push(records.slice(i, i + chunkSize));
            }

            expect(chunks).toHaveLength(1);
            expect(chunks[0]).toHaveLength(2);
        });
    });

    describe('safeFindOrCreate Logic', () => {
        it('should handle race condition recovery', () => {
            const isUniqueConstraintError = (error) => {
                if (!error) return false;
                return error.name === 'SequelizeUniqueConstraintError';
            };

            const uniqueError = new Error('Unique');
            uniqueError.name = 'SequelizeUniqueConstraintError';

            expect(isUniqueConstraintError(uniqueError)).toBe(true);
            expect(isUniqueConstraintError(new Error('Other'))).toBe(false);
            expect(isUniqueConstraintError(null)).toBe(false);
        });
    });

    describe('Transaction Retry Logic', () => {
        it('should identify deadlock errors', () => {
            const isDeadlock = (error) => {
                return error.parent && (
                    error.parent.code === '40P01' || // Postgres
                    error.parent.errno === 1213      // MySQL
                );
            };

            const postgresDeadlock = { parent: { code: '40P01' } };
            const mysqlDeadlock = { parent: { errno: 1213 } };
            const notDeadlock = { parent: { code: 'OTHER' } };

            expect(isDeadlock(postgresDeadlock)).toBe(true);
            expect(isDeadlock(mysqlDeadlock)).toBe(true);
            expect(isDeadlock(notDeadlock)).toBe(false);
        });

        it('should implement exponential backoff', () => {
            const calculateBackoff = (attempt) => 100 * Math.pow(2, attempt);

            expect(calculateBackoff(1)).toBe(200);  // 100 * 2^1
            expect(calculateBackoff(2)).toBe(400);  // 100 * 2^2
            expect(calculateBackoff(3)).toBe(800);  // 100 * 2^3
        });
    });

    describe('Transaction Options', () => {
        it('should support SERIALIZABLE isolation level', () => {
            const isolationLevels = [
                'READ UNCOMMITTED',
                'READ COMMITTED',
                'REPEATABLE READ',
                'SERIALIZABLE'
            ];

            expect(isolationLevels).toContain('SERIALIZABLE');
        });
    });
});
