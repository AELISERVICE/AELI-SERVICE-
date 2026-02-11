/**
 * CORS Configuration
 * Handles Cross-Origin Resource Sharing for multiple frontend URLs
 */

const allowedOrigins = {
    development: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://localhost:5174'
    ],
    production: []
};

// Add production origins from environment variable
if (process.env.FRONTEND_URL) {
    const frontendUrls = process.env.FRONTEND_URL.split(',').map(url => url.trim());
    allowedOrigins.production.push(...frontendUrls);
}

const corsOptions = {
    origin: (origin, callback) => {
        const env = process.env.NODE_ENV || 'development';
        const allowed = allowedOrigins[env];

        // Allow requests with no origin (mobile apps, Postman, curl, etc.)
        if (!origin) {
            return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowed.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-CSRF-Token',
        'X-XSRF-Token',
        'X-Lang',
        'Accept-Language'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
    maxAge: 86400 // 24 hours - how long browsers cache preflight requests
};

module.exports = corsOptions;
