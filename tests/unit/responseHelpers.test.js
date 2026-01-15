/**
 * Response Helpers Unit Tests
 * Tests for pagination and response formatting utilities
 */

const {
    getPaginationParams,
    getPaginationData,
    buildSortOrder,
    formatPrice,
    extractPhotoUrls,
    cleanPhoneNumber,
    parseBoolean
} = require('../../src/utils/helpers');

describe('Response Helpers', () => {
    describe('getPaginationParams', () => {
        it('should return default values for page 1', () => {
            const result = getPaginationParams(1, 10);
            expect(result).toEqual({ limit: 10, offset: 0 });
        });

        it('should calculate correct offset for page 2', () => {
            const result = getPaginationParams(2, 10);
            expect(result).toEqual({ limit: 10, offset: 10 });
        });

        it('should calculate correct offset for page 3 with limit 20', () => {
            const result = getPaginationParams(3, 20);
            expect(result).toEqual({ limit: 20, offset: 40 });
        });

        it('should handle string inputs', () => {
            const result = getPaginationParams('2', '15');
            expect(result).toEqual({ limit: 15, offset: 15 });
        });

        it('should enforce maximum limit of 50', () => {
            const result = getPaginationParams(1, 500);
            expect(result.limit).toBe(50);
        });

        it('should enforce minimum limit of 1', () => {
            const result = getPaginationParams(1, 0);
            expect(result.limit).toBeGreaterThanOrEqual(1);
        });

        it('should use default values when not provided', () => {
            const result = getPaginationParams();
            expect(result.limit).toBe(12);
            expect(result.offset).toBe(0);
        });
    });

    describe('getPaginationData', () => {
        it('should calculate total pages correctly', () => {
            const result = getPaginationData(1, 10, 45);
            expect(result.totalPages).toBe(5);
            expect(result.totalItems).toBe(45);
            expect(result.currentPage).toBe(1);
        });

        it('should handle exact page divisions', () => {
            const result = getPaginationData(1, 10, 30);
            expect(result.totalPages).toBe(3);
        });

        it('should indicate hasNextPage correctly', () => {
            const page1 = getPaginationData(1, 10, 25);
            expect(page1.hasNextPage).toBe(true);

            const lastPage = getPaginationData(3, 10, 25);
            expect(lastPage.hasNextPage).toBe(false);
        });

        it('should indicate hasPrevPage correctly', () => {
            const page1 = getPaginationData(1, 10, 25);
            expect(page1.hasPrevPage).toBe(false);

            const page2 = getPaginationData(2, 10, 25);
            expect(page2.hasPrevPage).toBe(true);
        });

        it('should handle empty results', () => {
            const result = getPaginationData(1, 10, 0);
            expect(result.totalPages).toBe(0);
            expect(result.totalItems).toBe(0);
            expect(result.hasNextPage).toBe(false);
        });
    });

    describe('buildSortOrder', () => {
        it('should return recent sort (snake_case) by default', () => {
            const result = buildSortOrder('recent');
            expect(result).toEqual([['created_at', 'DESC']]);
        });

        it('should handle rating sort', () => {
            const result = buildSortOrder('rating');
            expect(result).toEqual([['average_rating', 'DESC']]);
        });

        it('should handle views sort', () => {
            const result = buildSortOrder('views');
            expect(result).toEqual([['views_count', 'DESC']]);
        });

        it('should handle name sort', () => {
            const result = buildSortOrder('name');
            expect(result).toEqual([['business_name', 'ASC']]);
        });

        it('should handle unknown sort with default', () => {
            const result = buildSortOrder('unknown');
            expect(result).toEqual([['created_at', 'DESC']]);
        });
    });

    describe('formatPrice', () => {
        it('should format XAF currency', () => {
            const result = formatPrice(5000);
            expect(result).toContain('5');
        });

        it('should return "Sur demande" for zero/null', () => {
            expect(formatPrice(0)).toBe('Sur demande');
            expect(formatPrice(null)).toBe('Sur demande');
        });

        it('should handle large amounts', () => {
            const result = formatPrice(1000000);
            expect(result).toContain('1');
        });
    });

    describe('extractPhotoUrls', () => {
        it('should extract path from files array', () => {
            const files = [
                { path: 'https://cdn.com/photo1.jpg' },
                { path: 'https://cdn.com/photo2.jpg' }
            ];

            const result = extractPhotoUrls(files);
            expect(result).toEqual([
                'https://cdn.com/photo1.jpg',
                'https://cdn.com/photo2.jpg'
            ]);
        });

        it('should handle empty files array', () => {
            const result = extractPhotoUrls([]);
            expect(result).toEqual([]);
        });

        it('should handle undefined files', () => {
            const result = extractPhotoUrls(undefined);
            expect(result).toEqual([]);
        });

        it('should fallback to secure_url if path missing', () => {
            const files = [
                { secure_url: 'https://cdn.com/photo1.jpg' }
            ];

            const result = extractPhotoUrls(files);
            expect(result).toHaveLength(1);
        });
    });

    describe('cleanPhoneNumber', () => {
        it('should remove spaces and dashes', () => {
            expect(cleanPhoneNumber('+237 6 99 12 34 56')).toBe('+237699123456');
            expect(cleanPhoneNumber('699-123-456')).toBe('699123456');
        });

        it('should handle null/undefined', () => {
            expect(cleanPhoneNumber(null)).toBe(null);
            expect(cleanPhoneNumber(undefined)).toBe(null);
        });
    });

    describe('parseBoolean', () => {
        it('should parse truthy values', () => {
            expect(parseBoolean(true)).toBe(true);
            expect(parseBoolean('true')).toBe(true);
            expect(parseBoolean('1')).toBe(true);
            expect(parseBoolean(1)).toBe(true);
        });

        it('should parse falsy values', () => {
            expect(parseBoolean(false)).toBe(false);
            expect(parseBoolean('false')).toBe(false);
            expect(parseBoolean('0')).toBe(false);
            expect(parseBoolean(0)).toBe(false);
        });

        it('should return undefined for invalid values', () => {
            expect(parseBoolean('maybe')).toBe(undefined);
            expect(parseBoolean(null)).toBe(undefined);
        });
    });
});
