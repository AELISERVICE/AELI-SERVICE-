/**
 * Admin Routes Integration Tests
 * Tests for admin API endpoints with authentication and authorization
 */

const request = require('supertest');
const { sequelize } = require('../../src/config/database');
const { User, Provider, Contact, Review, AuditLog, SecurityLog, ApiUsage, BannedIP } = require('../../src/models');
const { generateToken } = require('../../src/middlewares/auth');
const app = require('../../src/app');

describe('Admin Routes Integration', () => {
    let adminToken, regularUserToken, providerToken;
    let adminUser, regularUser, provider;

    beforeAll(async () => {
        // Create test users
        adminUser = await User.create({
            email: 'admin@test.com',
            firstName: 'Admin',
            lastName: 'User',
            password: 'hashedpassword',
            role: 'admin',
            isActive: true,
            isEmailVerified: true
        });

        regularUser = await User.create({
            email: 'user@test.com',
            firstName: 'Regular',
            lastName: 'User',
            password: 'hashedpassword',
            role: 'client',
            isActive: true,
            isEmailVerified: true
        });

        provider = await Provider.create({
            userId: regularUser.id,
            businessName: 'Test Provider',
            whatsapp: '+237 600 000 000',
            location: 'Douala, Cameroon',
            description: 'Test description that is at least 50 characters long to meet the validation requirements for this field in the provider model.',
            verificationStatus: 'approved',
            isVerified: true,
            isFeatured: false
        });

        // Generate tokens
        adminToken = generateToken(adminUser);
        regularUserToken = generateToken(regularUser);
        providerToken = generateToken({ ...regularUser, role: 'provider' });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('Authentication & Authorization', () => {
        it('should reject requests without authentication', async () => {
            await request(app)
                .get('/api/admin/stats')
                .expect(401);
        });

        it('should reject requests from non-admin users', async () => {
            await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${regularUserToken}`)
                .expect(403);
        });

        it('should reject requests from providers', async () => {
            await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${providerToken}`)
                .expect(403);
        });

        it('should allow requests from admin users', async () => {
            await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
        });
    });

    describe('GET /api/admin/stats', () => {
        it('should return platform statistics', async () => {
            await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.data).toHaveProperty('totalUsers');
                    expect(res.body.data).toHaveProperty('totalProviders');
                    expect(res.body.data).toHaveProperty('totalContacts');
                    expect(res.body.data).toHaveProperty('totalReviews');
                });
        });
    });

    describe('GET /api/admin/users', () => {
        it('should return paginated users list', async () => {
            await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.data).toHaveProperty('users');
                    expect(res.body.data).toHaveProperty('pagination');
                    expect(Array.isArray(res.body.data.users)).toBe(true);
                });
        });

        it('should support pagination parameters', async () => {
            await request(app)
                .get('/api/admin/users?page=1&limit=5')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.users).toHaveLength(5);
                    expect(res.body.data.pagination.currentPage).toBe(1);
                    expect(res.body.data.pagination.pageSize).toBe(5);
                });
        });
    });

    describe('PUT /api/admin/users/:id/status', () => {
        it('should update user status successfully', async () => {
            await request(app)
                .put(`/api/admin/users/${regularUser.id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isActive: false })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                    expect(res.body.data.isActive).toBe(false);
                });
        });

        it('should reject invalid user ID', async () => {
            await request(app)
                .put('/api/admin/users/invalid-id/status')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isActive: false })
                .expect(400);
        });

        it('should reject invalid status value', async () => {
            await request(app)
                .put(`/api/admin/users/${regularUser.id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isActive: 'invalid' })
                .expect(400);
        });
    });

    describe('GET /api/admin/audit-logs', () => {
        it('should return audit logs with pagination', async () => {
            // Create some audit logs
            await AuditLog.create({
                userId: adminUser.id,
                action: 'UPDATE_USER_STATUS',
                entityType: 'User',
                entityId: regularUser.id,
                details: { oldStatus: true, newStatus: false },
                ipAddress: '127.0.0.1'
            });

            await request(app)
                .get('/api/admin/audit-logs')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                    expect(res.body).toHaveProperty('logs');
                    expect(Array.isArray(res.body.data.logs)).toBe(true);
                });
        });

        it('should support filtering parameters', async () => {
            await request(app)
                .get('/api/admin/audit-logs?userId=' + adminUser.id + '&limit=5')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.logs).toHaveLength(5);
                    res.body.data.logs.forEach(log => {
                        expect(log.userId).toBe(adminUser.id);
                    });
                });
        });
    });

    describe('GET /api/admin/analytics', () => {
        it('should return API usage statistics', async () => {
            await request(app)
                .get('/api/admin/analytics')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.data).toHaveProperty('stats');
                    expect(res.body.data).toHaveProperty('endpoints');
                });
        });

        it('should return hourly breakdown', async () => {
            await request(app)
                .get('/api/admin/analytics/hourly')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.data).toHaveProperty('hourly');
                    expect(Array.isArray(res.body.data.hourly)).toBe(true);
                });
        });
    });

    describe('GET /api/admin/banned-ips', () => {
        it('should return list of banned IPs', async () => {
            await request(app)
                .get('/api/admin/banned-ips')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                    expect(res.body).toHaveProperty('bannedIPs');
                    expect(Array.isArray(res.body.data.bannedIPs)).toBe(true);
                });
        });
    });

    describe('POST /api/admin/banned-ips', () => {
        it('should ban an IP address', async () => {
            const ipData = {
                ipAddress: '192.168.1.100',
                reason: 'Suspicious activity',
                duration: 24 // hours
            };

            await request(app)
                .post('/api/admin/banned-ips')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(ipData)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                });
        });

        it('should reject invalid IP address', async () => {
            await request(app)
                .post('/api/admin/banned-ips')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ipAddress: 'invalid-ip', reason: 'Test' })
                .expect(400);
        });
    });

    describe('DELETE /api/admin/banned-ips/:ip', () => {
        it('should unban an IP address', async () => {
            // First ban an IP
            await BannedIP.create({
                ipAddress: '192.168.1.100',
                reason: 'Test',
                bannedBy: adminUser.id,
                isActive: true
            });

            await request(app)
                .delete('/api/admin/banned-ips/192.168.1.100')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                });
        });

        it('should return 404 for non-existent IP', async () => {
            await request(app)
                .delete('/api/admin/banned-ips/192.168.1.999')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });

    describe('GET /api/admin/security-logs', () => {
        it('should return security logs with filtering', async () => {
            // Create some security logs
            await SecurityLog.create({
                eventType: 'LOGIN_FAILED',
                ipAddress: '192.168.1.100',
                email: 'test@example.com',
                userAgent: 'Mozilla/5.0',
                riskLevel: 'medium',
                success: false,
                details: { reason: 'Invalid credentials' }
            });

            await request(app)
                .get('/api/admin/security-logs')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                    expect(res.body).toHaveProperty('logs');
                    expect(Array.isArray(res.body.data.logs)).toBe(true);
                });
        });

        it('should support filtering by risk level', async () => {
            await request(app)
                .get('/api/admin/security-logs?riskLevel=high')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    res.body.data.logs.forEach(log => {
                        expect(log.riskLevel).toBe('high');
                    });
                });
        });

        it('should support date range filtering', async () => {
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-01-31');
            
            await request(app)
                .get(`/api/admin/security-logs?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
        });
    });

    describe('GET /api/admin/security-stats', () => {
        it('should return security statistics', async () => {
            // Create some security logs
            await SecurityLog.create({
                eventType: 'LOGIN_FAILED',
                ipAddress: '192.168.1.100',
                success: false,
                riskLevel: 'medium',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            });

            await SecurityLog.create({
                eventType: 'LOGIN_FAILED',
                ipAddress: '192.168.1.101',
                success: false,
                riskLevel: 'high',
                createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
            });

            await BannedIP.create({
                ipAddress: '192.168.1.102',
                isActive: true
            });

            await request(app)
                .get('/api/admin/security-stats')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('success', true);
                    expect(res.body.data).toHaveProperty('hourlyFailedAttempts');
                    expect(res.body.data).toHaveProperty('dailyFailedAttempts');
                    expect(res.body.data).toHaveProperty('highRiskEvents24h');
                    expect(res.body.data).toHaveProperty('activeBannedIPs');
                    expect(res.body.data).toHaveProperty('topSuspiciousIPs');
                });
        });
    });

    describe('Error Handling', () => {
        it('should handle database errors gracefully', async () => {
            // Mock a database error
            const originalFindAll = AuditLog.findAll;
            AuditLog.findAll = jest.fn().mockRejectedValue(new Error('Database connection failed'));

            await request(app)
                .get('/api/admin/audit-logs')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(500);

            // Restore original method
            AuditLog.findAll = originalFindAll;
        });

        it('should handle validation errors', async () => {
            await request(app)
                .put(`/api/admin/users/${regularUser.id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isActive: 'invalid-status' })
                .expect(400);
        });
    });
});
