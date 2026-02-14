const { logAudit, auditLogger } = require('../../src/middlewares/audit');
const { User, AuditLog } = require('../../src/models');
const { ipBanlistMiddleware: ipBanlist } = require('../../src/middlewares/ipBanlist');
const { analyticsMiddleware: analytics } = require('../../src/middlewares/analytics');

describe('Middlewares Unit Tests', () => {
    let testUser;

    beforeAll(async () => {
        testUser = await User.create({
            firstName: 'Middleware',
            lastName: 'Tester',
            email: `mw_test_${Date.now()}@test.com`,
            password: 'Password123!',
            role: 'client'
        });
    });

    afterAll(async () => {
        if (testUser) {
            await AuditLog.destroy({ where: { userId: testUser.id } });
            await User.destroy({ where: { id: testUser.id } });
        }
    });

    describe('Audit Middleware', () => {
        it('should log an audit event correctly', async () => {
            const mockReq = {
                user: { id: testUser.id },
                ip: '127.0.0.1',
                headers: { 'user-agent': 'Jest' },
                originalUrl: '/test',
                method: 'GET',
                t: (key) => key
            };

            await auditLogger.userLoggedIn(mockReq, { id: testUser.id, email: 'test_middleware@test.com' });

            // Small delay to ensure DB write is committed (Sequelize is sometimes async in hooks)
            await new Promise(resolve => setTimeout(resolve, 100));

            const log = await AuditLog.findOne({
                where: {
                    action: 'LOGIN',
                    entityId: testUser.id
                },
                order: [['createdAt', 'DESC']]
            });

            expect(log).toBeDefined();
            expect(log.action).toBe('LOGIN');
            expect(log.ipAddress).toBe('127.0.0.1');
        });
    });

    describe('IP Banlist Middleware', () => {
        // Since it's a middleware, we can test it as a function
        it('should pass for non-banned IP', async () => {
            const req = { ip: '1.2.3.4' };
            const res = {};
            const next = jest.fn();

            // We need to make sure it doesn't try to query DB if we can help it, 
            // but since it's an integration-like unit test, we'll let it run or mock BannedIP
            await ipBanlist(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
