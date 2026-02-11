const { expect } = require('@jest/globals');

// Mock process.env before requiring the file if needed, 
// but here we just want to test the parsing logic if it was exported or by simulation.
// Since it's not exported as a standalone function, I'll test it via the exported allAllowedOrigins.

describe('CORS Configuration Parsing', () => {
    const originalEnv = process.env.FRONTEND_URL;

    afterEach(() => {
        process.env.FRONTEND_URL = originalEnv;
        jest.resetModules();
    });

    it('should parse single URL correctly', () => {
        process.env.FRONTEND_URL = 'http://test.com';
        const { allAllowedOrigins } = require('../../src/config/cors');
        expect(allAllowedOrigins).toContain('http://test.com');
    });

    it('should parse comma-separated URLs correctly', () => {
        process.env.FRONTEND_URL = 'http://test1.com, http://test2.com';
        const { allAllowedOrigins } = require('../../src/config/cors');
        expect(allAllowedOrigins).toContain('http://test1.com');
        expect(allAllowedOrigins).toContain('http://test2.com');
    });

    it('should parse JSON array URLs correctly', () => {
        process.env.FRONTEND_URL = '["http://test3.com", "http://test4.com"]';
        const { allAllowedOrigins } = require('../../src/config/cors');
        expect(allAllowedOrigins).toContain('http://test3.com');
        expect(allAllowedOrigins).toContain('http://test4.com');
    });

    it('should handle spaces in JSON array', () => {
        process.env.FRONTEND_URL = '[ "http://test5.com" , "http://test6.com" ]';
        const { allAllowedOrigins } = require('../../src/config/cors');
        expect(allAllowedOrigins).toContain('http://test5.com');
        expect(allAllowedOrigins).toContain('http://test6.com');
    });

    it('should fallback to default origins if empty', () => {
        process.env.FRONTEND_URL = '';
        const { allAllowedOrigins } = require('../../src/config/cors');
        expect(allAllowedOrigins).toContain('http://localhost:3000');
    });
});
