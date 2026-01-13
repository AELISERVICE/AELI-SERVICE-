# ❤️ Favorites API

Gestion des prestataires favoris.

## Base URL
```
/api/favorites
```

🔒 **Toutes les routes requièrent une authentification**

---

## Endpoints

### GET `/` - Liste de mes Favoris

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "uuid",
        "createdAt": "2024-01-15T10:00:00Z",
        "provider": {
          "id": "uuid",
          "businessName": "Salon Marie",
          "location": "Douala",
          "averageRating": 4.5,
          "user": {
            "firstName": "Marie",
            "profilePhoto": "..."
          }
        }
      }
    ]
  }
}
```

---

### POST `/` - Ajouter aux Favoris

**Body:**
```json
{
  "providerId": "uuid"
}
```

**Réponse 201:**
```json
{
  "success": true,
  "message": "Ajouté aux favoris"
}
```

**Erreurs:**
- `400` - Déjà en favori
- `404` - Prestataire non trouvé

---

### DELETE `/:providerId` - Retirer des Favoris

**Params:** `providerId` - ID du prestataire

**Réponse 200:**
```json
{
  "success": true,
  "message": "Retiré des favoris"
}
```

---

### GET `/check/:providerId` - Vérifier si Favori

Utile pour l'affichage du bouton favori sur le frontend.

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "isFavorite": true
  }
}
```
