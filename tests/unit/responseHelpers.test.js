/**
 * Response Helpers Unit Tests
 * Tests for pagination and response formatting utilities
 */

const { parsePagination, buildPaginationInfo, successResponse, paginatedResponse, errorResponse } = require('../../src/utils/responseHelpers');

describe('Response Helpers', () => {
    let mockRes;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('parsePagination', () => {
        it('should return default values for empty query', () => {
            const result = parsePagination({});

            expect(result).toEqual({
                page: 1,
                limit: 20,
                offset: 0
            });
        });

        it('should parse page and limit from query', () => {
            const result = parsePagination({ page: '2', limit: '10' });

            expect(result).toEqual({
                page: 2,
                limit: 10,
                offset: 10
            });
        });

        it('should handle string inputs', () => {
            const result = parsePagination({ page: '3', limit: '5' });

            expect(result).toEqual({
                page: 3,
                limit: 5,
                offset: 10
            });
        });

        it('should enforce minimum values', () => {
            const result = parsePagination({ page: '0', limit: '-5' });

            expect(result).toEqual({
                page: 1,
                limit: 1,
                offset: 0
            });
        });

        it('should enforce maximum limit', () => {
            const result = parsePagination({ limit: '200' }, { maxLimit: 50 });

            expect(result).toEqual({
                page: 1,
                limit: 50,
                offset: 0
            });
        });

        it('should use custom defaults', () => {
            const result = parsePagination({}, { page: 2, limit: 15, maxLimit: 30 });

            expect(result).toEqual({
                page: 2,
                limit: 15,
                offset: 15
            });
        });
    });

    describe('buildPaginationInfo', () => {
        it('should calculate pagination info correctly', () => {
            const result = buildPaginationInfo(100, 2, 10);

            expect(result).toEqual({
                currentPage: 2,
                totalPages: 10,
                totalItems: 100,
                limit: 10,
                hasNextPage: true,
                hasPrevPage: true
            });
        });

        it('should handle first page', () => {
            const result = buildPaginationInfo(50, 1, 10);

            expect(result).toEqual({
                currentPage: 1,
                totalPages: 5,
                totalItems: 50,
                limit: 10,
                hasNextPage: true,
                hasPrevPage: false
            });
        });

        it('should handle last page', () => {
            const result = buildPaginationInfo(50, 5, 10);

            expect(result).toEqual({
                currentPage: 5,
                totalPages: 5,
                totalItems: 50,
                limit: 10,
                hasNextPage: false,
                hasPrevPage: true
            });
        });

        it('should handle single page', () => {
            const result = buildPaginationInfo(5, 1, 10);

            expect(result).toEqual({
                currentPage: 1,
                totalPages: 1,
                totalItems: 5,
                limit: 10,
                hasNextPage: false,
                hasPrevPage: false
            });
        });

        it('should handle zero items', () => {
            const result = buildPaginationInfo(0, 1, 10);

            expect(result).toEqual({
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                limit: 10,
                hasNextPage: false,
                hasPrevPage: false
            });
        });
    });

    describe('successResponse', () => {
        it('should return success response with data', () => {
            const data = { user: { id: 1, name: 'Test' } };

            const result = successResponse(mockRes, 200, 'Success message', data);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Success message',
                user: { id: 1, name: 'Test' }
            });
            expect(result).toBe(mockRes);
        });

        it('should return success response without data', () => {
            const result = successResponse(mockRes, 201, 'Created');

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Created'
            });
            expect(result).toBe(mockRes);
        });

        it('should include pagination when provided', () => {
            const pagination = { currentPage: 1, totalPages: 5 };
            const options = { pagination };

            const result = successResponse(mockRes, 200, 'List retrieved', { items: [] }, options);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'List retrieved',
                items: [],
                pagination
            });
        });
    });

    describe('paginatedResponse', () => {
        it('should return paginated response with default items key', () => {
            const items = [{ id: 1 }, { id: 2 }];
            const totalCount = 50;
            const page = 2;
            const limit = 10;

            const result = paginatedResponse(mockRes, 'Items retrieved', items, totalCount, page, limit);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Items retrieved',
                items,
                pagination: {
                    currentPage: 2,
                    totalPages: 5,
                    totalItems: 50,
                    limit: 10,
                    hasNextPage: true,
                    hasPrevPage: true
                }
            });
            expect(result).toBe(mockRes);
        });

        it('should use custom items key', () => {
            const users = [{ id: 1 }];
            const result = paginatedResponse(mockRes, 'Users retrieved', users, 10, 1, 5, 'users');

            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Users retrieved',
                users,
                pagination: {
                    currentPage: 1,
                    totalPages: 2,
                    totalItems: 10,
                    limit: 5,
                    hasNextPage: true,
                    hasPrevPage: false
                }
            });
        });
    });

    describe('errorResponse', () => {
        it('should return error response without errors', () => {
            const result = errorResponse(mockRes, 400, 'Bad request');

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Bad request'
            });
            expect(result).toBe(mockRes);
        });

        it('should return error response with errors', () => {
            const errors = { email: 'Invalid email format' };

            const result = errorResponse(mockRes, 422, 'Validation failed', errors);

            expect(mockRes.status).toHaveBeenCalledWith(422);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Validation failed',
                errors
            });
            expect(result).toBe(mockRes);
        });
    });
});
