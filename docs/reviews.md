# ⭐ Reviews API

Gestion des avis et notations.

## Base URL
```
/api/reviews
```

---

## Endpoints

### GET `/provider/:providerId` - Avis d'un Prestataire

**Query Params:**
| Param | Type | Default |
|-------|------|---------|
| `page` | int | 1 |
| `limit` | int | 10 |

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Excellent service !",
        "createdAt": "2024-01-15T10:00:00Z",
        "user": {
          "id": "uuid",
          "firstName": "Jeanne",
          "lastName": "K.",
          "profilePhoto": "..."
        }
      }
    ],
    "pagination": { ... }
  }
}
```

---

### POST `/` - Créer un Avis 🔒

⚠️ **Limites:**
- 1 avis par utilisateur par prestataire
- Ne peut pas s'auto-évaluer

**Body:**
```json
{
  "providerId": "uuid",
  "rating": 5,
  "comment": "Très satisfaite du service, je recommande !"
}
```

**Validation:**
| Champ | Règle |
|-------|-------|
| `rating` | 1-5, requis |
| `comment` | max 1000 chars, optionnel |

**Réponse 201:**
```json
{
  "success": true,
  "message": "Avis créé avec succès",
  "data": { "review": { ... } }
}
```

> **Note:** La moyenne du prestataire est automatiquement recalculée.

---

### PUT `/:id` - Modifier son Avis 🔒

Seul l'auteur peut modifier.

**Body:**
```json
{
  "rating": 4,
  "comment": "Mise à jour de mon avis..."
}
```

---

### DELETE `/:id` - Supprimer son Avis 🔒

Seul l'auteur (ou admin) peut supprimer.

---

## Notes

- Un email est envoyé au prestataire lors d'un nouvel avis
- Les avis peuvent être masqués par un admin (modération)
- La suppression recalcule la moyenne du prestataire
