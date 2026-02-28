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

    // ── Additional templates added for coverage ───────────────────────────────

    const {
        subscriptionExpiringEmail,
        subscriptionExpiredEmail,
        contactStatusChangedEmail,
        providerFeaturedEmail,
        subscriptionRenewedEmail,
        accountDeactivatedEmail,
        passwordChangedConfirmationEmail,
        providerApprovedEmail,
        providerRejectedEmail,
        applicationReceivedEmail,
        providerVerificationRevokedEmail,
        providerDeactivatedEmail,
        providerReactivatedEmail,
        newReviewEmail
    } = require('../../src/utils/emailTemplates');

    const assertShape = (result) => {
        expect(result).toBeDefined();
        expect(result).toHaveProperty('subject');
        expect(result).toHaveProperty('html');
        expect(typeof result.subject).toBe('string');
        expect(typeof result.html).toBe('string');
    };

    describe('newReviewEmail', () => {
        it('should generate new review notification', () => {
            const result = newReviewEmail({ firstName: 'Mado', reviewerName: 'Jean', rating: 4, comment: 'Bien !' });
            assertShape(result);
            expect(result.html).toContain('Mado');
        });
    });

    describe('subscriptionExpiringEmail', () => {
        it('should warn about expiry with days left', () => {
            const result = subscriptionExpiringEmail({ firstName: 'Claire', businessName: 'Salon C', daysLeft: 3, endDate: new Date(), plan: 'monthly' });
            assertShape(result);
            expect(result.html).toContain('Claire');
            expect(result.html).toContain('3');
        });
    });

    describe('subscriptionExpiredEmail', () => {
        it('should notify that subscription has expired', () => {
            const result = subscriptionExpiredEmail({ firstName: 'Diane', businessName: 'Salon D' });
            assertShape(result);
            expect(result.html).toContain('Diane');
        });
    });

    describe('contactStatusChangedEmail', () => {
        it('should return null for pending status', () => {
            expect(contactStatusChangedEmail({ firstName: 'A', providerName: 'B', status: 'pending' })).toBeNull();
        });

        it('should return email for read status', () => {
            const result = contactStatusChangedEmail({ firstName: 'A', providerName: 'B', status: 'read' });
            assertShape(result);
            expect(result.subject).toContain('lue');
        });

        it('should return email for replied status', () => {
            const result = contactStatusChangedEmail({ firstName: 'A', providerName: 'B', status: 'replied' });
            assertShape(result);
            expect(result.subject).toContain('répondue');
        });
    });

    describe('providerFeaturedEmail', () => {
        it('should return featured = true email', () => {
            const result = providerFeaturedEmail({ firstName: 'Grace', businessName: 'Salon G', featured: true });
            assertShape(result);
            expect(result.subject).toContain('⭐');
        });

        it('should return featured = false email', () => {
            const result = providerFeaturedEmail({ firstName: 'Grace', businessName: 'Salon G', featured: false });
            assertShape(result);
        });
    });

    describe('subscriptionRenewedEmail', () => {
        it('should confirm renewal', () => {
            const result = subscriptionRenewedEmail({ firstName: 'Ines', businessName: 'Salon I', plan: 'monthly', endDate: new Date() });
            assertShape(result);
            expect(result.html).toContain('Ines');
        });
    });

    describe('accountDeactivatedEmail', () => {
        it('should notify account deactivation', () => {
            const result = accountDeactivatedEmail({ firstName: 'Joel', reason: 'CGU' });
            assertShape(result);
            expect(result.html).toContain('Joel');
        });
    });

    describe('passwordChangedConfirmationEmail', () => {
        it('should confirm password change', () => {
            const result = passwordChangedConfirmationEmail({ firstName: 'Kendra' });
            assertShape(result);
            expect(result.html).toContain('Kendra');
        });
    });

    describe('providerApprovedEmail', () => {
        it('should notify provider of approval', () => {
            const result = providerApprovedEmail({ firstName: 'Lisa', businessName: 'Salon L' });
            assertShape(result);
            expect(result.html).toContain('Lisa');
        });
    });

    describe('providerRejectedEmail', () => {
        it('should notify provider of rejection', () => {
            const result = providerRejectedEmail({ firstName: 'Marc', rejectionReason: 'Profil incomplet' });
            assertShape(result);
            expect(result.html).toContain('Marc');
        });
    });

    describe('applicationReceivedEmail', () => {
        it('should acknowledge application', () => {
            const result = applicationReceivedEmail({ firstName: 'Nina', businessName: 'Salon N' });
            assertShape(result);
            expect(result.html).toContain('Nina');
        });
    });

    describe('providerVerificationRevokedEmail', () => {
        it('should notify verification revocation', () => {
            const result = providerVerificationRevokedEmail({ firstName: 'Olive', businessName: 'Couture O', reason: 'Docs expiré' });
            assertShape(result);
            expect(result.html).toContain('Olive');
        });
    });

    describe('providerDeactivatedEmail', () => {
        it('should notify provider deactivation', () => {
            const result = providerDeactivatedEmail({ firstName: 'Pam', businessName: 'Salon P', reason: 'Signalement' });
            assertShape(result);
            expect(result.html).toContain('Pam');
        });
    });

    describe('providerReactivatedEmail', () => {
        it('should notify provider reactivation', () => {
            const result = providerReactivatedEmail({ firstName: 'Quinn', businessName: 'Salon Q' });
            assertShape(result);
            expect(result.html).toContain('Quinn');
        });
    });
});
