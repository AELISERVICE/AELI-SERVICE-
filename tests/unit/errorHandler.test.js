/**
 * Error Handler Middleware Unit Tests
 */

jest.mock('../../src/utils/logger', () => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
}));

const {
    AppError,
    errorHandler,
    notFound,
    asyncHandler
} = require('../../src/middlewares/errorHandler');

describe('Error Handler Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            originalUrl: '/api/test',
            method: 'GET',
            ip: '127.0.0.1'
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    describe('AppError', () => {
        it('should create a 4xx error with status "fail"', () => {
            const err = new AppError('Not found', 404);
            expect(err.message).toBe('Not found');
            expect(err.statusCode).toBe(404);
            expect(err.status).toBe('fail');
            expect(err.isOperational).toBe(true);
        });

        it('should create a 5xx error with status "error"', () => {
            const err = new AppError('Server error', 500);
            expect(err.statusCode).toBe(500);
            expect(err.status).toBe('error');
            expect(err.isOperational).toBe(true);
        });

        it('should be an instance of Error', () => {
            const err = new AppError('Test error', 400);
            expect(err).toBeInstanceOf(Error);
        });
    });

    describe('errorHandler - production mode', () => {
        const originalEnv = process.env.NODE_ENV;

        beforeEach(() => {
            process.env.NODE_ENV = 'production';
        });

        afterEach(() => {
            process.env.NODE_ENV = originalEnv;
        });

        it('should send operational error details to client', () => {
            const err = new AppError('Resource not found', 404);
            errorHandler(err, mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Resource not found'
            }));
        });

        it('should hide details for non-operational errors', () => {
            const err = new Error('Unexpected crash');
            err.statusCode = 500;
            errorHandler(err, mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Une erreur est survenue, veuillez réessayer'
            }));
        });

        it('should handle SequelizeValidationError', () => {
            const err = {
                name: 'SequelizeValidationError',
                message: 'Validation error',
                statusCode: 500,
                status: 'error',
                errors: [{ path: 'email', message: 'Email invalide' }]
            };
            errorHandler(err, mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Erreur de validation'
            }));
        });

        it('should handle SequelizeUniqueConstraintError', () => {
            const err = {
                name: 'SequelizeUniqueConstraintError',
                message: 'Unique constraint error',
                statusCode: 500,
                status: 'error',
                errors: [{ path: 'email' }]
            };
            errorHandler(err, mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: expect.stringContaining('email')
            }));
        });

        it('should handle SequelizeForeignKeyConstraintError', () => {
            const err = {
                name: 'SequelizeForeignKeyConstraintError',
                message: 'FK constraint',
                statusCode: 500,
                status: 'error'
            };
            errorHandler(err, mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: expect.stringContaining('Référence invalide')
            }));
        });

        it('should handle JsonWebTokenError', () => {
            const err = {
                name: 'JsonWebTokenError',
                message: 'invalid token',
                statusCode: 500,
                status: 'error'
            };
            errorHandler(err, mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: expect.stringContaining('Token invalide')
            }));
        });

        it('should handle TokenExpiredError', () => {
            const err = {
                name: 'TokenExpiredError',
                message: 'jwt expired',
                statusCode: 500,
                status: 'error'
            };
            errorHandler(err, mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: expect.stringContaining('session a expiré')
            }));
        });
    });

    describe('errorHandler - development mode', () => {
        const originalEnv = process.env.NODE_ENV;

        beforeEach(() => {
            process.env.NODE_ENV = 'development';
        });

        afterEach(() => {
            process.env.NODE_ENV = originalEnv;
        });

        it('should include stack trace in development', () => {
            const err = new AppError('Dev error', 400);
            errorHandler(err, mockReq, mockRes, mockNext);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Dev error',
                stack: expect.any(String)
            }));
        });
    });

    describe('notFound', () => {
        it('should call next with a 404 AppError', () => {
            notFound(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 404,
                message: expect.stringContaining('/api/test')
            }));
        });
    });

    describe('asyncHandler', () => {
        it('should call the wrapped function', async () => {
            const fn = jest.fn().mockResolvedValue('result');
            const wrapped = asyncHandler(fn);
            await wrapped(mockReq, mockRes, mockNext);
            expect(fn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        });

        it('should call next with error when function rejects', async () => {
            const error = new Error('Async error');
            const fn = jest.fn().mockRejectedValue(error);
            const wrapped = asyncHandler(fn);
            await wrapped(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
