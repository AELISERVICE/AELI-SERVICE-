const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Cameroon locations
const locations = ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Kribi', 'Limbé'];

// Categories seed data
const categories = [
    { name: 'Beauté & Bien-être', slug: 'beaute-bien-etre', description: 'Coiffure, maquillage, soins du corps', icon: '💄', order: 1, isActive: true },
    { name: 'Événementiel', slug: 'evenementiel', description: 'Organisation de mariages, anniversaires, cérémonies', icon: '🎉', order: 2, isActive: true },
    { name: 'Restauration', slug: 'restauration', description: 'Traiteur, pâtisserie, restauration', icon: '🍽️', order: 3, isActive: true },
    { name: 'Mode & Couture', slug: 'mode-couture', description: 'Stylistes, couturiers, designers', icon: '👗', order: 4, isActive: true },
    { name: 'Photographie', slug: 'photographie', description: 'Photographes et vidéastes', icon: '📸', order: 5, isActive: true },
    { name: 'Décoration', slug: 'decoration', description: 'Décoration intérieure et événementielle', icon: '🎨', order: 6, isActive: true },
    { name: 'Artisanat', slug: 'artisanat', description: 'Artisans locaux, créations uniques', icon: '🪵', order: 7, isActive: true },
    { name: 'Services à domicile', slug: 'services-domicile', description: 'Ménage, jardinage, bricolage', icon: '🏠', order: 8, isActive: true }
];

// Generate random user
const generateUser = (index, role = 'client') => {
    const firstNames = ['Marie', 'Paul', 'Sophie', 'Jean', 'Fatou', 'Ibrahim', 'Aminata', 'Emmanuel', 'Chantal', 'Pierre'];
    const lastNames = ['Ndiaye', 'Kamga', 'Mbarga', 'Fokou', 'Onana', 'Tchinda', 'Ngo Biyick', 'Fotso', 'Eyinga', 'Ngono'];

    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[index % lastNames.length];

    return {
        id: uuidv4(),
        firstName,
        lastName,
        email: `${firstName.toLowerCase().replace(/\s+/g, '')}.${lastName.toLowerCase().replace(/\s+/g, '')}${index}@example.com`,
        password: bcrypt.hashSync('Password123!', 10),
        phone: `+2376${String(Math.floor(Math.random() * 90000000 + 10000000))}`,
        role,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
};

// Generate provider
const generateProvider = (userId, index) => {
    const businessNames = [
        'Beauté Divine', 'Élégance Couture', 'Saveurs du Cameroun',
        'Photo Studio Pro', 'Déco Prestige', 'Événements Magiques',
        'Artisan du Pays', 'Maison Propre'
    ];

    return {
        id: uuidv4(),
        userId,
        businessName: `${businessNames[index % businessNames.length]} ${index + 1}`,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
        location: locations[index % locations.length],
        address: `Rue ${index + 1}, Quartier Centre`,
        whatsapp: `+2376${String(Math.floor(Math.random() * 90000000 + 10000000))}`,
        photos: [],
        averageRating: (3 + Math.random() * 2).toFixed(1),
        totalReviews: Math.floor(Math.random() * 50),
        viewsCount: Math.floor(Math.random() * 500),
        contactsCount: Math.floor(Math.random() * 100),
        isVerified: Math.random() > 0.3,
        isFeatured: Math.random() > 0.8,
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Random date in last 6 months
        updatedAt: new Date()
    };
};

// Generate service
const generateService = (providerId, categoryId, index) => {
    const serviceNames = [
        'Coiffure complète', 'Maquillage mariage', 'Menu traiteur 50 personnes',
        'Séance photo portrait', 'Décoration salle', 'Organisation anniversaire',
        'Création sur mesure', 'Nettoyage maison'
    ];

    return {
        id: uuidv4(),
        providerId,
        categoryId,
        name: `${serviceNames[index % serviceNames.length]} ${index + 1}`,
        description: 'Service professionnel de qualité supérieure.',
        price: Math.random() > 0.2 ? Math.floor(Math.random() * 100000 + 5000) : null,
        priceType: ['fixed', 'from', 'range', 'contact'][Math.floor(Math.random() * 4)],
        duration: Math.floor(Math.random() * 4 + 1) * 60,
        tags: ['professionnel', 'qualité'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
};

// Generate review
const generateReview = (userId, providerId, index) => {
    const comments = [
        'Excellent service, je recommande vivement !',
        'Très professionnel et ponctuel.',
        'Travail de qualité, prix raisonnable.',
        'Bonne expérience, je reviendrai.',
        'Service impeccable, merci beaucoup !'
    ];

    return {
        id: uuidv4(),
        userId,
        providerId,
        rating: Math.floor(Math.random() * 3 + 3), // 3-5 stars
        comment: comments[index % comments.length],
        isVisible: true,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
    };
};

module.exports = {
    categories,
    locations,
    generateUser,
    generateProvider,
    generateService,
    generateReview
};
