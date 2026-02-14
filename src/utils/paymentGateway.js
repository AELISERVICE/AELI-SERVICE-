const axios = require('axios');
const { CINETPAY_CONFIG } = require('../config/cinetpay');
const { NOTCH_PAY_CONFIG } = require('../config/notchpay');
const logger = require('./logger');

/**
 * Initialize a payment with CinetPay
 */
const initializeCinetPayPayment = async ({ transactionId, amount, description, returnUrl, notifyUrl }) => {
    try {
        const response = await axios.post(CINETPAY_CONFIG.paymentUrl, {
            apikey: CINETPAY_CONFIG.apiKey,
            site_id: CINETPAY_CONFIG.siteId,
            transaction_id: transactionId,
            amount: amount,
            currency: CINETPAY_CONFIG.currency,
            description: description,
            notify_url: notifyUrl || CINETPAY_CONFIG.notifyUrl,
            return_url: returnUrl || CINETPAY_CONFIG.returnUrl,
            channels: CINETPAY_CONFIG.channels,
            lang: CINETPAY_CONFIG.lang
        });

        return response.data;
    } catch (error) {
        logger.error('CinetPay initialization error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Initialize a payment with NotchPay
 */
const initializeNotchPayPayment = async ({ email, amount, currency, description, reference, callback }) => {
    try {
        const response = await axios.post(
            `${NOTCH_PAY_CONFIG.baseUrl}/payments/initialize`,
            {
                email,
                amount,
                currency: currency || NOTCH_PAY_CONFIG.currency,
                description,
                reference,
                callback
            },
            {
                headers: {
                    Authorization: NOTCH_PAY_CONFIG.publicKey,
                    'Accept': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        logger.error('NotchPay initialization error:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    initializeCinetPayPayment,
    initializeNotchPayPayment
};
