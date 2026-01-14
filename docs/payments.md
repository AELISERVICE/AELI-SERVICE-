# 💳 Payments API (CinetPay)

Gestion des paiements Mobile Money via CinetPay.

## Base URL
```
/api/payments
```

---

## Endpoints

### POST `/initialize` - Initier un Paiement

Peut être utilisé avec ou sans authentification.

**Body:**
```json
{
  "amount": 5000,
  "type": "featured",
  "providerId": "uuid",
  "description": "Mise en avant 1 mois"
}
```

**Validation:**
| Champ | Règle |
|-------|-------|
| `amount` | min 100, multiple de 5 |
| `type` | `contact_premium`, `featured`, `boost`, `subscription` |
| `providerId` | UUID optionnel |

**Réponse 201:**
```json
{
  "success": true,
  "message": "Paiement initialisé",
  "data": {
    "paymentId": "uuid",
    "transactionId": "AELI1704567890123456",
    "paymentUrl": "https://checkout.cinetpay.com/payment/...",
    "amount": 5000,
    "currency": "XAF"
  }
}
```

> **Note:** Redirigez l'utilisateur vers `paymentUrl` pour effectuer le paiement.

---

### POST `/webhook` - Callback CinetPay

Endpoint appelé par CinetPay après chaque paiement.

⚠️ **Ne pas appeler manuellement**

**Body (envoyé par CinetPay):**
```json
{
  "cpm_trans_id": "AELI1704567890123456",
  "cpm_site_id": "YOUR_SITE_ID",
  "cpm_amount": "5000",
  "cpm_currency": "XAF",
  "cpm_error_message": "SUCCES"
}
```

---

### GET `/:transactionId/status` - Vérifier le Statut

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "transactionId": "AELI1704567890123456",
    "status": "ACCEPTED",
    "amount": 5000,
    "currency": "XAF",
    "type": "featured",
    "paymentMethod": "MTNCM",
    "paidAt": "2024-01-15T10:30:00Z"
  }
}
```

**Statuts possibles:**
| Statut | Description |
|--------|-------------|
| `PENDING` | En attente d'initialisation |
| `WAITING_CUSTOMER` | En attente validation client |
| `ACCEPTED` | Paiement réussi ✅ |
| `REFUSED` | Paiement échoué ❌ |
| `CANCELLED` | Annulé |
| `EXPIRED` | Expiré |

---

### GET `/history` - Historique Paiements 🔒

**Auth requise**

**Query Params:**
| Param | Type | Default |
|-------|------|---------|
| `page` | int | 1 |
| `limit` | int | 10 |

---

## Types de Paiement

| Type | Description | Action si succès |
|------|-------------|------------------|
| `contact_premium` | Accès contact prestataire | Débloque contact |
| `featured` | Mettre en avant | `isFeatured = true` |
| `boost` | Visibilité accrue | `viewsCount += 100` |
| `subscription` | Abonnement premium | Active abonnement |

---

## 🔄 Workflow Détaillé

```
1️⃣ INITIALISATION
──────────────────────────────────────────────────────────
[Client] POST /api/payments/initialize
{ amount: 5000, type: "featured", providerId: "..." }
    │
    ▼
┌─────────────────────┐
│ Validation montant  │ (min 100, multiple de 5)
│ Génère transactionId│ AELI + timestamp
│ Crée Payment(PENDING)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ POST CinetPay API   │
│ /v2/payment         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Reçoit paymentUrl   │
│ Sauvegarde token    │
└─────────────────────┘
          │
          ▼
     201 { paymentUrl, transactionId }

2️⃣ REDIRECTION GUICHET
──────────────────────────────────────────────────────────
[Client] ──▶ REDIRECT ──▶ paymentUrl (CinetPay)
                │
                ▼
       ┌───────────────────┐
       │ 📱 Guichet        │
       │ Mobile Money      │
       │ MTN/Orange/Moov   │
       │ ou Carte          │
       └───────┬───────────┘
               │
               ▼
       ┌───────────────────┐
       │ Validation OTP    │
       │ ou Code USSD      │
       └───────────────────┘

3️⃣ WEBHOOK (asynchrone)
──────────────────────────────────────────────────────────
[CinetPay] POST /api/payments/webhook
{ cpm_trans_id, cpm_site_id, cpm_amount... }
    │
    ▼
┌─────────────────────┐
│ Vérifie site_id     │
│ Trouve Payment      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ POST CinetPay       │ Double vérification
│ /v2/payment/check   │
└─────────┬───────────┘
          │
     ┌────┴────┐
     ▼         ▼
[ACCEPTED] [REFUSED]
     │         │
     ▼         ▼
┌─────────┐ ┌─────────┐
│ Process │ │ MAJ     │
│ Success │ │ REFUSED │
└────┬────┘ └─────────┘
     │
     ▼
┌─────────────────────┐
│ Actions selon type: │
│ featured → true     │
│ viewsCount += 100   │
└─────────────────────┘
     │
     ▼
     200 OK

4️⃣ RETOUR CLIENT
──────────────────────────────────────────────────────────
[Client] ◀── REDIRECT ◀── return_url?transaction_id=...
    │
    ▼
[Frontend] GET /api/payments/:transactionId/status
    │
    ▼
┌─────────────────────┐
│ Retourne statut     │
│ ACCEPTED / REFUSED  │
└─────────────────────┘
```

## Configuration

**Variables d'environnement requises:**
```env
CINETPAY_API_KEY=votre_api_key
CINETPAY_SITE_ID=votre_site_id
CINETPAY_SECRET_KEY=votre_secret_key
CINETPAY_NOTIFY_URL=https://votre-domaine.com/api/payments/webhook
CINETPAY_RETURN_URL=https://votre-frontend.com/payment/success
```

## Moyens de Paiement

| Pays | Opérateurs | Devise |
|------|------------|--------|
| Cameroun | MTN MoMo, Orange Money | XAF |
| Côte d'Ivoire | Orange, MTN, Moov, Wave | XOF |
| Sénégal | Orange, Wave, Free | XOF |
| + 10 pays | Voir CinetPay | Variable |
