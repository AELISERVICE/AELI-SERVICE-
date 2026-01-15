/**
 * Unit tests for i18n middleware
 */

const { detectLanguage, t, i18nMiddleware } = require('../../src/middlewares/i18n');

describe('i18n Middleware', () => {
    describe('detectLanguage', () => {
        it('should detect language from query parameter', () => {
            const req = { query: { lang: 'en' }, headers: {} };
            expect(detectLanguage(req)).toBe('en');
        });

        it('should detect language from Accept-Language header', () => {
            const req = {
                query: {},
                headers: { 'accept-language': 'en-US,en;q=0.9' }
            };
            expect(detectLanguage(req)).toBe('en');
        });

        it('should prioritize query param over header', () => {
            const req = {
                query: { lang: 'fr' },
                headers: { 'accept-language': 'en-US,en;q=0.9' }
            };
            expect(detectLanguage(req)).toBe('fr');
        });

        it('should default to French for unsupported languages', () => {
            const req = {
                query: {},
                headers: { 'accept-language': 'de-DE' }
            };
            expect(detectLanguage(req)).toBe('fr');
        });

        it('should default to French when no language specified', () => {
            const req = { query: {}, headers: {} };
            expect(detectLanguage(req)).toBe('fr');
        });

        it('should handle complex Accept-Language header', () => {
            const req = {
                query: {},
                headers: { 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8,de;q=0.7' }
            };
            expect(detectLanguage(req)).toBe('fr');
        });
    });

    describe('t (translation function)', () => {
        it('should translate French keys', () => {
            expect(t('auth.loginSuccess', 'fr')).toBe('Connexion réussie');
        });

        it('should translate English keys', () => {
            expect(t('auth.loginSuccess', 'en')).toBe('Login successful');
        });

        it('should replace parameters', () => {
            const result = t('auth.accountLocked', 'fr', { minutes: 30 });
            expect(result).toBe('Compte verrouillé. Réessayez dans 30 minutes.');
        });

        it('should return key for missing translation', () => {
            expect(t('nonexistent.key', 'fr')).toBe('nonexistent.key');
        });

        it('should fallback to French for unsupported locale', () => {
            expect(t('auth.loginSuccess', 'de')).toBe('Connexion réussie');
        });

        it('should handle nested keys', () => {
            expect(t('validation.emailRequired', 'en')).toBe('Email is required');
        });
    });

    describe('i18nMiddleware', () => {
        it('should add locale and t function to request', () => {
            const req = { query: { lang: 'en' }, headers: {} };
            const res = { locals: {} };
            const next = jest.fn();

            i18nMiddleware(req, res, next);

            expect(req.locale).toBe('en');
            expect(typeof req.t).toBe('function');
            expect(res.locals.locale).toBe('en');
            expect(next).toHaveBeenCalled();
        });

        it('should make t function work correctly', () => {
            const req = { query: { lang: 'en' }, headers: {} };
            const res = { locals: {} };
            const next = jest.fn();

            i18nMiddleware(req, res, next);

            expect(req.t('auth.loginSuccess')).toBe('Login successful');
        });
    });
});
