/**
 * Test avec le vrai format de webhook NotchPay
 */

require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

// Le vrai payload que NotchPay envoie
const payload = {
  data: {
    amount: 12000,
    amounts: {},
    callback: "https://aeliservicesfrontuser.vercel.app/callback",
    charge: "business",
    created_at: "2026-03-19T15:00:00.000000Z",
    currency: "XAF",
    customer: "cus.test_TJmU0OWcPT1AQEmT",
    description: "Abonnement Trimestriel",
    merchant_reference: "AELI177393240002649715",
    payment_method: "pm.test_xKbP5ArGhZOl5B0l",
    reference: "trx.test_RIBR3ztBLQiZs7chpJ51U9W9",
    sandbox: 1,
    status: "complete",
    trxref: "AELI177393240002649715",
    updated_at: "2026-03-19T15:00:16.000000Z"
  },
  event: "payment.complete",
  id: "whc_test.I5MYhxSbGDgZ2wqc"
};

const rawBody = JSON.stringify(payload);
const signature = crypto
    .createHmac('sha256', process.env.NOTCH_PAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

console.log('🔧 Debug webhook NotchPay:');
console.log('  Payload:', JSON.stringify(payload, null, 2));
console.log('  Secret (first 10):', process.env.NOTCH_PAY_WEBHOOK_SECRET?.substring(0, 10));
console.log('  Calculated signature:', signature);
console.log('  Expected signature:', '064293c310e1de9913ced1112227ecdc5b79e40e32c782580f46a454547c6968');
console.log('  Match:', signature === '064293c310e1de9913ced1112227ecdc5b79e40e32c782580f46a454547c6968');

(async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/payments/notchpay/webhook', rawBody, {
            headers: {
                'Content-Type': 'application/json',
                'x-notch-signature': signature
            }
        });

        console.log('\n✅ Success');
        console.log('  Status:', response.status);
        console.log('  Body:', response.data);
    } catch (error) {
        console.error('\n❌ Error');
        if (error.response) {
            console.error('  Status:', error.response.status);
            console.error('  Body:', error.response.data);
        } else {
            console.error('  Message:', error.message);
        }
    }
})();
