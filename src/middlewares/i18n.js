/**
 * Internationalization (i18n) middleware and utilities
 * Supports French (default) and English
 */

const fr = require('../locales/fr.json');
const en = require('../locales/en.json');

const locales = { fr, en };
const defaultLocale = 'fr';
const supportedLocales = ['fr', 'en'];

/**
 * Detect language from request
 * Priority: query param > header > default
 */
const detectLanguage = (req) => {
    // Check query parameter
    if (req.query.lang && supportedLocales.includes(req.query.lang)) {
        return req.query.lang;
    }

    // Check Accept-Language header
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
        // Parse "fr-FR,fr;q=0.9,en;q=0.8"
        const languages = acceptLanguage.split(',').map(lang => {
            const [code, priority] = lang.trim().split(';q=');
            return {
                code: code.split('-')[0].toLowerCase(), // "fr-FR" -> "fr"
                priority: priority ? parseFloat(priority) : 1
            };
        });

        // Sort by priority and find first supported
        languages.sort((a, b) => b.priority - a.priority);
        for (const lang of languages) {
            if (supportedLocales.includes(lang.code)) {
                return lang.code;
            }
        }
    }

    return defaultLocale;
};

/**
 * Get translated message
 * @param {string} key - Dot notation key (e.g., "auth.loginSuccess")
 * @param {string} locale - Language code
 * @param {Object} params - Replacement parameters
 */
const t = (key, locale = 'fr', params = {}) => {
    const keys = key.split('.');
    let message = locales[locale] || locales[defaultLocale];

    for (const k of keys) {
        message = message?.[k];
        if (!message) {
            // Fallback to default locale
            message = locales[defaultLocale];
            for (const fallbackKey of keys) {
                message = message?.[fallbackKey];
                if (!message) break;
            }
            break;
        }
    }

    if (!message) {
        return key; // Return key if translation not found
    }

    // Replace parameters like {minutes}
    return message.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
    });
};

/**
 * i18n middleware - adds t() function to request
 */
const i18nMiddleware = (req, res, next) => {
    req.locale = detectLanguage(req);

    // Add translation function to request
    req.t = (key, params = {}) => t(key, req.locale, params);

    // Add translation function to response locals (for templates)
    res.locals.t = req.t;
    res.locals.locale = req.locale;

    next();
};

/**
 * Helper to create localized response
 */
const localizedResponse = (res, statusCode, messageKey, data = null, params = {}) => {
    const locale = res.req?.locale || 'fr';
    const message = t(messageKey, locale, params);

    const response = {
        success: statusCode >= 200 && statusCode < 300,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

module.exports = {
    detectLanguage,
    t,
    i18nMiddleware,
    localizedResponse,
    supportedLocales,
    defaultLocale
};
