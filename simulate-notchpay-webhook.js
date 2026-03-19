/**
 * Simulate a NotchPay webhook call with a valid signature.
 * Usage: node simulate-notchpay-webhook.js [url]
 * Default URL: http://localhost:5000/api/payments/notchpay/webhook
 */

require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const WEBHOOK_URL = process.argv[2] || process.env.NOTCH_PAY_WEBHOOK_URL || 'http://localhost:5000/api/payments/notchpay/webhook';

if (!process.env.NOTCH_PAY_WEBHOOK_SECRET) {
    console.error('❌ NOTCH_PAY_WEBHOOK_SECRET is not defined. Please set it in your .env file.');
    process.exit(1);
}

const payload = {
    event: 'payment.completed',
    data: {
        reference: 'trx.test_local_simulation',
        merchant_reference: 'TEST-WEBHOOK-LOCAL',
        status: 'complete'
    }
};

(async () => {
    try {
        const rawBody = JSON.stringify(payload);
        const signature = crypto
            .createHmac('sha256', process.env.NOTCH_PAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');

        const response = await axios.post(WEBHOOK_URL, rawBody, {
            headers: {
                'Content-Type': 'application/json',
                'x-notch-signature': signature
            }
        });

        console.log('✅ Webhook sent successfully');
        console.log('Status:', response.status);
        console.log('Body:', response.data);
    } catch (error) {
        console.error('❌ Webhook failed');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
        process.exit(1);
    }
})();
