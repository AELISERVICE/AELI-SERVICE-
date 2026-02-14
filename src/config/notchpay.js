/**
 * NotchPay Configuration
 * Documentation: https://docs.notchpay.co
 */

const NOTCH_PAY_CONFIG = {
    publicKey: process.env.NOTCH_PAY_PUBLIC_KEY,
    secretKey: process.env.NOTCH_PAY_SECRET_KEY,

    // API URLs
    baseUrl: 'https://api.notchpay.co',

    // Default settings
    currency: 'XAF', // Cameroon

    // Webhook/Callback
    callbackUrl: process.env.NOTCH_PAY_CALLBACK_URL || `${process.env.FRONTEND_URL}/payment/callback`,
    webhookUrl: process.env.NOTCH_PAY_WEBHOOK_URL || `${process.env.API_BASE_URL}/api/payments/notchpay/webhook`
};

/**
 * NotchPay status mapping to internal Payment status
 */
const NOTCH_PAY_STATUS = {
    'pending': 'PENDING',
    'processing': 'WAITING_CUSTOMER',
    'complete': 'ACCEPTED',
    'failed': 'REFUSED',
    'canceled': 'CANCELLED',
    'expired': 'EXPIRED'
};

const validateConfig = () => {
    const required = ['publicKey', 'secretKey'];
    const missing = required.filter(key => !NOTCH_PAY_CONFIG[key]);

    if (missing.length > 0) {
        console.warn(`⚠️ NotchPay: Missing configuration: ${missing.join(', ')}`);
        return false;
    }
    return true;
};

module.exports = {
    NOTCH_PAY_CONFIG,
    NOTCH_PAY_STATUS,
    validateConfig
};
