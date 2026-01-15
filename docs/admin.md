# 👑 Admin API

Endpoints d'administration.

## Base URL
```
/api/admin
```

🔒 **Toutes les routes requièrent le rôle `admin`**

> 💡 **i18n**: Ajoutez `?lang=en` pour les messages en anglais. Voir [README](./README.md#-internationalisation-i18n).

---

## Statistiques

### GET `/stats` - Statistiques Plateforme

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "clients": 120,
      "providers": 30
    },
    "providers": {
      "total": 30,
      "active": 25,
      "pending": 5,
      "featured": 3
    },
    "services": {
      "total": 85
    },
    "reviews": {
      "total": 200,
      "averageRating": "4.35"
    },
    "contacts": {
      "total": 500,
      "pending": 45
    },
    "recentUsers": [...],
    "recentProviders": [...]
  }
}
```

---

## Gestion Utilisateurs

### GET `/users` - Liste des Utilisateurs

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page |
| `limit` | int | Éléments/page |
| `role` | string | `client`, `provider`, `admin` |
| `search` | string | Recherche nom/email |

---

### PUT `/users/:id/status` - Activer/Désactiver

**Body:**
```json
{ "isActive": false }
```

⚠️ Un admin ne peut pas se désactiver lui-même.

---

## 📋 Candidatures Prestataires

### GET `/provider-applications` - Liste des Candidatures

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page |
| `limit` | int | Éléments/page |
| `status` | string | `pending`, `approved`, `rejected` |

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "...",
        "businessName": "Salon Marie",
        "status": "pending",
        "createdAt": "...",
        "user": { "id": "...", "firstName": "Marie", "email": "..." }
      }
    ],
    "pagination": { ... }
  }
}
```

---

### GET `/provider-applications/:id` - Détails Candidature

Voir tous les détails d'une candidature (documents, photos, etc.)

---

### PUT `/provider-applications/:id/review` - Approuver/Rejeter

**Body (approbation):**
```json
{
  "decision": "approved",
  "adminNotes": "RAS"
}
```

**Body (rejet):**
```json
{
  "decision": "rejected",
  "rejectionReason": "CNI illisible, merci de resoumettre",
  "adminNotes": "Photo floue"
}
```

**Effets (si approuvé):**
- `user.role` → `provider`
- Profil `Provider` créé automatiquement
- `Subscription` essai 30j créée
- Email de félicitations envoyé

---

## Gestion Prestataires

### GET `/providers/pending` - En Attente de Validation

Liste des prestataires non vérifiés.

---

### PUT `/providers/:id/verify` - Valider/Rejeter

**Body:**
```json
{ "isVerified": true }
```

> Un email est envoyé au prestataire en cas de validation.

---

### PUT `/providers/:id/feature` - Mettre en Avant

**Body:**
```json
{ "isFeatured": true }
```

Les prestataires "featured" apparaissent en priorité dans les recherches.

---

## Modération Avis

### GET `/reviews` - Tous les Avis

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page |
| `limit` | int | Éléments/page |
| `visible` | bool | Filtrer par visibilité |

---

### PUT `/reviews/:id/visibility` - Afficher/Masquer

**Body:**
```json
{ "isVisible": false }
```

Permet de modérer les avis inappropriés sans les supprimer.

---

## Permissions Résumé

| Action | Admin |
|--------|-------|
| Voir statistiques | ✅ |
| Lister utilisateurs | ✅ |
| Désactiver compte | ✅ (sauf soi-même) |
| Valider prestataire | ✅ |
| Mettre en avant | ✅ |
| Modérer avis | ✅ |
| Voir paiements | ✅ |
| Bannir IP | ✅ |
| Export données | ✅ |

---

## 🔄 Workflow Détaillé

### Dashboard Admin
```
┌─────────────────────────────────────────────────────────────────┐
│                      GET /api/admin/stats                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Users    │ │ Providers│ │ Reviews  │ │ Contacts │           │
│  │ total    │ │ verified │ │ total    │ │ pending  │           │
│  │ new/month│ │ pending  │ │ avg rate │ │ today    │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Validation Prestataire
```
[Admin] GET /api/admin/providers/pending
    │
    ▼
┌─────────────────────┐
│ Liste prestataires  │
│ isVerified = false  │
└─────────────────────┘
          │
          ▼
[Admin] PUT /api/admin/providers/:id/verify { isVerified: true }
    │
    ▼
┌─────────────────────┐
│ Provider.isVerified │
│ = true              │
│ AuditLog(VERIFY)    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 📧 Email prestataire│
│ (validation ok)     │
└─────────────────────┘
          │
          ▼
     ✅ Prestataire visible dans recherche
```

### Export Données
```
┌─────────────────────────────────────────────────────────────────┐
│                      EXPORTS ADMIN                               │
│                                                                  │
│  GET /export/users      → CSV (id, email, nom, date)            │
│  GET /export/providers  → CSV (business, location, stats)       │
│  GET /export/reviews    → CSV (provider, user, rating, date)    │
│  GET /export/contacts   → CSV (sender, provider, message, date) │
│  GET /export/report     → PDF (stats globales + graphiques)     │
└─────────────────────────────────────────────────────────────────┘
```

### Gestion Paiements
```
[Admin] GET /api/admin/payments?status=ACCEPTED&page=1
    │
    ▼
┌─────────────────────┐
│ Liste paiements     │
│ + filtres status    │
│ + filtres type      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Calcul totaux:      │
│ - totalAmount       │
│ - totalCount        │
│ - revenu journalier │
└─────────────────────┘
          │
          ▼
     200 OK { payments[], totals }
```

---

## Gestion Sécurité

> Voir la documentation complète: **[security.md](./security.md)**

### Endpoints Sécurité

| Endpoint | Description |
|----------|-------------|
| `GET /security-logs` | Journaux de sécurité avec filtres |
| `GET /security-logs/export` | Export CSV des logs |
| `GET /security-stats` | Dashboard sécurité temps réel |
| `GET /banned-ips` | Liste des IPs bannies |
| `POST /banned-ips` | Bannir une IP |
| `DELETE /banned-ips/:ip` | Débannir une IP |

### Statistiques Sécurité

```json
{
  "hourlyFailedAttempts": 12,
  "dailyFailedAttempts": 47,
  "highRiskEvents24h": 3,
  "activeBannedIPs": 5,
  "topSuspiciousIPs": [...]
}
```
