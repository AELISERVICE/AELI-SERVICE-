# 🔐 Sécurité API

Gestion de la sécurité, logs, et protection contre les attaques.

## Base URL (Admin)
```
/api/admin
```

> 💡 **i18n**: Ajoutez `?lang=en` pour les messages en anglais. Voir [README](./README.md#-internationalisation-i18n).

---

## Endpoints

### GET `/security-logs` - Journaux de Sécurité 🔒

⚠️ **Rôle requis:** `admin`

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `limit` | int | Nombre de logs (défaut: 100) |
| `eventType` | string | Type d'événement |
| `riskLevel` | string | `low`, `medium`, `high` |
| `userId` | uuid | Filtrer par utilisateur |
| `success` | bool | Événements réussis/échoués |
| `startDate` | date | Date de début |
| `endDate` | date | Date de fin |

**Types d'événements:**
| Type | Description |
|------|-------------|
| `login_success` | Connexion réussie |
| `login_failed` | Échec de connexion |
| `account_locked` | Compte verrouillé |
| `otp_verified` | OTP vérifié |
| `otp_failed` | OTP échoué |
| `honeypot_triggered` | Bot détecté |
| `password_reset_request` | Demande reset mot de passe |
| `session_expired` | Session expirée |

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "eventType": "login_failed",
        "ipAddress": "192.168.1.1",
        "email": "user@example.com",
        "userAgent": "Mozilla/5.0...",
        "riskLevel": "medium",
        "success": false,
        "details": {},
        "createdAt": "2026-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

### GET `/security-logs/export` - Exporter en CSV 🔒

⚠️ **Rôle requis:** `admin`

Télécharge les logs de sécurité au format CSV.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `startDate` | date | Date de début (défaut: -30 jours) |
| `endDate` | date | Date de fin (défaut: aujourd'hui) |
| `eventType` | string | Filtrer par type |
| `riskLevel` | string | Filtrer par niveau de risque |

**Réponse:** Fichier CSV téléchargé

---

### GET `/security-stats` - Statistiques Sécurité 🔒

⚠️ **Rôle requis:** `admin`

Dashboard temps réel des événements de sécurité.

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "hourlyFailedAttempts": 12,
    "dailyFailedAttempts": 47,
    "highRiskEvents24h": 3,
    "activeBannedIPs": 5,
    "topSuspiciousIPs": [
      { "ipAddress": "192.168.1.100", "count": 15 },
      { "ipAddress": "10.0.0.50", "count": 8 }
    ]
  }
}
```

---

### GET `/banned-ips` - IPs Bannies 🔒

⚠️ **Rôle requis:** `admin`

Liste des IPs actuellement bannies.

---

### POST `/banned-ips` - Bannir une IP 🔒

⚠️ **Rôle requis:** `admin`

**Body:**
```json
{
  "ipAddress": "192.168.1.100",
  "reason": "Attaque brute force",
  "duration": 86400
}
```

| Champ | Description |
|-------|-------------|
| `duration` | Durée en secondes (`null` = permanent) |

---

### DELETE `/banned-ips/:ip` - Débannir une IP 🔒

⚠️ **Rôle requis:** `admin`

---

## Protections Actives

### 🛡️ Protection Brute Force

| Protection | Configuration |
|------------|---------------|
| Login | 5 tentatives / 15 min |
| OTP | 3 tentatives / 10 min |
| Password Reset | 3 / heure |
| Registration | 5 / heure |
| Contact | 10 / heure |
| API général | 100 / minute |

### 🔒 Verrouillage de Compte

```
Après 5 échecs de connexion:
├── Compte verrouillé 30 minutes
├── Event "account_locked" loggé
└── Email notification (optionnel)
```

### 🤖 Détection de Bots (Honeypot)

```
Champs honeypot dans les formulaires:
├── website
├── hp_check  
└── url2

Si remplis:
├── Requête rejetée (400)
├── Event "honeypot_triggered" loggé (high risk)
└── Auto-ban après 10+ événements suspects
```

### 🚫 Auto-Ban IP

```
Si 10+ événements suspects en 1 heure:
├── IP automatiquement bannie 24h
├── Cache invalidé immédiatement
└── Log dans security_logs
```

---

## Headers de Sécurité

| Header | Valeur |
|--------|--------|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Content-Security-Policy | default-src 'self' |
| Strict-Transport-Security | max-age=31536000 |

---

## Workflow Sécurité

### Connexion avec Protection

```
[User] POST /api/auth/login
{ email, password }
    │
    ▼
┌─────────────────────────┐
│ IP Banlist Check        │ ── Bannie ──▶ 403 Accès refusé
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Rate Limit (5/15min)    │ ── Dépassé ──▶ 429 Too Many Requests
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Account Lock Check      │ ── Verrouillé ──▶ 423 Account Locked
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Validation credentials  │
└─────────┬───────────────┘
          │
    ┌─────┴─────┐
    │           │
   OK         ÉCHEC
    │           │
    ▼           ▼
┌────────┐  ┌─────────────┐
│ Login  │  │ Incrémente  │
│ Success│  │ failedLogin │
│ Log    │  │ attempts    │
└────────┘  └──────┬──────┘
                   │
                   ▼
            ┌──────────────┐
            │ 5 échecs ?   │
            └──────┬───────┘
                   │ Oui
                   ▼
            ┌──────────────┐
            │ LOCK 30 min  │
            │ Log event    │
            └──────────────┘
```

---

## Emails Sécurité

| Événement | Template |
|-----------|----------|
| Mot de passe modifié | `passwordChangedConfirmationEmail` |
| Mot de passe oublié | `passwordResetEmail` |
| Compte désactivé | `accountDeactivatedEmail` |
