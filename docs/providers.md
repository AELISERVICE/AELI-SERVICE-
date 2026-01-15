# 🏢 Providers API

Gestion des profils prestataires.

## Base URL
```
/api/providers
```

> 💡 **i18n**: Ajoutez `?lang=en` pour les messages en anglais. Voir [README](./README.md#-internationalisation-i18n).

---

## Endpoints Publics

### GET `/` - Liste des Prestataires

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page |
| `limit` | int | 12 | Éléments/page (max 50) |
| `category` | string | - | Slug catégorie |
| `location` | string | - | Ville/quartier |
| `minRating` | number | - | Note minimum (0-5) |
| `search` | string | - | Recherche texte |
| `sort` | string | recent | `rating`, `recent`, `views`, `name` |

**Exemple:**
```
GET /api/providers?category=coiffure&location=Douala&minRating=4&sort=rating
```

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": "uuid",
        "businessName": "Salon Marie",
        "description": "...",
        "location": "Douala",
        "photos": ["url1", "url2"],
        "averageRating": 4.5,
        "totalReviews": 12,
        "isVerified": true,
        "user": { "firstName": "Marie", "profilePhoto": "..." }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48
    }
  }
}
```

---

### GET `/:id` - Détails d'un Prestataire

Incrémente automatiquement le compteur de vues.

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "provider": {
      "id": "uuid",
      "businessName": "Salon Marie",
      "description": "Description détaillée...",
      "location": "Douala, Bonanjo",
      "address": "123 Rue de la Paix",
      "whatsapp": "+237690000000",
      "facebook": "https://facebook.com/...",
      "instagram": "@salonmarie",
      "photos": [...],
      "averageRating": 4.5,
      "totalReviews": 12,
      "viewsCount": 150,
      "contactsCount": 25,
      "isVerified": true,
      "user": { ... },
      "services": [ ... ]
    }
  }
}
```

---

## Endpoints Protégés 🔒

### POST `/apply` - Candidature Prestataire

⚠️ **Rôle requis:** `client` (tous les users s'inscrivent comme client)

Soumet une candidature pour devenir prestataire. Après approbation par un admin, le rôle passe à `provider`.

**Content-Type:** `multipart/form-data`

**Body:**
| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `businessName` | string | ✅ | Nom de l'activité |
| `description` | string | ✅ | Description (min 50 chars) |
| `location` | string | ✅ | Ville/quartier |
| `address` | string | - | Adresse complète |
| `whatsapp` | string | - | Numéro WhatsApp |
| `facebook` | string | - | Lien Facebook |
| `instagram` | string | - | @ Instagram |
| `photos` | file[] | - | Photos activité (max 5) |
| `documents` | file[] | ✅ | CNI obligatoire (PDF/JPG) |

**Réponse 201:**
```json
{
  "success": true,
  "message": "Votre candidature a été soumise avec succès.",
  "data": { 
    "application": { 
      "id": "...",
      "businessName": "...",
      "status": "pending",
      "createdAt": "..."
    } 
  }
}
```

**Erreurs:**
- `400` - CNI obligatoire
- `400` - Candidature déjà en attente
- `400` - Rejet récent (attendre 7 jours)

---

### GET `/my-application` - Statut Candidature

Vérifie le statut de sa candidature.

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "...",
      "businessName": "Salon Marie",
      "status": "pending|approved|rejected",
      "rejectionReason": null,
      "createdAt": "...",
      "reviewedAt": null
    }
  }
}
```

---

## 📋 Processus KYC (Vérification Prestataire)

Pour devenir prestataire vérifié, les éléments suivants sont requis :

### 1️⃣ Informations de base (obligatoires)

| Champ | Description |
|-------|-------------|
| `firstName` | Prénom |
| `lastName` | Nom de famille |
| `email` | Email (vérifié par OTP) |
| `phone` | Numéro de téléphone |

### 2️⃣ Profil Prestataire (obligatoires)

| Champ | Description |
|-------|-------------|
| `businessName` | Nom de l'activité/entreprise |
| `description` | Description détaillée de l'activité (min 50 caractères) |
| `location` | Ville (Douala, Yaoundé, Bafoussam...) |
| `address` | Adresse physique (optionnel) |

### 3️⃣ Contacts (au moins un obligatoire)

| Champ | Description |
|-------|-------------|
| `whatsapp` | Numéro WhatsApp (+237...) |
| `phone` | Téléphone professionnel |
| `facebook` | Page Facebook |
| `instagram` | Compte Instagram |

### 4️⃣ Photo(s) de l'activité

| Requirement | Détail |
|-------------|--------|
| Nombre | 1 à 5 photos |
| Format | JPG, PNG, WebP |
| Taille max | 5 MB par photo |
| Contenu | Photos du travail, salon, produits... |

### 5️⃣ Pièce d'identité (Carte Nationale)

| Requirement | Détail |
|-------------|--------|
| Document | Carte Nationale d'Identité (CNI) |
| Format | PDF, JPG, PNG |
| Taille max | 10 MB |
| Lisibilité | Photo nette, recto/verso si nécessaire |

### ✅ Workflow Candidature Prestataire

```
1. Inscription utilisateur (role = client)
   POST /api/auth/register
             ↓
