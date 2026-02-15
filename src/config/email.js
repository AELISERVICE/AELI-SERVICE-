const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
require('dotenv').config();

// Create Mailtrap transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// Verify transporter connection
const verifyTransporter = async () => {
    try {
        await transporter.verify();
        logger.info('✅ Email transporter is ready');
    } catch (error) {
        logger.error('❌ Email transporter error:', {
            error: error.message,
            stack: error.stack
        });
    }
};

// Send email helper function
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`📧 Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error('❌ Email sending failed:', {
            error: error.message,
            stack: error.stack,
            to: mailOptions.to,
            subject: mailOptions.subject
        });
        throw error;
    }
};

module.exports = {
    transporter,
    verifyTransporter,
    sendEmail
};
