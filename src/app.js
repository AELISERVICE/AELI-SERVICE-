const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { generalLimiter } = require('./middlewares/rateLimiter');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { checkSessionActivity } = require('./middlewares/security');
const { csrfTokenMiddleware, csrfValidation, getCSRFToken } = require('./middlewares/csrf');
const { getRequestLogger, requestTiming } = require('./middlewares/requestLogger');
const { basicHealth, detailedHealth, readinessProbe, livenessProbe } = require('./middlewares/healthCheck');
const swaggerSpec = require('./config/swagger');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const providerRoutes = require('./routes/providers');
const serviceRoutes = require('./routes/services');
const reviewRoutes = require('./routes/reviews');
const favoriteRoutes = require('./routes/favorites');
const contactRoutes = require('./routes/contacts');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const subscriptionRoutes = require('./routes/subscriptions');

// Initialize Express app
const app = express();

// ============ REQUEST LOGGING ============
app.use(getRequestLogger());
app.use(requestTiming);

// ============ COMPRESSION ============
// Compress all HTTP responses
app.use(compression({
    filter: (req, res) => {
        // Don't compress if client doesn't accept
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6 // Balance between speed and compression ratio
}));

// ============ SWAGGER DOCUMENTATION ============
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AELI Services API Documentation',
    swaggerOptions: {
        persistAuthorization: true
    }
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// ============ SECURITY MIDDLEWARES ============

// Set security HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            scriptSrc: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-XSRF-Token']
}));

// Cookie parser (required for CSRF)
app.use(cookieParser());

// Rate limiting
app.use('/api', generalLimiter);

// ============ BODY PARSING ============

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ XSS PROTECTION ============
// Sanitize request data
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            return obj.replace(/[<>]/g, '');
        }
        if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                obj[key] = sanitize(obj[key]);
            }
        }
        return obj;
    };

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);

    next();
};

app.use(sanitizeInput);

// ============ INTERNATIONALIZATION ============
const { i18nMiddleware } = require('./middlewares/i18n');
app.use(i18nMiddleware);

// ============ API ROUTES ============

// Health check endpoints
app.get('/api/health', basicHealth);
app.get('/api/health/detailed', detailedHealth);
app.get('/api/health/ready', readinessProbe);
app.get('/api/health/live', livenessProbe);

// CSRF token endpoint (for SPA frontends)
app.get('/api/csrf-token', getCSRFToken);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Search endpoint (combined search across providers)
app.get('/api/search', require('./controllers/providerController').getProviders);

// ============ ERROR HANDLING ============

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;

