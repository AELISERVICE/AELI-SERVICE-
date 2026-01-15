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
| 📧 [Contacts](./contacts.md) | `contacts.md` | Demandes de contact + stats journalières |
| 💳 [Payments](./payments.md) | `payments.md` | Paiements CinetPay Mobile Money |
| 💎 [Subscriptions](./subscriptions.md) | `subscriptions.md` | Abonnements prestataires |
| 🔐 [Security](./security.md) | `security.md` | Logs sécurité, IP banning, protection |
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

---

## 🌍 Internationalisation (i18n)

L'API supporte le **français (fr)** et l'**anglais (en)**.

### Comment changer la langue ?

**Option 1 : Query Parameter**
```
GET /api/providers?lang=en
GET /api/auth/login?lang=fr
```

**Option 2 : Header Accept-Language**
```
Accept-Language: en
Accept-Language: fr
```

**Option 3 : Header X-Lang**
```
X-Lang: en
```

### Langues supportées

| Code | Langue |
|------|--------|
| `fr` | Français (par défaut) |
| `en` | English |

### Exemple de réponse

**Français (défaut) :**
```json
{
  "success": true,
  "message": "Connexion réussie"
}
```

**Anglais (`?lang=en`) :**
```json
{
  "success": true,
  "message": "Login successful"
}
```

### Fichiers de traduction

Les traductions sont dans `src/locales/` :
- `fr.json` - Français
- `en.json` - Anglais
