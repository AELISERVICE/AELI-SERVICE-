const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * OTP configuration
 */
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

/**
 * Generate a random numeric OTP
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < OTP_LENGTH; i++) {
        otp += digits[Math.floor(crypto.randomInt(10))];
    }
    return otp;
};

/**
 * Hash an OTP for secure storage
 * @param {string} otp - Plain OTP
 * @returns {Promise<string>} Hashed OTP
 */
const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
};

/**
 * Verify an OTP against stored hash
 * @param {string} plainOTP - User-provided OTP
 * @param {string} hashedOTP - Stored hashed OTP
 * @returns {Promise<boolean>} Match result
 */
const verifyOTP = async (plainOTP, hashedOTP) => {
    return await bcrypt.compare(plainOTP, hashedOTP);
};

/**
 * Get OTP expiration date
 * @returns {Date} Expiration timestamp
 */
const getOTPExpiry = () => {
    return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

/**
 * Check if OTP is expired
 * @param {Date} expiryDate - OTP expiration date
 * @returns {boolean} True if expired
 */
const isOTPExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
};

/**
 * Generate OTP email template
 */
const otpEmailTemplate = ({ firstName, otp }) => {
    return {
        subject: 'Code de vérification AELI Services 🔐',
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code de vérification</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 2px solid #e91e63; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #e91e63; margin: 0; }
    .otp-box { background: linear-gradient(135deg, #e91e63, #c2185b); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0; }
    .warning { background: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ff9800; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌸 AELI Services</h1>
    </div>
    <h2>Bonjour ${firstName},</h2>
    <p>Voici votre code de vérification :</p>
    <div class="otp-box">${otp}</div>
    <div class="warning">
      <strong>⚠️ Important :</strong>
      <ul style="margin: 10px 0 0 0; padding-left: 20px;">
        <li>Ce code expire dans <strong>${OTP_EXPIRY_MINUTES} minutes</strong></li>
        <li>Ne partagez jamais ce code avec quiconque</li>
        <li>AELI Services ne vous demandera jamais ce code par téléphone</li>
      </ul>
    </div>
    <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AELI Services - Cameroun</p>
    </div>
  </div>
</body>
</html>
    `
    };
};

module.exports = {
    generateOTP,
    hashOTP,
    verifyOTP,
    getOTPExpiry,
    isOTPExpired,
    otpEmailTemplate,
    OTP_LENGTH,
    OTP_EXPIRY_MINUTES
};
