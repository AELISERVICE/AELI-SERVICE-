/**
 * Export Controller Unit Tests
 * Tests for export-related endpoints
 */

const {
    exportUsersCSV,
    exportProvidersCSV,
    exportReviewsCSV,
    exportContactsCSV,
    exportReportPDF
} = require('../../src/controllers/exportController');

// Mock dependencies
jest.mock('json2csv', () => ({
    Parser: jest.fn().mockImplementation(() => ({
        parse: jest.fn()
    }))
}));

jest.mock('pdfkit');

jest.mock('../../src/models', () => ({
    User: {
        findAll: jest.fn(),
        count: jest.fn()
    },
    Provider: {
        findAll: jest.fn(),
        count: jest.fn()
    },
    Review: {
        findAll: jest.fn(),
        count: jest.fn()
    },
    Contact: {
        findAll: jest.fn(),
        count: jest.fn()
    }
}));

jest.mock('../../src/middlewares/errorHandler', () => ({
    asyncHandler: (fn) => (req, res, next) => fn(req, res, next),
    AppError: class extends Error {
        constructor(message, statusCode) {
            super(message);
            this.statusCode = statusCode;
        }
    }
}));

jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const { User, Provider, Review, Contact } = require('../../src/models');

describe('Export Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            query: {},
            t: jest.fn((key) => key)
        };

        mockRes = {
            setHeader: jest.fn(),
            send: jest.fn(),
            pipe: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        mockNext = jest.fn();

        // Setup default mocks
        Parser.mockImplementation(() => ({
            parse: jest.fn().mockReturnValue('csv,data')
        }));

        const mockDoc = {
            pipe: jest.fn(),
            fontSize: jest.fn().mockReturnThis(),
            text: jest.fn().mockReturnThis(),
            moveDown: jest.fn().mockReturnThis(),
            fillColor: jest.fn().mockReturnThis(),
            end: jest.fn()
        };
        PDFDocument.mockImplementation(() => mockDoc);
    });

    describe('exportUsersCSV', () => {
        it('should export users to CSV successfully', async () => {
            const mockUsers = [
                { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
            ];

            User.findAll.mockResolvedValue(mockUsers);

            await exportUsersCSV(mockReq, mockRes, mockNext);

            expect(User.findAll).toHaveBeenCalledWith({
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'isActive', 'createdAt'],
                order: [['createdAt', 'DESC']],
                raw: true
            });
            expect(Parser).toHaveBeenCalledWith({
                fields: ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'isActive', 'createdAt']
            });
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=users.csv');
            expect(mockRes.send).toHaveBeenCalledWith('csv,data');
        });
    });

    describe('exportProvidersCSV', () => {
        it('should export providers to CSV successfully', async () => {
            const mockProviders = [
                { id: '1', businessName: 'Test Provider', averageRating: 4.5 }
            ];

            Provider.findAll.mockResolvedValue(mockProviders);

            await exportProvidersCSV(mockReq, mockRes, mockNext);

            expect(Provider.findAll).toHaveBeenCalledWith({
                attributes: [
                    'id', 'businessName', 'location', 'averageRating', 'totalReviews',
                    'viewsCount', 'contactsCount', 'isVerified', 'isFeatured', 'createdAt'
                ],
                order: [['createdAt', 'DESC']],
                raw: true
            });
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=providers.csv');
            expect(mockRes.send).toHaveBeenCalledWith('csv,data');
        });
    });

    describe('exportReviewsCSV', () => {
        it('should export reviews to CSV successfully', async () => {
            const mockReviews = [
                {
                    id: '1',
                    rating: 5,
                    comment: 'Great service',
                    user: { firstName: 'John', lastName: 'Doe' },
                    provider: { businessName: 'Test Provider' }
                }
            ];

            Review.findAll.mockResolvedValue(mockReviews);

            await exportReviewsCSV(mockReq, mockRes, mockNext);

            expect(Review.findAll).toHaveBeenCalledWith({
                attributes: ['id', 'rating', 'comment', 'isVisible', 'createdAt'],
                include: expect.any(Array),
                order: [['createdAt', 'DESC']],
                raw: true,
                nest: true
            });
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=reviews.csv');
            expect(mockRes.send).toHaveBeenCalledWith('csv,data');
        });
    });

    describe('exportContactsCSV', () => {
        it('should export contacts to CSV successfully', async () => {
            const mockContacts = [
                {
                    id: '1',
                    senderName: 'John Doe',
                    senderEmail: 'john@example.com',
                    message: 'Hello',
                    provider: { businessName: 'Test Provider' }
                }
            ];

            Contact.findAll.mockResolvedValue(mockContacts);

            await exportContactsCSV(mockReq, mockRes, mockNext);

            expect(Contact.findAll).toHaveBeenCalledWith({
                attributes: ['id', 'senderName', 'senderEmail', 'senderPhone', 'message', 'status', 'createdAt'],
                include: expect.any(Array),
                order: [['createdAt', 'DESC']],
                raw: true,
                nest: true
            });
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=contacts.csv');
            expect(mockRes.send).toHaveBeenCalledWith('csv,data');
        });
    });

    describe('exportReportPDF', () => {
        it('should export platform report to PDF successfully', async () => {
            User.count.mockResolvedValue(100);
            Provider.count.mockResolvedValue(50);
            Review.count.mockResolvedValue(200);
            Contact.count.mockResolvedValue(300);

            const mockProviders = [
                { businessName: 'Provider 1', location: 'Douala', averageRating: 4.5, totalReviews: 10 }
            ];
            Provider.findAll.mockResolvedValue(mockProviders);

            await exportReportPDF(mockReq, mockRes, mockNext);

            expect(User.count).toHaveBeenCalledWith({ where: { isActive: true } });
            expect(Provider.count).toHaveBeenCalledWith({ where: { isVerified: true } });
            expect(Review.count).toHaveBeenCalledWith({ where: { isVisible: true } });
            expect(Contact.count).toHaveBeenCalled();
            expect(PDFDocument).toHaveBeenCalledWith({ margin: 50 });
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=platform-report.pdf');
        });
    });
});
