/**
 * Créer un vrai paiement NotchPay et obtenir l'URL de paiement pour validation manuelle
 */

require('dotenv').config();
const { initializeNotchPayPayment } = require('./src/utils/paymentGateway');
const { Payment } = require('./src/models');
const { sequelize } = require('./src/config/database');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connexion DB OK');

        // Générer une référence unique
        const transactionId = `NOTCH-${Date.now()}`;

        // Créer le paiement en base
        const payment = await Payment.create({
            transactionId,
            gateway: 'NotchPay',
            userId: null,
            providerId: null,
            type: 'contact_premium',
            amount: 500,
            currency: 'XAF',
            status: 'PENDING',
            description: 'Test NotchPay paiement réel',
            metadata: { type: 'contact_premium' }
        });

        console.log('✅ Paiement créé en base :');
        console.log('   Transaction ID:', payment.transactionId);
        console.log('   Status:', payment.status);

        // Initialiser le paiement NotchPay
        const notchPayResponse = await initializeNotchPayPayment({
            email: 'test@example.com',
            amount: 500,
            currency: 'XAF',
            description: 'Test NotchPay paiement réel',
            reference: transactionId,
            callback: 'https://practical-edges-camera-glad.trycloudflare.com/api/payments/notchpay/webhook'
        });

        console.log('\n✅ Paiement NotchPay initialisé !');
        console.log('   Réponse:', JSON.stringify(notchPayResponse, null, 2));

        if (notchPayResponse && notchPayResponse.authorization_url) {
            console.log('\n🎉 URL de paiement à valider manuellement :');
            console.log('   ', notchPayResponse.authorization_url);
            console.log('\n📝 Instructions :');
            console.log('   1. Ouvre cette URL dans ton navigateur');
            console.log('   2. Complète le paiement (mode test)');
            console.log('   3. Le webhook sera appelé automatiquement');
            console.log('   4. Vérifie les logs du serveur et le dashboard NotchPay');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        }
    } finally {
        await sequelize.close();
    }
})();
