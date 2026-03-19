/**
 * Créer un paiement local pour tester le webhook NotchPay
 */

require('dotenv').config();
const { Payment } = require('./src/models');
const { sequelize } = require('./src/config/database');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connexion DB OK');

        const transactionId = 'TEST-LOCAL-DEBUG';

        // Vérifier si le paiement existe déjà
        let payment = await Payment.findByTransactionId(transactionId);
        
        if (payment) {
            console.log('ℹ️ Paiement déjà existant, suppression...');
            await payment.destroy();
        }

        // Créer le paiement
        payment = await Payment.create({
            transactionId,
            gateway: 'NotchPay',
            userId: null,
            providerId: null,
            type: 'contact_premium',
            amount: 500,
            currency: 'XAF',
            status: 'PENDING',
            description: 'Test webhook local NotchPay'
        });

        console.log('✅ Paiement créé avec succès :');
        console.log('   ID:', payment.id);
        console.log('   Transaction ID:', payment.transactionId);
        console.log('   Status:', payment.status);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await sequelize.close();
    }
})();
