const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const { User, Provider, Review, Contact } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

/**
 * Export users to CSV
 */
const exportUsersCSV = asyncHandler(async (req, res) => {
    const users = await User.findAll({
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'isActive', 'createdAt'],
        order: [['createdAt', 'DESC']],
        raw: true
    });

    const fields = ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'isActive', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(users);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
});

/**
 * Export providers to CSV
 */
const exportProvidersCSV = asyncHandler(async (req, res) => {
    const providers = await Provider.findAll({
        attributes: [
            'id', 'businessName', 'location', 'averageRating', 'totalReviews',
            'viewsCount', 'contactsCount', 'isVerified', 'isFeatured', 'createdAt'
        ],
        order: [['createdAt', 'DESC']],
        raw: true
    });

    const fields = [
        'id', 'businessName', 'location', 'averageRating', 'totalReviews',
        'viewsCount', 'contactsCount', 'isVerified', 'isFeatured', 'createdAt'
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(providers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=providers.csv');
    res.send(csv);
});

/**
 * Export reviews to CSV
 */
const exportReviewsCSV = asyncHandler(async (req, res) => {
    const reviews = await Review.findAll({
        attributes: ['id', 'rating', 'comment', 'isVisible', 'createdAt'],
        include: [
            { model: User, as: 'user', attributes: ['firstName', 'lastName'] },
            { model: Provider, as: 'provider', attributes: ['businessName'] }
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
    });

    // Flatten the data
    const flatReviews = reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isVisible: r.isVisible,
        reviewer: `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim(),
        provider: r.provider?.businessName || '',
        createdAt: r.createdAt
    }));

    const fields = ['id', 'rating', 'comment', 'isVisible', 'reviewer', 'provider', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(flatReviews);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=reviews.csv');
    res.send(csv);
});

/**
 * Export contacts to CSV
 */
const exportContactsCSV = asyncHandler(async (req, res) => {
    const contacts = await Contact.findAll({
        attributes: ['id', 'senderName', 'senderEmail', 'senderPhone', 'message', 'status', 'createdAt'],
        include: [
            { model: Provider, as: 'provider', attributes: ['businessName'] }
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
    });

    const flatContacts = contacts.map(c => ({
        id: c.id,
        senderName: c.senderName,
        senderEmail: c.senderEmail,
        senderPhone: c.senderPhone,
        message: c.message?.substring(0, 100) + (c.message?.length > 100 ? '...' : ''),
        status: c.status,
        provider: c.provider?.businessName || '',
        createdAt: c.createdAt
    }));

    const fields = ['id', 'senderName', 'senderEmail', 'senderPhone', 'message', 'status', 'provider', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(flatContacts);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csv);
});

/**
 * Export platform report to PDF
 */
const exportReportPDF = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    // Get stats
    const [userCount, providerCount, reviewCount, contactCount] = await Promise.all([
        User.count({ where: { isActive: true } }),
        Provider.count({ where: { isVerified: true } }),
        Review.count({ where: { isVisible: true } }),
        Contact.count()
    ]);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=platform-report.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(24).text('AELI Services - Rapport Plateforme', { align: 'center' });
    doc.moveDown();

    // Date
    doc.fontSize(12).text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, { align: 'center' });
    doc.moveDown(2);

    // Statistics section
    doc.fontSize(16).text('Statistiques Globales', { underline: true });
    doc.moveDown();

    const stats = [
        { label: 'Utilisateurs actifs', value: userCount },
        { label: 'Prestataires vérifiés', value: providerCount },
        { label: 'Avis publiés', value: reviewCount },
        { label: 'Demandes de contact', value: contactCount }
    ];

    stats.forEach(stat => {
        doc.fontSize(12).text(`${stat.label}: ${stat.value}`);
        doc.moveDown(0.5);
    });

    doc.moveDown(2);

    // Top providers section
    doc.fontSize(16).text('Top 10 Prestataires', { underline: true });
    doc.moveDown();

    const topProviders = await Provider.findAll({
        where: { isVerified: true },
        order: [['averageRating', 'DESC'], ['totalReviews', 'DESC']],
        limit: 10,
        attributes: ['businessName', 'location', 'averageRating', 'totalReviews']
    });

    topProviders.forEach((p, i) => {
        doc.fontSize(10).text(
            `${i + 1}. ${p.businessName} (${p.location}) - ⭐ ${p.averageRating} (${p.totalReviews} avis)`
        );
        doc.moveDown(0.3);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).fillColor('gray').text(
        'Ce rapport a été généré automatiquement par AELI Services.',
        { align: 'center' }
    );

    doc.end();
});

module.exports = {
    exportUsersCSV,
    exportProvidersCSV,
    exportReviewsCSV,
    exportContactsCSV,
    exportReportPDF
};
