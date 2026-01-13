# 📚 AELI Services API Documentation

Documentation complète de l'API backend AELI Services.

## 🔗 Accès Interactif

Après avoir démarré le serveur, accédez à **Swagger UI** :
- **URL**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **JSON**: [http://localhost:5000/api-docs.json](http://localhost:5000/api-docs.json)

## 📖 Documentation par Module

| Module | Fichier | Description |
|--------|---------|-------------|
| 🔐 [Auth](./auth.md) | `auth.md` | Inscription, connexion, OTP, tokens |
| 👤 [Users](./users.md) | `users.md` | Profil utilisateur |
| 🏢 [Providers](./providers.md) | `providers.md` | Gestion prestataires |
| 🛠️ [Services](./services.md) | `services.md` | Services et catégories |
| ⭐ [Reviews](./reviews.md) | `reviews.md` | Avis et notations |
| ❤️ [Favorites](./favorites.md) | `favorites.md` | Gestion favoris |
| 📧 [Contacts](./contacts.md) | `contacts.md` | Demandes de contact |
| 👑 [Admin](./admin.md) | `admin.md` | Administration |

## 🔑 Authentification

L'API utilise des **JWT tokens** :

```
Authorization: Bearer <access_token>
```

| Token | Durée | Usage |
|-------|-------|-------|
| Access Token | 15 min | Requêtes API |
| Refresh Token | 7 jours | Obtenir nouveau access token |

## 📊 Format des Réponses

### ✅ Succès
```json
{
  "success": true,
  "message": "Description du résultat",
  "data": { ... }
}
```

### ❌ Erreur
```json
{
  "success": false,
  "message": "Description de l'erreur",
  "code": "ERROR_CODE"
}
```

## 🚦 Codes d'Erreur

| Code | HTTP | Description |
|------|------|-------------|
| `NO_TOKEN` | 401 | Token manquant |
| `TOKEN_EXPIRED` | 401 | Token expiré |
| `INVALID_TOKEN` | 401 | Token invalide |
| `SESSION_EXPIRED` | 401 | Session inactive |
| `ACCOUNT_DISABLED` | 401 | Compte désactivé |
| `FORBIDDEN` | 403 | Accès interdit |
| `EMAIL_NOT_VERIFIED` | 403 | Email non vérifié |
