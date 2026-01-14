/**
 * CinetPay Configuration
 * Documentation: https://docs.cinetpay.com
 */

const CINETPAY_CONFIG = {
    apiKey: process.env.CINETPAY_API_KEY,
    siteId: process.env.CINETPAY_SITE_ID,
    secretKey: process.env.CINETPAY_SECRET_KEY,

    // API URLs
    baseUrl: 'https://api-checkout.cinetpay.com/v2',
    paymentUrl: 'https://api-checkout.cinetpay.com/v2/payment',
    checkUrl: 'https://api-checkout.cinetpay.com/v2/payment/check',

    // Default settings
    currency: 'XAF', // Cameroon
    lang: 'FR',
    channels: 'ALL', // ALL, MOBILE_MONEY, CREDIT_CARD, WALLET

    // URLs (will be set from environment)
    notifyUrl: process.env.CINETPAY_NOTIFY_URL || `${process.env.API_BASE_URL}/api/payments/webhook`,
    returnUrl: process.env.CINETPAY_RETURN_URL || `${process.env.FRONTEND_URL}/payment/success`,

    // Payment amounts must be multiples of 5
    minAmount: 100,
    maxAmount: 1500000
};

/**
 * Validate CinetPay configuration
 */
const validateConfig = () => {
    const required = ['apiKey', 'siteId', 'secretKey'];
    const missing = required.filter(key => !CINETPAY_CONFIG[key]);

    if (missing.length > 0) {
        console.warn(`⚠️ CinetPay: Missing configuration: ${missing.join(', ')}`);
        return false;
    }
    return true;
};

/**
 * Payment status codes
 */
const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    WAITING_CUSTOMER: 'WAITING_CUSTOMER',
    ACCEPTED: 'ACCEPTED',
    REFUSED: 'REFUSED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED'
};

/**
 * CinetPay response codes
 */
const CINETPAY_CODES = {
    '00': 'SUCCESS',
    '201': 'CREATED',
    '600': 'PAYMENT_FAILED',
    '602': 'INSUFFICIENT_BALANCE',
    '604': 'OTP_CODE_ERROR',
    '608': 'MINIMUM_REQUIRED_FIELDS',
    '609': 'AUTH_NOT_FOUND',
    '623': 'WAITING_CUSTOMER_TO_VALIDATE',
    '624': 'PROCESSING_ERROR',
    '625': 'SERVICE_EXPIRED',
    '627': 'TRANSACTION_CANCEL',
    '662': 'WAITING_CUSTOMER_PAYMENT',
    '663': 'WAITING_CUSTOMER_OTP_CODE'
};

module.exports = {
    CINETPAY_CONFIG,
    PAYMENT_STATUS,
    CINETPAY_CODES,
    validateConfig
};
