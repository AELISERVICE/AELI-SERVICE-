# AELI Services Backend API

Backend API pour la plateforme AELI Services - une plateforme connectant des clientes avec des femmes entrepreneures et prestataires de services au Cameroun.

## ✨ Fonctionnalités Principales

### 👥 Gestion des Utilisateurs
- **Inscription** avec validation OTP par email
- **Authentification** JWT avec rafraîchissement automatique
- **Profils** clients et prestataires avec photos multiples
- **Système de réputation** avec avis et notes
- **Sécurité** avancée (rate limiting, audit logs)

### 🏢 Gestion des Prestataires
- **Candidatures** pour devenir prestataire avec validation admin
- **Profils détaillés** avec services, photos, localisation
- **Tableau de bord** avec statistiques (vues, contacts, revenus)
- **Abonnements** mensuels/trimestriels/annuels avec auto-renouvellement
- **Visibilité** avec système de mise en avant

### 💰 Système de Monétisation
- **Pay-per-view** pour débloquer les coordonnées des contacts
- **Abonnements** premium pour accès illimité aux contacts
- **Paiements** intégrés (CinetPay, NotchPay)
- **Commission** automatique sur les transactions
- **Export** des données comptables (CSV, PDF)

### 📞 Gestion des Contacts
- **Messages** chiffrés entre clientes et prestataires
- **Statuts** (pending, read, replied) avec notifications
- **Déblocage** par paiement ou abonnement
- **Historique** complet avec recherche et filtrage

### 🌐 Internationalisation
- **Support multilingue** (Français/Anglais)
- **Localisation** automatique selon préférence
- **Templates email** localisés
- **Messages d'erreur** traduits

### 📊 Administration
- **Tableau de bord** admin avec statistiques en temps réel
- **Gestion** des utilisateurs et prestataires
- **Modération** des avis et contenus
- **Audit logs** complet de toutes les actions
- **Export** des données administratives

## 🚀 Stack Technologique

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de données**: PostgreSQL + Sequelize ORM
- **Authentification**: JWT (JSON Web Tokens) + OTP
- **Upload d'images**: Cloudinary
- **Email**: Nodemailer (Mailtrap SMTP)
- **Sécurité**: Helmet, CORS, Rate Limiting, CSRF Protection
- **Internationalisation**: i18n (Français/Anglais)
- **Payments**: CinetPay, NotchPay
- **File Processing**: Multer, PDFKit, json2csv
- **Logging**: Winston
- **Job Queue**: Bull (Redis)
- **Testing**: Jest + Supertest
- **Real-time**: Socket.io

## 📁 Structure du Projet

```
backend/
├── src/
│   ├── config/          # Configurations (DB, Cloudinary, Email, CORS)
│   ├── controllers/     # Logique métier (11 controllers)
│   ├── middlewares/     # Auth, validation, erreurs, upload, i18n
│   ├── models/          # Modèles Sequelize (13 modèles avec hooks)
│   ├── routes/          # Routes Express (10 fichiers)
│   ├── utils/           # Logger, templates email, helpers, encryption
│   ├── validators/      # Règles de validation (10 validateurs)
│   ├── jobs/            # Tâches cron et processeurs
│   ├── locales/         # Fichiers i18n (fr, en)
│   └── app.js           # Configuration Express
├── tests/               # Tests unitaires et d'intégration
│   ├── unit/           # Tests unitaires (32 fichiers)
│   ├── integration/    # Tests d'intégration (13 fichiers)
│   ├── fixtures/       # Données de test
│   └── setup.js        # Configuration des tests
├── database/           # Migrations et seeds
├── docs/               # Documentation API
├── logs/               # Fichiers de log
├── migrations/         # Scripts de migration
├── seeds/              # Données de test
├── .env.example        # Template variables d'environnement
├── package.json
├── server.js           # Point d'entrée
└── README.md
```

## ⚙️ Installation

### 1. Cloner et installer les dépendances

```bash
cd aeli_service_backend
npm install
```

### 2. Configurer les variables d'environnement

Copier `.env.example` vers `.env` et remplir les valeurs :

```bash
cp .env.example .env
```

Configuration requise :
- **Base de données PostgreSQL** : Créer une base `aeli_services`
- **Cloudinary** : Créer un compte et récupérer les clés API
- **Mailtrap** : Créer un compte et récupérer les identifiants SMTP

### 3. Créer la base de données PostgreSQL

```sql
CREATE DATABASE aeli_services;
```

### 4. Lancer le serveur

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur démarrera sur `http://localhost:5000`

## � Docker

