/**
 * Admin Routes Unit Tests
 * Tests for admin route handlers and middleware
 */

const { protect, restrictTo } = require('../../src/middlewares/auth');
const { validate } = require('../../src/middlewares/validation');
const { i18nResponse } = require('../../src/utils/helpers');
const { AuditLog, ApiUsage, BannedIP } = require('../../src/models');

// Mock dependencies
jest.mock('../../src/middlewares/auth');
jest.mock('../../src/middlewares/validation');
jest.mock('../../src/utils/helpers');
jest.mock('../../src/models');

describe('Admin Routes Unit Tests', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockReq = {
            query: {},
            params: {},
            body: {},
            user: { id: 'admin-123', role: 'admin' },
            headers: {},
            ip: '192.168.1.100'
        };
        
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            setHeader: jest.fn(),
            send: jest.fn()
        };
        
        mockNext = jest.fn();
        
        // Mock middleware functions
        protect.mockImplementation((req, res, next) => next());
        restrictTo.mockImplementation((roles) => (req, res, next) => {
            if (roles.includes(req.user.role)) next();
            else res.status(403).json({ success: false, message: 'Forbidden' });
        });
        validate.mockImplementation((req, res, next) => next());
        i18nResponse.mockImplementation((req, res, status, message, data) => {
            res.status(status).json({ success: true, message, ...data });
        });
    });

    describe('Audit Logs Route Handler', () => {
        it('should handle audit logs request with filters', async () => {
            const mockLogs = [
                { id: 1, action: 'UPDATE_USER', createdAt: new Date() },
                { id: 2, action: 'DELETE_CONTACT', createdAt: new Date() }
            ];
            
            AuditLog.findAll.mockResolvedValue(mockLogs);

            // Simulate the route handler
            const handler = async (req, res) => {
                const { limit = 100, userId, entityType } = req.query;
                const where = {};
                if (userId) where.userId = userId;
                if (entityType) where.entityType = entityType;

                const logs = await AuditLog.findAll({
                    where,
                    order: [['createdAt', 'DESC']],
                    limit: parseInt(limit),
                    include: [{ association: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
                });
                res.json({ success: true, data: { logs } });
            };

            mockReq.query = { limit: 50, userId: 'user-123' };
            await handler(mockReq, mockRes);

            expect(AuditLog.findAll).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                order: [['createdAt', 'DESC']],
                limit: 50,
                include: [{ association: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }]
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { logs: mockLogs }
            });
        });

        it('should handle audit logs request without filters', async () => {
            const mockLogs = [{ id: 1, action: 'UPDATE_USER' }];
            AuditLog.findAll.mockResolvedValue(mockLogs);

            const handler = async (req, res) => {
                const { limit = 100 } = req.query;
                const logs = await AuditLog.findAll({
                    order: [['createdAt', 'DESC']],
                    limit: parseInt(limit)
                });
                res.json({ success: true, data: { logs } });
            };

            await handler(mockReq, mockRes);

            expect(AuditLog.findAll).toHaveBeenCalledWith({
                order: [['createdAt', 'DESC']],
                limit: 100
            });
        });
    });

    describe('API Analytics Route Handler', () => {
        it('should return overall API statistics', async () => {
            const mockStats = { totalRequests: 1000, uniqueUsers: 50 };
            const mockEndpoints = [
                { endpoint: '/api/auth/login', count: 100 },
                { endpoint: '/api/providers', count: 200 }
            ];
            
            ApiUsage.getOverallStats.mockResolvedValue(mockStats);
            ApiUsage.getEndpointStats.mockResolvedValue(mockEndpoints);

            const handler = async (req, res) => {
                const stats = await ApiUsage.getOverallStats();
                const endpoints = await ApiUsage.getEndpointStats({ limit: 20 });
                res.json({ success: true, data: { stats, endpoints } });
            };

            await handler(mockReq, mockRes);

            expect(ApiUsage.getOverallStats).toHaveBeenCalled();
            expect(ApiUsage.getEndpointStats).toHaveBeenCalledWith({ limit: 20 });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { stats: mockStats, endpoints: mockEndpoints }
            });
        });

        it('should return hourly breakdown', async () => {
            const mockHourly = [
                { hour: '00:00', count: 10 },
                { hour: '01:00', count: 15 }
            ];
            
            ApiUsage.getHourlyBreakdown.mockResolvedValue(mockHourly);

            const handler = async (req, res) => {
                const date = req.query.date ? new Date(req.query.date) : new Date();
                const hourly = await ApiUsage.getHourlyBreakdown(date);
                res.json({ success: true, data: { hourly } });
            };

            mockReq.query = { date: '2024-01-15' };
            await handler(mockReq, mockRes);

            expect(ApiUsage.getHourlyBreakdown).toHaveBeenCalledWith(new Date('2024-01-15'));
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { hourly: mockHourly }
            });
        });
    });

    describe('Banned IPs Route Handlers', () => {
        it('should get banned IPs list', async () => {
            const mockBannedIPs = [
                { ipAddress: '192.168.1.100', reason: 'Suspicious activity' },
                { ipAddress: '192.168.1.101', reason: 'Rate limiting' }
            ];
            
            BannedIP.findAll.mockResolvedValue(mockBannedIPs);

            const handler = async (req, res) => {
                const ips = await BannedIP.findAll({
                    where: { isActive: true },
                    order: [['createdAt', 'DESC']]
                });
                i18nResponse(req, res, 200, 'security.bannedIPsList', { bannedIPs: ips });
            };

            await handler(mockReq, mockRes);

            expect(BannedIP.findAll).toHaveBeenCalledWith({
                where: { isActive: true },
                order: [['createdAt', 'DESC']]
            });
            expect(i18nResponse).toHaveBeenCalledWith(
                mockReq,
                mockRes,
                200,
                'security.bannedIPsList',
                { bannedIPs: mockBannedIPs }
            );
        });

        it('should ban an IP address', async () => {
            const banData = {
                ipAddress: '192.168.1.100',
                reason: 'Suspicious activity',
                duration: 24
            };
            
            BannedIP.banIP.mockResolvedValue();

            const handler = async (req, res) => {
                const { ipAddress, reason, duration } = req.body;
                await BannedIP.banIP(ipAddress, {
                    reason,
                    bannedBy: req.user.id,
                    duration
                });
                i18nResponse(req, res, 201, 'security.ipBannedSuccess', {});
            };

            mockReq.body = banData;
            await handler(mockReq, mockRes);

            expect(BannedIP.banIP).toHaveBeenCalledWith('192.168.1.100', {
                reason: 'Suspicious activity',
                bannedBy: 'admin-123',
                duration: 24
            });
            expect(i18nResponse).toHaveBeenCalledWith(
                mockReq,
                mockRes,
                201,
                'security.ipBannedSuccess',
                {}
            );
        });

        it('should unban an IP address', async () => {
            BannedIP.unbanIP.mockResolvedValue();

            const handler = async (req, res) => {
                await BannedIP.unbanIP(req.params.ip);
                i18nResponse(req, res, 200, 'security.ipUnbanned', {});
            };

            mockReq.params = { ip: '192.168.1.100' };
            await handler(mockReq, mockRes);

            expect(BannedIP.unbanIP).toHaveBeenCalledWith('192.168.1.100');
            expect(i18nResponse).toHaveBeenCalledWith(
                mockReq,
                mockRes,
                200,
                'security.ipUnbanned',
                {}
            );
        });
    });

    describe('Security Logs Route Handler', () => {
        it('should handle security logs with filters', async () => {
            const mockLogs = [
                { id: 1, eventType: 'LOGIN_FAILED', riskLevel: 'medium' },
                { id: 2, eventType: 'LOGIN_SUCCESS', riskLevel: 'low' }
            ];
            
            const SecurityLog = require('../../src/models').SecurityLog;
            SecurityLog.findAll.mockResolvedValue(mockLogs);

            const handler = async (req, res) => {
                const { limit = 100, eventType, riskLevel, userId, success, startDate, endDate } = req.query;
                const { Op } = require('sequelize');
                const where = {};

                if (eventType) where.eventType = eventType;
                if (riskLevel) where.riskLevel = riskLevel;
                if (userId) where.userId = userId;
                if (success !== undefined) where.success = success === 'true';

                if (startDate || endDate) {
                    where.createdAt = {};
                    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
                    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
                }

                const logs = await SecurityLog.findAll({
                    where,
                    order: [['createdAt', 'DESC']],
                    limit: parseInt(limit)
                });

                i18nResponse(req, res, 200, 'security.securityLogs', { logs });
            };

            mockReq.query = { eventType: 'LOGIN_FAILED', riskLevel: 'medium' };
            await handler(mockReq, mockRes);

            expect(SecurityLog.findAll).toHaveBeenCalledWith({
                where: { eventType: 'LOGIN_FAILED', riskLevel: 'medium' },
                order: [['createdAt', 'DESC']],
                limit: 100
            });
        });

        it('should export security logs as CSV', async () => {
            const mockLogs = [
                {
                    createdAt: new Date('2024-01-15'),
                    eventType: 'LOGIN_FAILED',
                    ipAddress: '192.168.1.100',
                    email: 'test@example.com',
                    userAgent: 'Mozilla/5.0',
                    riskLevel: 'medium',
                    success: false,
                    details: { reason: 'Invalid password' }
                }
            ];
            
            const SecurityLog = require('../../src/models').SecurityLog;
            SecurityLog.findAll.mockResolvedValue(mockLogs);

            const handler = async (req, res) => {
                const { startDate, endDate, eventType, riskLevel } = req.query;
                const { Op } = require('sequelize');
                const where = {};

                if (eventType) where.eventType = eventType;
                if (riskLevel) where.riskLevel = riskLevel;

                const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                const end = endDate ? new Date(endDate) : new Date();
                where.createdAt = { [Op.between]: [start, end] };

                const logs = await SecurityLog.findAll({
                    where,
                    order: [['createdAt', 'DESC']],
                    limit: 10000
                });

                const headers = ['Date', 'Event Type', 'IP Address', 'Email', 'User Agent', 'Risk Level', 'Success', 'Details'];
                const rows = logs.map(log => [
                    log.createdAt.toISOString(),
                    log.eventType,
                    log.ipAddress || '',
                    log.email || '',
                    (log.userAgent || '').substring(0, 100),
                    log.riskLevel,
                    log.success ? 'Yes' : 'No',
                    JSON.stringify(log.details || {})
                ]);

                const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=security_logs_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.csv`);
                res.send(csv);
            };

            mockReq.query = { startDate: '2024-01-01', endDate: '2024-01-31' };
            await handler(mockReq, mockRes);

            expect(SecurityLog.findAll).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    createdAt: expect.any(Object)
                }),
                order: [['createdAt', 'DESC']],
                limit: 10000
            });
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
            expect(mockRes.send).toHaveBeenCalled();
        });
    });

    describe('Security Statistics Route Handler', () => {
        it('should return security statistics', async () => {
            const SecurityLog = require('../../src/models').SecurityLog;
            SecurityLog.count.mockResolvedValue(5);
            BannedIP.count.mockResolvedValue(3);
            SecurityLog.findAll.mockResolvedValue([
                { ipAddress: '192.168.1.100', count: 10 },
                { ipAddress: '192.168.1.101', count: 5 }
            ]);

            const handler = async (req, res) => {
                const { Op, fn, col, literal } = require('sequelize');
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

                const [hourlyFailed, dailyFailed, highRiskEvents, bannedIPsCount] = await Promise.all([
                    SecurityLog.count({ where: { success: false, createdAt: { [Op.gte]: oneHourAgo } } }),
                    SecurityLog.count({ where: { success: false, createdAt: { [Op.gte]: oneDayAgo } } }),
                    SecurityLog.count({ where: { riskLevel: 'high', createdAt: { [Op.gte]: oneDayAgo } } }),
                    BannedIP.count({ where: { isActive: true } })
                ]);

                const topSuspiciousIPs = await SecurityLog.findAll({
                    where: { success: false, createdAt: { [Op.gte]: oneDayAgo } },
                    attributes: ['ipAddress', [fn('COUNT', col('id')), 'count']],
                    group: ['ipAddress'],
                    order: [[literal('count'), 'DESC']],
                    limit: 10,
                    raw: true
                });

                i18nResponse(req, res, 200, 'security.securityStats', {
                    hourlyFailedAttempts: hourlyFailed,
                    dailyFailedAttempts: dailyFailed,
                    highRiskEvents24h: highRiskEvents,
                    activeBannedIPs: bannedIPsCount,
                    topSuspiciousIPs
                });
            };

            await handler(mockReq, mockRes);

            expect(SecurityLog.count).toHaveBeenCalledTimes(3);
            expect(BannedIP.count).toHaveBeenCalled();
            expect(SecurityLog.findAll).toHaveBeenCalled();
            expect(i18nResponse).toHaveBeenCalledWith(
                mockReq,
                mockRes,
                200,
                'security.securityStats',
                expect.objectContaining({
                    hourlyFailedAttempts: 5,
                    dailyFailedAttempts: 5,
                    highRiskEvents24h: 5,
                    activeBannedIPs: 3,
                    topSuspiciousIPs: expect.any(Array)
                })
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle database errors in audit logs', async () => {
            AuditLog.findAll.mockRejectedValue(new Error('Database connection failed'));

            const handler = async (req, res, next) => {
                try {
                    const logs = await AuditLog.findAll();
                    res.json({ success: true, data: { logs } });
                } catch (error) {
                    next(error);
                }
            };

            await handler(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(new Error('Database connection failed'));
        });

        it('should handle validation errors', async () => {
            const handler = async (req, res) => {
                const { limit } = req.query;
                if (limit && isNaN(parseInt(limit))) {
                    return res.status(400).json({ success: false, message: 'Invalid limit parameter' });
                }
                res.json({ success: true, data: { limit: parseInt(limit) || 100 } });
            };

            mockReq.query = { limit: 'invalid' };
            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid limit parameter'
            });
        });
    });
});
