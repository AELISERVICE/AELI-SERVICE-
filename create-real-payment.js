/**
 * Créer le paiement réel que NotchPay essaie de mettre à jour
 */

require('dotenv').config();
const { Payment } = require('./src/models');
const { sequelize } = require('./src/config/database');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connexion DB OK');

        const transactionId = 'AELI177393240002649715';

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
            type: 'subscription',
            amount: 12000,
            currency: 'XAF',
            status: 'PENDING',
            description: 'Abonnement Trimestriel',
            metadata: { type: 'subscription' }
        });

        console.log('✅ Paiement créé avec succès :');
        console.log('   ID:', payment.id);
        console.log('   Transaction ID:', payment.transactionId);
        console.log('   Status:', payment.status);
        console.log('   Amount:', payment.amount);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await sequelize.close();
    }
})();