Le projet inclut une configuration Docker complète :

```bash
# Construire les images
npm run docker:build

# Lancer les services
npm run docker:up

# Voir les logs
npm run docker:logs

# Arrêter les services
npm run docker:down
```

Services Docker inclus :
- **API** : Node.js + Express
- **PostgreSQL** : Base de données
- **Redis** : Cache et queue de tâches
- **Nginx** : Reverse proxy (optionnel)

## 🚀 Déploiement

### Variables d'environnement requises

```bash
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aeli_services
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

# Redis (optionnel)
REDIS_HOST=localhost
REDIS_PORT=6379

# Application
NODE_ENV=production
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### Health Checks

```bash
# Vérifier le statut de l'API
curl http://localhost:5000/api/health

# Vérifier la connectivité DB
curl http://localhost:5000/api/health/db
```

## �🔗 Endpoints API

### Authentification (`/api/auth`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Inscription |
| POST | `/login` | Connexion |
| POST | `/forgot-password` | Mot de passe oublié |
| POST | `/reset-password/:token` | Réinitialisation |
| GET | `/me` | Profil utilisateur connecté |

### Utilisateurs (`/api/users`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/profile` | Obtenir profil |
| PUT | `/profile` | Mettre à jour profil |
| PUT | `/password` | Changer mot de passe |
| DELETE | `/account` | Désactiver compte |

### Prestataires (`/api/providers`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste (paginée, filtrable) |
| GET | `/:id` | Détails d'un prestataire |
| POST | `/apply` | Candidature prestataire (client→provider) |
| GET | `/my-application` | Statut de ma candidature |
| PUT | `/:id` | Modifier profil |
| DELETE | `/:id/photos/:index` | Supprimer photo |
| GET | `/my-profile` | Mon profil |
| GET | `/my-dashboard` | Tableau de bord |

### Services (`/api/services`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/categories` | Liste des catégories |
| POST | `/categories` | Créer catégorie (admin) |
| GET | `/provider/:id` | Services d'un prestataire |
| POST | `/` | Créer service |
| PUT | `/:id` | Modifier service |
| DELETE | `/:id` | Supprimer service |

### Avis (`/api/reviews`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/provider/:id` | Avis d'un prestataire |
| POST | `/` | Créer avis |
| PUT | `/:id` | Modifier avis |
| DELETE | `/:id` | Supprimer avis |

### Favoris (`/api/favorites`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Mes favoris |
| POST | `/` | Ajouter favori |
| DELETE | `/:providerId` | Retirer favori |
| GET | `/check/:providerId` | Vérifier si favori |

### Contacts (`/api/contacts`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/` | Envoyer message |
| GET | `/received` | Messages reçus (provider) |
| GET | `/sent` | Messages envoyés |
| PUT | `/:id/status` | Mettre à jour statut |

### Administration (`/api/admin`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/stats` | Statistiques plateforme |
| GET | `/users` | Liste utilisateurs |
| PUT | `/users/:id/status` | Activer/désactiver |
| GET | `/providers/pending` | Prestataires en attente |
| PUT | `/providers/:id/verify` | Valider prestataire |
| PUT | `/providers/:id/feature` | Mettre en avant |
| GET | `/reviews` | Tous les avis |
| PUT | `/reviews/:id/visibility` | Modérer avis |

### Recherche (`/api/search`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Recherche globale |

**Paramètres de recherche** :
- `q` : Terme de recherche
- `category` : Slug catégorie
- `location` : Ville/quartier
- `minRating` : Note minimum (1-5)
- `sort` : Tri (rating, recent, views)
- `page` : Page
- `limit` : Éléments par page

## 🔐 Authentification

Toutes les routes protégées nécessitent un token JWT dans l'en-tête :

```
Authorization: Bearer <token>
```

## 📧 Emails

5 templates email sont configurés :
- Email de bienvenue
- Notification nouvelle demande de contact
- Validation compte prestataire
- Notification nouvel avis
- Réinitialisation mot de passe

## 🛡️ Sécurité et Conformité

### 🔐 Sécurité des Données
- **Chiffrement** des données sensibles (emails, téléphones) avec AES-256
- **Hashage** bcrypt des mots de passe avec salt
- **Tokens** JWT avec expiration configurable
- **OTP** à usage unique pour validation email
- **CSRF** protection pour les formulaires
- **Rate limiting** configurable par endpoint

### 🛡️ Protection des Attaques
- **Rate limiting** sur login (5 tentatives/15 min)
- **Rate limiting** général (100 req/min)
- **Protection** XSS avec nettoyage automatique
- **Protection** SQL injection via Sequelize ORM
- **Headers sécurité** (Helmet) avec configuration stricte
- **Validation** stricte des entrées utilisateur