2. Candidature prestataire
   POST /api/providers/apply
   • Infos business (businessName, description, location)
   • CNI obligatoire
   • Photos de l'activité
   • Contacts (WhatsApp, etc.)
             ↓
3. Email confirmation envoyé au candidat
             ↓
4. Admin review de la candidature
   GET /api/admin/provider-applications
   PUT /api/admin/provider-applications/:id/review
             ↓
5a. ✅ APPROUVÉ
    • Rôle → provider
    • Profil Provider créé automatiquement
    • Essai 30 jours gratuit activé
    • Email de félicitations envoyé

5b. ❌ REJETÉ
    • Email avec motif du rejet
    • Peut recandidater après 7 jours
```

### 📤 Endpoint Upload Documents

```
POST /api/providers/:id/documents
Content-Type: multipart/form-data

documents: [CNI.pdf]
```

**Réponse 201:**
```json
{
  "success": true,
  "message": "Documents uploadés. En attente de vérification.",
  "data": {
    "documents": [
      {
        "type": "identity_card",
        "url": "https://res.cloudinary.com/.../cni.pdf",
        "status": "pending",
        "uploadedAt": "2026-01-15T12:00:00Z"
      }
    ]
  }
}
```

---

### GET `/my-profile` - Mon Profil

⚠️ **Rôle requis:** `provider`

---

### GET `/my-dashboard` - Tableau de Bord

⚠️ **Rôle requis:** `provider`

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "provider": { ... },
    "stats": {
      "totalViews": 150,
      "totalContacts": 25,
      "totalReviews": 12,
      "averageRating": 4.5,
      "pendingContacts": 3
    },
    "recentContacts": [...],
    "recentReviews": [...]
  }
}
```

---

### PUT `/:id` - Modifier son Profil

**Content-Type:** `multipart/form-data`

Mêmes champs que création. Les nouvelles photos s'ajoutent aux existantes.

---

### DELETE `/:id/photos/:photoIndex` - Supprimer une Photo

**Params:**
- `id` - ID du prestataire
- `photoIndex` - Index de la photo (0, 1, 2...)

**Réponse 200:**
```json
{
  "success": true,
  "message": "Photo supprimée"
}
```

---

## 🔄 Workflow Détaillé

### Devenir Prestataire
```
[Client authentifié] POST /api/providers
{ businessName, description, location, whatsapp, services[] }
    │
    ▼
┌─────────────────────┐
│ User.role == client?│ ── Non ──▶ 403 "Déjà prestataire"
└─────────┬───────────┘
          │ Oui
          ▼
┌─────────────────────┐
│ Validation:         │
│ - businessName uniq │
│ - description 50+   │
│ - location requis   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Crée Provider       │
│ isVerified = false  │
│ isFeatured = false  │
│ User.role=provider  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Crée Services[]     │
│ (optionnel)         │
└─────────┬───────────┘
          │
          ▼
     201 Created
     ⚠️ En attente validation admin
```

### Recherche Prestataires
```
GET /api/providers?search=coiffure&location=Douala&rating=4&sort=rating
    │
    ▼
┌─────────────────────┐
│ Parse query params  │
│ Build WHERE clause  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Filtres:            │
│ - isVerified=true   │
│ - location ILIKE    │
│ - category JOIN     │
│ - rating >=         │
│ - featured flag     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ ORDER BY:           │
│ rating, viewsCount, │
│ createdAt           │
│ + LIMIT + OFFSET    │
└─────────────────────┘
          │
          ▼
     200 OK { providers[], pagination }
```

### Voir Profil (incrémente vues)
```
GET /api/providers/:id
    │
    ▼
┌─────────────────────┐
│ Find provider       │
│ with user, services │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ viewsCount++        │
│ (incrémentation)    │
└─────────────────────┘
          │
          ▼
     200 OK { provider }
```
