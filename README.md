# AELI Services Backend API

Backend API pour la plateforme AELI Services - une plateforme connectant des clientes avec des femmes entrepreneures et prestataires de services au Cameroun.

## 🚀 Stack Technologique

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de données**: PostgreSQL + Sequelize ORM
- **Authentification**: JWT (JSON Web Tokens)
- **Upload d'images**: Cloudinary
- **Email**: Nodemailer (Mailtrap SMTP)
- **Sécurité**: Helmet, CORS, Rate Limiting

## 📁 Structure du Projet

```
backend/
├── src/
│   ├── config/          # Configurations (DB, Cloudinary, Email)
│   ├── controllers/     # Logique métier (8 controllers)
│   ├── middlewares/     # Auth, validation, erreurs, upload
│   ├── models/          # Modèles Sequelize (7 modèles)
│   ├── routes/          # Routes Express (8 fichiers)
│   ├── utils/           # Logger, templates email, helpers
│   ├── validators/      # Règles de validation
│   └── app.js           # Configuration Express
├── logs/                # Fichiers de log
├── .env.example         # Template variables d'environnement
├── package.json
├── server.js            # Point d'entrée
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

## 🔗 Endpoints API

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
| POST | `/create` | Créer profil (provider) |
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

## 🛡️ Sécurité

- Rate limiting sur login (5 tentatives/15 min)
- Rate limiting général (100 req/min)
- Hashage bcrypt des mots de passe
- Protection CORS
- Headers sécurité (Helmet)
- Validation des entrées (express-validator)

## 📝 Logs

Les logs sont enregistrés dans :
- `logs/error.log` : Erreurs uniquement
- `logs/combined.log` : Tous les logs

## 🧪 Tests

```bash
npm test
```

## 📄 License

ISC

---

Développé avec ❤️ pour AELI Services - Cameroun 🇨🇲
