/**
 * Test NotchPay Integration
 * Usage: node test-notchpay.js
 */

require('dotenv').config();
const { initializeNotchPayPayment } = require('./src/utils/paymentGateway');
const { NOTCH_PAY_CONFIG, validateConfig } = require('./src/config/notchpay');
const logger = require('./src/utils/logger');

async function testNotchPay() {
    console.log('\n🔧 === TEST NOTCHPAY INTEGRATION ===\n');

    // 1. Validate config
    console.log('1️⃣ Validation configuration...');
    const configValid = validateConfig();
    if (!configValid) {
        console.error('❌ Configuration NotchPay invalide (clés manquantes)');
        console.log('   Vérifiez NOTCH_PAY_PUBLIC_KEY et NOTCH_PAY_SECRET_KEY dans .env');
        process.exit(1);
    }
    console.log('✅ Configuration NotchPay valide\n');

    // 2. Afficher les clés (tronquées pour sécurité)
    console.log('2️⃣ Clés utilisées :');
    console.log(`   PUBLIC_KEY : ${NOTCH_PAY_CONFIG.publicKey.substring(0, 12)}...`);
    console.log(`   SECRET_KEY : ${NOTCH_PAY_CONFIG.secretKey.substring(0, 12)}...`);
    console.log(`   BASE_URL   : ${NOTCH_PAY_CONFIG.baseUrl}\n`);

    // 3. Test d'initialisation de paiement
    console.log('3️⃣ Test d\'initialisation paiement...');
    try {
        const paymentData = {
            email: 'test@example.com',
            amount: 500, // 500 XAF
            currency: 'XAF',
            description: 'Test NotchPay Integration',
            reference: `TEST-${Date.now()}`,
            callback: 'http://localhost:5173/payment/callback'
        };

        console.log('   Payload:', JSON.stringify(paymentData, null, 2));

        const response = await initializeNotchPayPayment(paymentData);

        console.log('\n✅ Succès NotchPay !');
        console.log('   Réponse brute:', JSON.stringify(response, null, 2));

        if (response && response.status === 'success') {
            console.log('\n🎉 Paiement initialisé avec succès !');
            console.log('   Transaction ID:', response.data?.reference || response.reference);
            console.log('   Payment URL:', response.data?.payment_url || response.payment_url);
            console.log('   Status:', response.data?.status || response.status);
        } else {
            console.log('\n⚠️ Réponse inattendue (voir ci-dessus)');
        }

    } catch (error) {
        console.error('\n❌ Erreur lors du test NotchPay:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('   Message:', error.message);
        }
        process.exit(1);
    }

    console.log('\n🏁 === TEST TERMINÉ ===\n');
}

// Exécuter le test
testNotchPay();
