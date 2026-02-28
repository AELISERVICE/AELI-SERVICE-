module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/config/*.js',
        '!src/swagger/*.yaml',
        '!src/jobs/*.js',         // Infrastructure: cron jobs (side-effect only)
        '!src/workers/*.js',      // Infrastructure: background workers
        '!src/migrations/*.js'    // DB migrations (not business logic)
    ],
    coverageThreshold: {
        global: {
            statements: 90,
            branches: 80,
            functions: 85,
            lines: 90
        }
    },
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['./tests/setup.js'],
    testTimeout: 60000,
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};
