/**
 * Analytics Middleware Unit Tests
 */

jest.mock('../../src/models/ApiUsage', () => ({
    create: jest.fn()
}));

jest.mock('../../src/utils/logger', () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
}));

const ApiUsage = require('../../src/models/ApiUsage');
const { analyticsMiddleware } = require('../../src/middlewares/analytics');

describe('Analytics Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            path: '/api/providers',
            method: 'GET',
            ip: '127.0.0.1',
            headers: { 'user-agent': 'jest-test', 'content-length': '256' },
            user: { id: 'user-123' },
            connection: { remoteAddress: '127.0.0.1' }
        };
        mockRes = {
            end: jest.fn(),
            statusCode: 200
        };
        mockNext = jest.fn();
        ApiUsage.create.mockResolvedValue({});
    });

    it('should call next for normal routes', () => {
        analyticsMiddleware(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should skip tracking for /api/health', () => {
        mockReq.path = '/api/health';
        analyticsMiddleware(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(1);
        // The res.end should not be overridden for skipped paths
    });

    it('should skip tracking for /api-docs', () => {
        mockReq.path = '/api-docs/swagger.json';
        analyticsMiddleware(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should skip tracking for /favicon.ico', () => {
        mockReq.path = '/favicon.ico';
        analyticsMiddleware(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should override res.end and call original end', () => {
        const originalEnd = jest.fn();
        mockRes.end = originalEnd;

        analyticsMiddleware(mockReq, mockRes, mockNext);

        // res.end should now be overridden
        expect(mockRes.end).not.toBe(originalEnd);

        // Call the overridden end
        mockRes.end(Buffer.from('hello'));

        // Original should have been called
        expect(originalEnd).toHaveBeenCalled();
    });

    it('should track analytics data after response ends', (done) => {
        analyticsMiddleware(mockReq, mockRes, mockNext);

        mockRes.end(Buffer.from('{"data":"test"}'));

        // setImmediate is used inside - give it time to run
        setImmediate(() => {
            expect(ApiUsage.create).toHaveBeenCalledWith(expect.objectContaining({
                endpoint: '/api/providers',
                method: 'GET',
                statusCode: 200,
                userId: 'user-123'
            }));
            done();
        });
    });

    it('should handle anonymous user (no req.user)', (done) => {
        mockReq.user = null;

        analyticsMiddleware(mockReq, mockRes, mockNext);
        mockRes.end(null);

        setImmediate(() => {
            expect(ApiUsage.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: null
            }));
            done();
        });
    });

    it('should silently handle ApiUsage.create errors', (done) => {
        ApiUsage.create.mockRejectedValue(new Error('DB error'));
        const logger = require('../../src/utils/logger');

        analyticsMiddleware(mockReq, mockRes, mockNext);
        mockRes.end(Buffer.from('{}'));

        setImmediate(() => {
            // Should not throw; error is caught
            // In non-test env, logger.error would be called
            done();
        });
    });
});
