/**
 * Test local NotchPay webhook with debug output.
 */

require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const payload = {
    event: 'payment.completed',
    data: {
        reference: 'trx.test_local_debug',
        merchant_reference: 'TEST-LOCAL-DEBUG',
        status: 'complete'
    }
};

const rawBody = JSON.stringify(payload);
const signature = crypto
    .createHmac('sha256', process.env.NOTCH_PAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

console.log('🔧 Debug info:');
console.log('  Payload:', rawBody);
console.log('  Secret (first 10 chars):', process.env.NOTCH_PAY_WEBHOOK_SECRET?.substring(0, 10) + '...');
console.log('  Signature:', signature);
console.log('  Target URL: http://localhost:5000/api/payments/notchpay/webhook');

(async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/payments/notchpay/webhook', rawBody, {
            headers: {
                'Content-Type': 'application/json',
                'x-notch-signature': signature
            }
        });

        console.log('✅ Success');
        console.log('  Status:', response.status);
        console.log('  Body:', response.data);
    } catch (error) {
        console.error('❌ Error');
        if (error.response) {
            console.error('  Status:', error.response.status);
            console.error('  Body:', error.response.data);
        } else {
            console.error('  Message:', error.message);
        }
    }
})();
