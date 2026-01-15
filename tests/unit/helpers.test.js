/**
 * Unit tests for helpers utility functions
 */

const {
    successResponse,
    getPaginationParams,
    getPaginationData,
    buildSortOrder,
    parseBoolean,
    extractPhotoUrls
} = require('../../src/utils/helpers');

// Mock response object
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Helpers Utility Functions', () => {
    describe('successResponse', () => {
        it('should return success response with data', () => {
            const res = mockRes();
            successResponse(res, 200, 'Success', { id: 1 });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Success',
                data: { id: 1 }
            });
        });

        it('should return success response without data', () => {
            const res = mockRes();
            successResponse(res, 201, 'Created');

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Created'
            });
        });
    });

    describe('getPaginationParams', () => {
        it('should return correct limit and offset', () => {
            expect(getPaginationParams(1, 10)).toEqual({ limit: 10, offset: 0 });
            expect(getPaginationParams(2, 10)).toEqual({ limit: 10, offset: 10 });
            expect(getPaginationParams(3, 20)).toEqual({ limit: 20, offset: 40 });
        });

        it('should handle string inputs', () => {
            expect(getPaginationParams('2', '15')).toEqual({ limit: 15, offset: 15 });
        });

        it('should cap limit at 50', () => {
            expect(getPaginationParams(1, 100)).toEqual({ limit: 50, offset: 0 });
        });

        it('should use defaults for invalid inputs', () => {
            expect(getPaginationParams('invalid', 'bad')).toEqual({ limit: 12, offset: 0 });
            expect(getPaginationParams(-1, -5)).toEqual({ limit: 1, offset: 0 }); // Math.max(1, -5) = 1
        });
    });

    describe('getPaginationData', () => {
        it('should calculate pagination correctly', () => {
            const result = getPaginationData(1, 10, 100);
            expect(result).toEqual({
                currentPage: 1,
                totalPages: 10,
                totalItems: 100,
                itemsPerPage: 10,
                hasNextPage: true,
                hasPrevPage: false
            });
        });

        it('should handle last page', () => {
            const result = getPaginationData(5, 10, 50);
            expect(result).toEqual({
                currentPage: 5,
                totalPages: 5,
                totalItems: 50,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPrevPage: true
            });
        });

        it('should handle single page', () => {
            const result = getPaginationData(1, 10, 5);
            expect(result).toEqual({
                currentPage: 1,
                totalPages: 1,
                totalItems: 5,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPrevPage: false
            });
        });

        it('should handle zero items', () => {
            const result = getPaginationData(1, 10, 0);
            expect(result).toEqual({
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10,
                hasNextPage: false,
                hasPrevPage: false
            });
        });
    });

    describe('buildSortOrder', () => {
        it('should build sort order for common fields', () => {
            expect(buildSortOrder('rating')).toEqual([['average_rating', 'DESC']]);
            expect(buildSortOrder('recent')).toEqual([['created_at', 'DESC']]);
            expect(buildSortOrder('views')).toEqual([['views_count', 'DESC']]);
            expect(buildSortOrder('name')).toEqual([['business_name', 'ASC']]);
        });

        it('should default to recent for unknown sort', () => {
            expect(buildSortOrder('unknown')).toEqual([['created_at', 'DESC']]);
            expect(buildSortOrder('')).toEqual([['created_at', 'DESC']]);
        });
    });

    describe('parseBoolean', () => {
        it('should parse true values', () => {
            expect(parseBoolean('true')).toBe(true);
            expect(parseBoolean('1')).toBe(true);
            expect(parseBoolean(true)).toBe(true);
            expect(parseBoolean(1)).toBe(true);
        });

        it('should parse false values', () => {
            expect(parseBoolean('false')).toBe(false);
            expect(parseBoolean('0')).toBe(false);
            expect(parseBoolean(false)).toBe(false);
            expect(parseBoolean(0)).toBe(false);
        });

        it('should return undefined for invalid inputs', () => {
            expect(parseBoolean('maybe')).toBeUndefined();
            expect(parseBoolean('yes')).toBeUndefined();
            expect(parseBoolean('no')).toBeUndefined();
            expect(parseBoolean(null)).toBeUndefined();
            expect(parseBoolean(undefined)).toBeUndefined();
        });
    });

    describe('extractPhotoUrls', () => {
        it('should extract URLs from uploaded files', () => {
            const files = [
                { path: 'http://example.com/photo1.jpg' },
                { path: 'http://example.com/photo2.jpg' }
            ];
            expect(extractPhotoUrls(files)).toEqual([
                'http://example.com/photo1.jpg',
                'http://example.com/photo2.jpg'
            ]);
        });

        it('should return empty array for no files', () => {
            expect(extractPhotoUrls(null)).toEqual([]);
            expect(extractPhotoUrls(undefined)).toEqual([]);
            expect(extractPhotoUrls([])).toEqual([]);
        });
    });
});
