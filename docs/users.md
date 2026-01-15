# 👤 Users API

Gestion du profil utilisateur.

## Base URL
```
/api/users
```

🔒 **Toutes les routes requièrent une authentification**

> 💡 **i18n**: Ajoutez `?lang=en` pour les messages en anglais. Voir [README](./README.md#-internationalisation-i18n).

---

## Endpoints

### GET `/profile` - Obtenir son Profil

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "marie@example.com",
      "firstName": "Marie",
      "lastName": "Dupont",
      "phone": "+237690000000",
      "role": "client",
      "profilePhoto": "https://...",
      "isActive": true,
      "isEmailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "provider": null
  }
}
```

---

### PUT `/profile` - Mettre à Jour son Profil

**Content-Type:** `multipart/form-data`

**Body:**
| Champ | Type | Description |
|-------|------|-------------|
| `firstName` | string | Prénom |
| `lastName` | string | Nom |
| `phone` | string | Téléphone |
| `profilePhoto` | file | Photo de profil (max 5MB, jpg/png/webp) |

**Exemple cURL:**
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <token>" \
  -F "firstName=Marie" \
  -F "lastName=Dupont" \
  -F "profilePhoto=@photo.jpg"
```

**Réponse 200:**
```json
{
  "success": true,
  "message": "Profil mis à jour",
  "data": { "user": { ... } }
}
```

---

### PUT `/password` - Changer le Mot de Passe

**Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Validation:**
- `newPassword`: minimum 8 caractères

**Réponse 200:**
```json
{
  "success": true,
  "message": "Mot de passe modifié avec succès"
}
```

**Erreurs:**
- `401` - Mot de passe actuel incorrect

---

### DELETE `/account` - Désactiver son Compte

⚠️ **Soft delete** - Le compte est désactivé mais pas supprimé.

**Réponse 200:**
```json
{
  "success": true,
  "message": "Compte désactivé avec succès"
}
```

 **Note:** L'utilisateur ne pourra plus se connecter après cette action. Contactez un admin pour réactiver le compte.

---

## 🔄 Workflow Détaillé

```
[Authentifié] PUT /api/users/profile
{ firstName, lastName, phone, profilePhoto (file) }
    │
    ▼
┌─────────────────────┐
│ Validation JWT      │
│ Récupère user       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Upload photo ?      │ ── Oui ──▶ Cloudinary upload
│                     │            (resize, optimize)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ MAJ User:           │
│ - firstName         │
│ - lastName          │
│ - phone             │
│ - profilePhoto URL  │
└─────────────────────┘
          │
          ▼
     200 OK { user }

═══════════════════════════════════════════════════════════

[Authentifié] PUT /api/users/password
{ currentPassword, newPassword }
    │
    ▼
┌─────────────────────┐
│ Vérifie password    │ ── Incorrect ──▶ 401 Unauthorized
│ actuel (bcrypt)     │
└─────────┬───────────┘
          │ Correct
          ▼
┌─────────────────────┐
│ Hash newPassword    │
│ Sauvegarde          │
│ SecurityLog(CHANGE) │
└─────────────────────┘
          │
          ▼
     200 OK
```