### 📋 Audit et Conformité
- **Audit logs** complets de toutes les actions sensibles
- **Logs de sécurité** pour tentatives d'intrusion
- **Gestion** des consentements RGPD
- **Anonymisation** des données personnelles sur demande
- **Export** des données personnelles (RGPD)
- **Suppression** complète des comptes utilisateur

### 🔍 Monitoring
- **Logs structurés** avec Winston
- **Alertes** sur activités suspectes
- **Métriques** de performance et erreurs
- **Health checks** automatiques des services
- **Monitoring** des tentatives de fraude

## 📝 Logs

Les logs sont enregistrés dans :
- `logs/error.log` : Erreurs uniquement
- `logs/combined.log` : Tous les logs

## 🧪 Tests

Le projet utilise **Jest** pour les tests unitaires et d'intégration avec une couverture complète de l'API.

### Scripts de test disponibles

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests avec rapport de couverture détaillé
npm run test:coverage

# Exécuter les tests en mode watch (re-lance automatiquement)
npm run test:watch

# Exécuter un fichier de test spécifique
npm test -- tests/unit/User.test.js

# Exécuter les tests par pattern
npm test -- tests/unit/
npm test -- tests/integration/

# Exécuter les tests avec sortie détaillée
npm test -- --verbose
```

### Structure des tests

- **Tests unitaires** (`tests/unit/`) : 32 fichiers testant les modèles, contrôleurs, utilitaires et validateurs isolément
- **Tests d'intégration** (`tests/integration/`) : 13 fichiers testant les flux API complets avec base de données
- **Fixtures** (`tests/fixtures/`) : Données de test réutilisables
- **Setup** (`tests/setup.js`) : Configuration de la base de données de test et nettoyage

### Types de tests couverts

✅ **Modèles Sequelize** : Hooks, méthodes d'instance, validation, relations  
✅ **Contrôleurs** : Logique métier, gestion d'erreurs, validation  
✅ **Middlewares** : Authentification, validation, rate limiting  
✅ **Routes API** : Endpoints REST, gestion des requêtes/réponses  
✅ **Utilitaires** : Encryption, helpers, templates email  
✅ **Validateurs** : Règles de validation des entrées  
✅ **Intégration** : Flux utilisateur complets, base de données réelle

### 📊 Couverture de Tests (Rapport Actuel)

**Statistiques globales :**
- **Tests** : 596 tests passants sur 51 suites
- **Lignes** : 82.37%
- **Statements** : 74.45%
- **Fonctions** : 71.14%
- **Branches** : 76.47%

**Couverture par module principal :**

| Module | Lignes | Statements | Fonctions | Branches |
|--------|--------|------------|-----------|----------|
| **src/models/** | | | | |
| Contact.js | 87.23% | 69.23% | 100% | 90.9% |
| User.js | 100% | 94.44% | 100% | 100% |
| Provider.js | 70.73% | 65.21% | 88.88% | 71.79% |
| Payment.js | 69.69% | 33.33% | 80% | 69.69% |
| Subscription.js | 88.88% | 90.47% | 75% | 88.67% |
| Review.js | 100% | 100% | 100% | 100% |
| Favorite.js | 100% | 100% | 100% | 100% |
| Service.js | 100% | 100% | 100% | 100% |

| **src/controllers/** | | | | |
| Tous les controllers | ~85% | ~80% | ~85% | ~82% |

| **src/utils/** | | | | |
| encryption.js | 90.41% | 88.23% | 100% | 90.27% |
| helpers.js | 81.81% | 72.91% | 69.23% | 85.41% |
| dbHelpers.js | 94.73% | 76.47% | 100% | 94.28% |
| responseHelpers.js | 100% | 100% | 100% | 100% |

**Points forts de la couverture :**
- Tests unitaires complets pour tous les modèles
- Couverture élevée pour les utilitaires critiques (encryption, helpers)
- Tests d'intégration pour toutes les routes API
- Validation complète des middlewares d'authentification

**Axes d'amélioration :**
- Augmenter la couverture des routes admin (45.45%)
- Améliorer la couverture des workers et webhooks
- Ajouter des tests pour les cas d'erreur complexes

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez consulter le [Guide de Contribution](CONTRIBUTING.md) pour plus de détails sur la manière de participer.

## 📄 License

ISC

---

Développé par NGOUE DAVID pour AELI Services - Cameroun avec beaucoup de fatigue de flemme et de maladie
