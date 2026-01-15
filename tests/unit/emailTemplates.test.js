/**
 * Unit tests for email templates
 */

const {
    welcomeEmail,
    newContactEmail,
    accountVerifiedEmail,
    newReviewEmail,
    passwordResetEmail,
    documentsReceivedEmail,
    documentsRejectedEmail,
    paymentSuccessEmail,
    paymentFailedEmail,
    otpEmail
} = require('../../src/utils/emailTemplates');

describe('Email Templates', () => {
    describe('welcomeEmail', () => {
        it('should generate welcome email for client', () => {
            const result = welcomeEmail({ firstName: 'Marie', role: 'client' });

            expect(result.subject).toContain('Bienvenue');
            expect(result.html).toContain('Marie');
            expect(result.html).toContain('découvrir nos prestataires');
        });

        it('should generate welcome email for provider', () => {
            const result = welcomeEmail({ firstName: 'Sophie', role: 'provider' });

            expect(result.subject).toContain('Bienvenue');
            expect(result.html).toContain('Sophie');
            expect(result.html).toContain('prestataire');
        });
    });

    describe('newContactEmail', () => {
        it('should generate contact email with phone', () => {
            const result = newContactEmail({
                providerName: 'Salon Marie',
                senderName: 'Jeanne',
                senderEmail: 'jeanne@test.com',
                senderPhone: '+237690000000',
                message: 'Bonjour, je voudrais un rendez-vous'
            });

            expect(result.subject).toContain('contact');
            expect(result.html).toContain('Salon Marie');
            expect(result.html).toContain('Jeanne');
            expect(result.html).toContain('jeanne@test.com');
            expect(result.html).toContain('+237690000000');
            expect(result.html).toContain('je voudrais un rendez-vous');
        });
    });

    describe('accountVerifiedEmail', () => {
        it('should generate verification email', () => {
            const result = accountVerifiedEmail({
                firstName: 'Marie',
                businessName: 'Salon de Beauté Marie'
            });

            expect(result.subject).toContain('validé');
            expect(result.html).toContain('Félicitations');
            expect(result.html).toContain('Marie');
            expect(result.html).toContain('Salon de Beauté Marie');
        });
    });

    describe('documentsReceivedEmail', () => {
        it('should generate documents received email', () => {
            const result = documentsReceivedEmail({
                firstName: 'Marie',
                businessName: 'Salon Marie',
                documentsCount: 3
            });

            expect(result.subject).toContain('Documents reçus');
            expect(result.html).toContain('Marie');
            expect(result.html).toContain('3 document(s)');
            expect(result.html).toContain('24 à 48 heures');
        });
    });

    describe('documentsRejectedEmail', () => {
        it('should generate rejection email with reasons', () => {
            const result = documentsRejectedEmail({
                firstName: 'Marie',
                businessName: 'Salon Marie',
                reasons: ['Document illisible', 'Photo floue'],
                notes: 'Veuillez resoumettre des documents plus clairs'
            });

            expect(result.subject).toContain('corriger');
            expect(result.html).toContain('Marie');
            expect(result.html).toContain('Document illisible');
            expect(result.html).toContain('Photo floue');
            expect(result.html).toContain('resoumettre des documents plus clairs');
        });
    });

    describe('paymentSuccessEmail', () => {
        it('should generate payment success email', () => {
            const result = paymentSuccessEmail({
                firstName: 'Marie',
                transactionId: 'AELI1234567890',
                amount: 5000,
                currency: 'XAF',
                type: 'featured',
                description: 'Mise en avant 1 mois'
            });

            expect(result.subject).toContain('confirmé');
            expect(result.html).toContain('Marie');
            expect(result.html).toContain('AELI1234567890');
            expect(result.html).toContain('5');
            expect(result.html).toContain('XAF');
            expect(result.html).toContain('Mise en avant');
        });
    });

    describe('paymentFailedEmail', () => {
        it('should generate payment failed email', () => {
            const result = paymentFailedEmail({
                firstName: 'Marie',
                transactionId: 'AELI1234567890',
                amount: 5000,
                currency: 'XAF',
                errorMessage: 'Solde insuffisant'
            });

            expect(result.subject).toContain('Échec');
            expect(result.html).toContain('Marie');
            expect(result.html).toContain('AELI1234567890');
            expect(result.html).toContain('Solde insuffisant');
        });
    });

    describe('otpEmail', () => {
        it('should generate OTP email', () => {
            const result = otpEmail({
                firstName: 'Marie',
                otp: '123456'
            });

            expect(result.subject).toContain('vérification');
            expect(result.html).toContain('Marie');
            expect(result.html).toContain('123456');
            expect(result.html).toContain('10 minutes');
        });
    });

    describe('passwordResetEmail', () => {
        it('should generate password reset email', () => {
            const result = passwordResetEmail({
                firstName: 'Marie',
                resetUrl: 'http://example.com/reset/token123'
            });

            expect(result.subject).toContain('Réinitialisation');
            expect(result.html).toContain('Marie');
            expect(result.html).toContain('http://example.com/reset/token123');
            expect(result.html).toContain('1 heure');
        });
    });
});
