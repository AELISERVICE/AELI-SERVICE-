# 🏢 Providers API

Gestion des profils prestataires.

## Base URL
```
/api/providers
```

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

### POST `/create` - Créer un Profil Prestataire

⚠️ **Rôle requis:** `provider`

**Content-Type:** `multipart/form-data`

**Body:**
| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `businessName` | string | ✅ | Nom de l'entreprise |
| `description` | string | ✅ | Description (min 50 chars) |
| `location` | string | ✅ | Ville/quartier |
| `address` | string | - | Adresse complète |
| `whatsapp` | string | - | Numéro WhatsApp |
| `facebook` | string | - | Lien Facebook |
| `instagram` | string | - | @ Instagram |
| `photos` | file[] | - | Photos (max 5, 5MB chacune) |

**Réponse 201:**
```json
{
  "success": true,
  "message": "Profil créé avec succès. En attente de validation.",
  "data": { "provider": { ... } }
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
