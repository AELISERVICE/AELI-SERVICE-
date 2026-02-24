const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AELI Services API',
            version: '1.0.0',
            description: `
API Backend pour la plateforme AELI Services - Connecte des clientes avec des femmes entrepreneures au Cameroun.

## Authentification
L'API utilise des JWT tokens:
- **Access Token**: Durée 15 minutes, utilisé dans l'header \`Authorization: Bearer <token>\`
- **Refresh Token**: Durée 7 jours, utilisé pour obtenir un nouveau access token

## Workflow d'inscription
1. \`POST /auth/register\` - Inscription + envoi OTP par email
2. \`POST /auth/verify-otp\` - Vérification du code OTP
3. Connexion avec les tokens reçus

## Rate Limiting
- Login: 5 tentatives / 15 min
- Register: 5 / heure
- OTP: 3 / 10 min
      `,
            contact: {
                name: 'AELI Services',
                email: 'contact@aeli-services.cm'
            },
            license: {
                name: 'ISC'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Serveur de développement'
            },
            {
                url: 'https://api.aeli-services.cm/api',
                description: 'Serveur de production'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Entrez votre access token JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        phone: { type: 'string' },
                        role: { type: 'string', enum: ['client', 'provider', 'admin'] },
                        profilePhoto: { type: 'string' },
                        isActive: { type: 'boolean' },
                        isEmailVerified: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Provider: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        userId: { type: 'string', format: 'uuid' },
                        businessName: { type: 'string' },
                        description: { type: 'string' },
                        location: { type: 'string' },
                        address: { type: 'string' },
                        whatsapp: { type: 'string' },
                        facebook: { type: 'string' },
                        instagram: { type: 'string' },
                        photos: { type: 'array', items: { type: 'string' } },
                        isVerified: { type: 'boolean' },
                        isFeatured: { type: 'boolean' },
                        viewsCount: { type: 'integer' },
                        contactsCount: { type: 'integer' },
                        averageRating: { type: 'number' },
                        totalReviews: { type: 'integer' },
                        profilePhoto: { type: 'string', description: 'URL du logo/photo de profil du prestataire' }
                    }
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        description: { type: 'string' },
                        icon: { type: 'string' },
                        isActive: { type: 'boolean' },
                        order: { type: 'integer' }
                    }
                },
                Service: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        providerId: { type: 'string', format: 'uuid' },
                        categoryId: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        price: { type: 'number' },
                        priceType: { type: 'string', enum: ['fixed', 'from', 'range', 'contact'] },
                        duration: { type: 'integer', description: 'Durée en minutes' },
                        tags: { type: 'array', items: { type: 'string' } },
                        photo: { type: 'string', description: 'URL de la photo du service' },
                        isActive: { type: 'boolean' }
                    }
                },
                Review: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        providerId: { type: 'string', format: 'uuid' },
                        userId: { type: 'string', format: 'uuid' },
                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                        comment: { type: 'string' },
                        isVisible: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Contact: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        providerId: { type: 'string', format: 'uuid' },
                        message: { type: 'string' },
                        senderName: { type: 'string' },
                        senderEmail: { type: 'string', format: 'email' },
                        senderPhone: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'read', 'replied'] },
                        isUnlocked: { type: 'boolean' },
                        unlockedAt: { type: 'string', format: 'date-time' },
                        unlockPaymentId: { type: 'string', format: 'uuid' },
                        needsUnlock: { type: 'boolean' },
                        unlockPrice: { type: 'integer', example: 500 }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        code: { type: 'string' }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    }
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        currentPage: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        totalItems: { type: 'integer' },
                        itemsPerPage: { type: 'integer' },
                        hasNextPage: { type: 'boolean' },
                        hasPrevPage: { type: 'boolean' }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Token manquant ou invalide',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                ForbiddenError: {
                    description: 'Accès interdit',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Ressource non trouvée',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                ValidationError: {
                    description: 'Erreur de validation',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    message: { type: 'string' },
                                    errors: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                field: { type: 'string' },
                                                message: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentification et gestion des tokens' },
            { name: 'Users', description: 'Gestion du profil utilisateur' },
            { name: 'Providers', description: 'Gestion des prestataires' },
            { name: 'Services', description: 'Services et catégories' },
            { name: 'Reviews', description: 'Avis et notations' },
            { name: 'Favorites', description: 'Gestion des favoris' },
            { name: 'Contacts', description: 'Demandes de contact' },
            { name: 'Abonnements', description: 'Gestion des abonnements prestataires' },
            { name: 'Admin', description: 'Administration (admin uniquement)' },
            { name: 'Admin - Sécurité', description: 'Gestion de la sécurité (admin uniquement)' },
            { name: 'Banners', description: 'Gestion des bannières publicitaires' },
            { name: 'Payments', description: 'Gestion des paiements (CinetPay & NotchPay)' }
        ]
    },
    apis: ['./src/routes/*.js', './src/swagger/*.yaml']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
