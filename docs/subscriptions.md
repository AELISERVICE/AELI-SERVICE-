# 💳 Abonnements API

Gestion des abonnements prestataires.

## Base URL
```
/api/subscriptions
```

> 💡 **i18n**: Ajoutez `?lang=en` pour les messages en anglais. Voir [README](./README.md#-internationalisation-i18n).

---

## Endpoints

### GET `/plans` - Liste des Plans

Retourne les plans d'abonnement disponibles.

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "name": "monthly",
        "price": 5000,
        "duration": 30,
        "label": "Mensuel"
      },
      {
        "name": "quarterly",
        "price": 12000,
        "duration": 90,
        "label": "Trimestriel"
      },
      {
        "name": "yearly",
        "price": 40000,
        "duration": 365,
        "label": "Annuel"
      }
    ]
  }
}
```

---

### GET `/my-status` - Mon Statut d'Abonnement 🔒

⚠️ **Rôle requis:** `provider`

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "hasSubscription": true,
    "subscription": {
      "id": "uuid",
      "plan": "monthly",
      "status": "active",
      "startDate": "2026-01-01",
      "endDate": "2026-01-31",
      "daysRemaining": 16,
      "isActive": true
    }
  }
}
```

**Statuts possibles:**
| Statut | Description |
|--------|-------------|
| `trial` | Période d'essai gratuite (30 jours) |
| `active` | Abonnement actif |
| `expired` | Abonnement expiré |
| `cancelled` | Abonnement annulé |

---

### POST `/subscribe` - S'abonner 🔒

⚠️ **Rôle requis:** `provider`

Initie un paiement CinetPay pour s'abonner.

**Body:**
```json
{
  "plan": "monthly"
}
```

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://checkout.cinetpay.com/...",
    "transactionId": "TXN-..."
  }
}
```

---

### GET `/check/:providerId` - Vérifier un Prestataire

Vérifie si un prestataire a un abonnement actif.

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "providerId": "uuid",
    "isActive": true,
    "status": "active",
    "plan": "monthly",
    "expiresAt": "2026-01-31"
  }
}
```

---

## Workflow

### Inscription Prestataire → Essai Gratuit

```
[User] POST /api/providers
    │
    ▼
┌─────────────────────────┐
│ Création Prestataire    │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Création Subscription   │
│ plan = 'trial'          │
│ status = 'trial'        │
│ durée = 30 jours        │
│ price = 0 FCFA          │
└─────────────────────────┘
          │
          ▼
    Accès COMPLET pendant 30 jours
```

### Renouvellement Abonnement

```
[Provider] POST /api/subscriptions/subscribe
{ plan: "monthly" }
    │
    ▼
┌─────────────────────────┐
│ Création Payment        │
│ type = 'subscription'   │
│ amount = 5000 FCFA      │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Redirection CinetPay    │
│ Mobile Money / CB       │
└─────────────────────────┘
          │
          ▼ Webhook
┌─────────────────────────┐
│ processPaymentSuccess   │
│ Mise à jour Subscription│
│ status = 'active'       │
│ endDate + duration      │
└─────────────────────────┘
          │
          ▼
    📧 Email confirmation envoyé
```

### Expiration Abonnement

```
┌─────────────────────────┐
│ Job quotidien           │
│ sendExpirationReminders │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Expire dans 7 jours ?   │ ── Oui ──▶ 📧 Email rappel
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Expiré aujourd'hui ?    │ ── Oui ──▶ status = 'expired'
└─────────────────────────┘            📧 Email expiration
          │
          ▼
┌─────────────────────────┐
│ Impact abonnement expiré│
│ - Contacts masqués      │
│ - Photos masquées       │
│ - Profil toujours visible│
└─────────────────────────┘
```

---

## Tarification

| Plan | Prix | Durée | Économie |
|------|------|-------|----------|
| Mensuel | 5 000 FCFA | 30 jours | - |
| Trimestriel | 12 000 FCFA | 90 jours | 20% |
| Annuel | 15 000 FCFA | 365 jours | 75% |

---

## Emails Associés

| Événement | Template |
|-----------|----------|
| Renouvellement réussi | `subscriptionRenewedEmail` |
| Expire dans 7 jours | `subscriptionExpiringEmail` |
| Abonnement expiré | `subscriptionExpiredEmail` |
