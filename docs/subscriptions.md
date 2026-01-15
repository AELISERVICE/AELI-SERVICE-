# 📅 API Abonnements - Documentation Complète

Documentation détaillée des endpoints de gestion des abonnements prestataires.

## Base URL
```
/api/subscriptions
```

---

## 💎 Modèle d'Abonnement

### Principe
Les prestataires doivent avoir un abonnement actif pour que leurs **informations de contact** (téléphone, WhatsApp) et **photos** soient visibles par les clients.

### Plans disponibles

| Plan | Prix | Durée | Description |
|------|------|-------|-------------|
| `trial` | **Gratuit** | 30 jours | Essai automatique à l'inscription |
| `monthly` | 5 000 FCFA | 30 jours | Mensuel |
| `quarterly` | 12 000 FCFA | 90 jours | Trimestriel (-20%) |
| `yearly` | 15 000 FCFA | 365 jours | Annuel (-75%) |

### Statuts d'abonnement

| Statut | Description | Contacts visibles |
|--------|-------------|-------------------|
| `trial` | Période d'essai gratuit | ✅ Oui |
| `active` | Abonnement payé et valide | ✅ Oui |
| `expired` | Date de fin dépassée | ❌ Masqués |
| `cancelled` | Annulé manuellement | ❌ Masqués |

---

## 🌐 1. ROUTES PUBLIQUES

### `GET /plans` - Liste des plans

**Description :**  
Récupère les plans d'abonnement disponibles avec leurs prix et durées.

**Ce qu'il fait :**
- Retourne la configuration des plans
- Utile pour afficher la grille tarifaire

**Réponse 200 :**
```json
{
  "success": true,
  "plans": {
    "monthly": {
      "name": "Mensuel",
      "price": 5000,
      "currency": "XAF",
      "days": 30,
      "description": "Abonnement mensuel"
    },
    "quarterly": {
      "name": "Trimestriel",
      "price": 12000,
      "currency": "XAF",
      "days": 90,
      "description": "3 mois (économisez 20%)"
    },
    "yearly": {
      "name": "Annuel",
      "price": 15000,
      "currency": "XAF",
      "days": 365,
      "description": "1 an (meilleur prix !)"
    }
  }
}
```

---

### `GET /provider/:providerId/status` - Statut d'un prestataire

**Description :**  
Vérifie si un prestataire a un abonnement actif. Utile pour savoir si on peut afficher ses contacts.

**Ce qu'il fait :**
- Vérifie le dernier abonnement du prestataire
- Calcule les jours restants
- Détermine si les contacts doivent être visibles

**Réponse 200 :**
```json
{
  "success": true,
  "subscription": {
    "status": "active",     // trial, active, expired, none
    "isActive": true,       // Raccourci : contacts visibles ?
    "plan": "monthly",
    "isTrial": false,
    "daysRemaining": 15,
    "endDate": "2026-01-30",
    "startDate": "2026-01-01"
  }
}
```

**Si pas d'abonnement :**
```json
{
  "success": true,
  "subscription": {
    "status": "none",
    "isActive": false,
    "plan": null,
    "daysRemaining": 0
  }
}
```

**Workflow frontend :**
```javascript
const checkContactVisibility = async (providerId) => {
  const response = await fetch(`/api/subscriptions/provider/${providerId}/status`);
  const { subscription } = await response.json();
  
  if (!subscription.isActive) {
    // Masquer les contacts et afficher un message
    return {
      phone: '***',
      whatsapp: '***',
      message: 'Abonnement expiré - Contacts non disponibles'
    };
  }
  
  return provider.contacts;
};
```

---

## 🔒 2. ROUTES AUTHENTIFIÉES

### `GET /my` - Mon abonnement

**🔒 Authentification requise**

**Description :**  
Récupère les détails complets de l'abonnement du prestataire connecté.

**Ce qu'il retourne :**
- Statut actuel de l'abonnement
- Plan en cours
- Date de début et fin
- Historique des paiements liés
- Nombre de jours restants
- Indicateur de renouvellement nécessaire

**Réponse 200 :**
```json
{
  "success": true,
  "subscription": {
    "id": "uuid",
    "status": "active",
    "plan": "monthly",
    "price": 5000,
    "currency": "XAF",
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-01-31T23:59:59Z",
    "daysRemaining": 16,
    "autoRenew": false,
    "isTrial": false,
    "history": [
      {
        "plan": "trial",
        "startDate": "2025-12-01",
        "endDate": "2025-12-31"
      },
      {
        "plan": "monthly",
        "startDate": "2026-01-01",
        "endDate": "2026-01-31",
        "paymentId": "uuid"
      }
    ]
  },
  "nextSteps": {
    "needsRenewal": false,
    "expiresIn": "16 jours",
    "suggestedPlan": "quarterly"  // Économies suggérées
  }
}
```

**Si période d'essai :**
```json
{
  "subscription": {
    "status": "trial",
    "plan": "trial",
    "price": 0,
    "daysRemaining": 25,
    "isTrial": true
  },
  "nextSteps": {
    "needsRenewal": true,
    "expiresIn": "25 jours",
    "message": "Votre essai gratuit expire bientôt. Choisissez un abonnement pour continuer."
  }
}
```

---

### `POST /subscribe` - S'abonner / Renouveler

**🔒 Authentification requise** | **Rôle : provider**

**Description :**  
Initie le processus d'abonnement. Redirige vers le paiement via l'API Payments.

**Ce qu'il fait :**
1. Valide le plan choisi
2. Vérifie que l'utilisateur est bien prestataire
3. Calcule le montant
4. Crée une transaction de paiement
5. Retourne l'URL de paiement CinetPay

**Body :**
```json
{
  "plan": "monthly"  // monthly, quarterly, yearly
}
```

**⚠️ Note :** Le plan `trial` ne peut pas être souscrit manuellement - il est créé automatiquement à l'approbation de la candidature.

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Paiement initialisé",
  "payment": {
    "transactionId": "AELI1705347890123456",
    "amount": 5000,
    "currency": "XAF",
    "paymentUrl": "https://checkout.cinetpay.com/pay/abc123..."
  }
}
```

**Workflow frontend :**
```javascript
const subscribe = async (plan) => {
  // 1. Initier l'abonnement
  const response = await fetch('/api/subscriptions/subscribe', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ plan })
  });
  
  const { payment } = await response.json();
  
  // 2. Rediriger vers CinetPay
  window.location.href = payment.paymentUrl;
  
  // 3. Après retour, vérifier le statut
  // (via /api/payments/:transactionId/status)
};
```

---

## 📧 Rappels Automatiques

### Emails envoyés

| Quand | Email | Destinataire |
|-------|-------|--------------|
| 7 jours avant expiration | Rappel de renouvellement | Prestataire |
| Jour d'expiration | Abonnement expiré | Prestataire |
| Après paiement réussi | Confirmation de renouvellement | Prestataire |

### Exemple d'email de rappel

```
Objet: ⚠️ Votre abonnement expire dans 7 jours - AELI Services

Bonjour Marie,

Votre abonnement pour "Salon Marie" expire bientôt.

📅 Date d'expiration : 30 janvier 2026
📊 Plan actuel : Mensuel

Que se passe-t-il après expiration ?
- Votre profil reste visible
- ❌ Vos contacts (WhatsApp, téléphone) seront masqués
- ❌ Vos photos ne seront plus affichées

[Renouveler maintenant]

L'équipe AELI Services
```

---

## ⏰ Tâches Cron

Le serveur exécute automatiquement :

| Cron | Fréquence | Action |
|------|-----------|--------|
| Expiration | Tous les jours 00:01 | Marque les abonnements expirés |
| Rappels | Tous les jours 09:00 | Envoie les rappels 7j avant |

---

## 🔄 Diagramme du Cycle de Vie

```
┌─────────────────────────────────────────────────────────────────┐
│                    CYCLE DE VIE ABONNEMENT                       │
└─────────────────────────────────────────────────────────────────┘

  ┌─────────────┐
  │  Candidature │
  │   approuvée  │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐      30 jours        ┌─────────────┐
  │   TRIAL     │ ───────────────────> │  EXPIRED    │
  │  (30 jours) │                      │             │
  └──────┬──────┘                      └──────┬──────┘
         │                                    │
         │ POST /subscribe                    │ POST /subscribe
         │                                    │
         ▼                                    ▼
  ┌─────────────┐                      ┌─────────────┐
  │   ACTIVE    │ <────────────────────│  PAIEMENT   │
  │(30/90/365j) │                      │   RÉUSSI    │
  └──────┬──────┘                      └─────────────┘
         │
         │ Date fin atteinte
         ▼
  ┌─────────────┐
  │  EXPIRED    │ ─── POST /subscribe ───> ACTIVE
  │             │
  └─────────────┘
```

---

## 📊 Widget Frontend Suggéré

```
┌─────────────────────────────────────────────────────────────────┐
│  📅 MON ABONNEMENT                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────┐              │
│  │ ✅ ACTIF - Plan Mensuel                       │              │
│  │                                               │              │
│  │ Expire dans : 16 jours                        │              │
│  │ Date fin : 31 janvier 2026                    │              │
│  │                                               │              │
│  │ ████████████████████░░░░░░░░ 53%              │              │
│  └───────────────────────────────────────────────┘              │
│                                                                  │
│  💡 Économisez avec l'abonnement annuel !                       │
│     15 000 FCFA/an au lieu de 60 000 FCFA                       │
│                                                                  │
│  [Renouveler Mensuel - 5 000 F]  [Passer à l'Annuel - 15 000 F] │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚨 Codes d'erreur

| Code | Situation |
|------|-----------|
| 400 | Plan invalide |
| 401 | Non authentifié |
| 403 | N'est pas prestataire |
| 404 | Prestataire non trouvé |

---

## 🔄 WORKFLOWS VISUELS

### Page Choix d'Abonnement (Frontend)
```
┌─────────────────────────────────────────────────────────────────┐
│                    CHOISIR UN ABONNEMENT                         │
│                    GET /api/subscriptions/plans                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│     💎 Choisissez votre formule                                 │
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │    📅 MENSUEL   │ │  📅 TRIMESTRIEL │ │   📅 ANNUEL     │   │
│  │                 │ │    ⭐ POPULAIRE │ │ 🔥 MEILLEUR PRIX│   │
│  ├─────────────────┤ ├─────────────────┤ ├─────────────────┤   │
│  │                 │ │                 │ │                 │   │
│  │   5 000 FCFA    │ │  12 000 FCFA    │ │  15 000 FCFA    │   │
│  │    /mois        │ │   /3 mois       │ │    /an          │   │
│  │                 │ │ (4 000 F/mois)  │ │ (1 250 F/mois!) │   │
│  │                 │ │                 │ │                 │   │
│  │ ✓ Contacts      │ │ ✓ Contacts      │ │ ✓ Contacts      │   │
│  │   visibles      │ │   visibles      │ │   visibles      │   │
│  │ ✓ Photos        │ │ ✓ Photos        │ │ ✓ Photos        │   │
│  │   affichées     │ │   affichées     │ │   affichées     │   │
│  │ ✓ Support       │ │ ✓ Support       │ │ ✓ Support       │   │
│  │   standard      │ │   prioritaire   │ │   VIP           │   │
│  │                 │ │                 │ │                 │   │
│  │ [Choisir]       │ │ [Choisir]       │ │ [Choisir]       │   │
│  │                 │ │ Économisez 20%  │ │ Économisez 75%  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                  │
│  💳 Paiement sécurisé par CinetPay                              │
│  [Orange Money] [MTN MoMo] [Visa/Mastercard]                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Widget Dashboard : État Abonnement
```
┌─────────────────────────────────────────────────────────────────┐
│                    WIDGET ABONNEMENT                             │
│                    GET /api/subscriptions/my                     │
└─────────────────────────────────────────────────────────────────┘

┌─── STATUS: ESSAI GRATUIT ─────────────────────────────────────┐
│                                                                │
│  🆓 ESSAI GRATUIT                                             │
│                                                                │
│  ████████████████████░░░░░░░░ 25/30 jours restants            │
│                                                                │
│  ⚠️ Votre essai expire dans 5 jours !                         │
│                                                                │
│  Après expiration, vos contacts et photos                     │
│  seront masqués aux clients.                                  │
│                                                                │
│  [Choisir un abonnement maintenant]                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌─── STATUS: ACTIF ─────────────────────────────────────────────┐
│                                                                │
│  ✅ ABONNEMENT ACTIF                                          │
│  Plan: Mensuel                                                │
│                                                                │
│  ████████████████░░░░░░░░░░░░ 16/30 jours restants            │
│                                                                │
│  📅 Expire le: 31 janvier 2026                                │
│                                                                │
│  💡 Passez à l'annuel et économisez 75% !                     │
│                                                                │
│  [Renouveler - 5 000 F]  [Passer à l'annuel - 15 000 F]      │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌─── STATUS: EXPIRÉ ────────────────────────────────────────────┐
│                                                                │
│  ❌ ABONNEMENT EXPIRÉ                                         │
│                                                                │
│  Votre abonnement a expiré le 15 janvier 2026.               │
│                                                                │
│  ⚠️ Vos contacts et photos sont actuellement masqués !       │
│                                                                │
│  Les clients peuvent voir votre profil mais ne peuvent       │
│  pas vous contacter.                                          │
│                                                                │
│  [Renouveler maintenant pour redevenir visible]              │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 📅 Mensuel    │ 📅 Trimestriel │ 📅 Annuel             │ │
│  │ 5 000 F       │ 12 000 F       │ 15 000 F               │ │
│  │ [Choisir]     │ [Choisir]      │ [Choisir]              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Workflow Rappels Email Automatiques
```
┌─────────────────────────────────────────────────────────────────┐
│                    RAPPELS AUTOMATIQUES                          │
│                    (CRON - tous les jours 09:00)                 │
└─────────────────────────────────────────────────────────────────┘

          ┌─────────────────────────────────────────┐
          │          CRON checkExpirations()        │
          │          Tous les jours à 09:00         │
          └─────────────────────┬───────────────────┘
                                │
                  ┌─────────────┼─────────────┐
                  │             │             │
                  ▼             ▼             ▼
       ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
       │ 7 jours avant│ │ 3 jours avant│ │ Jour J       │
       │  expiration  │ │  expiration  │ │ (expiré)     │
       └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
              │                │                │
              ▼                ▼                ▼
       ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
       │ 📧 RAPPEL 1  │ │ 📧 RAPPEL 2  │ │ 📧 ALERTE    │
       │              │ │              │ │              │
       │ "Votre abonn.│ │ "Plus que 3  │ │ "Abonnement  │
       │  expire dans │ │  jours !     │ │  expiré !    │
       │  7 jours"    │ │  Renouvelez" │ │  Vos contacts│
       │              │ │              │ │  sont masqués"│
       │ [Renouveler] │ │ [Renouveler] │ │ [Renouveler] │
       └──────────────┘ └──────────────┘ └──────┬───────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │ subscription │
                                         │ status =     │
                                         │ 'expired'    │
                                         └──────────────┘
                                                │
                                                ▼
                                   ┌────────────────────────┐
                                   │ Profil toujours visible│
                                   │ MAIS:                  │
                                   │ • whatsapp = "***"     │
                                   │ • phone = "***"        │
                                   │ • photos = []          │
                                   └────────────────────────┘
```

---

### Comparaison Visibilité Profil
```
┌─────────────────────────────────────────────────────────────────┐
│                    IMPACT ABONNEMENT SUR PROFIL                  │
└─────────────────────────────────────────────────────────────────┘

┌─── ABONNEMENT ACTIF ──────────────────────────────────────────┐
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [📸] [📸] [📸]                                           │ │
│  │                                                          │ │
│  │ Salon Marie                           ⭐ 4.8 (25 avis)  │ │
│  │ 📍 Douala, Akwa                                         │ │
│  │                                                          │ │
│  │ "Salon de coiffure spécialisé en tresses africaines..." │ │
│  │                                                          │ │
│  │ 📞 CONTACTS:                                            │ │
│  │ WhatsApp: +237 699 123 456  [💬 Contacter sur WhatsApp] │ │
│  │ Téléphone: +237 677 987 654 [📞 Appeler]                │ │
│  │                                                          │ │
│  │ [Envoyer un message]                                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌─── ABONNEMENT EXPIRÉ ─────────────────────────────────────────┐
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [📸 Pas de photos disponibles]                          │ │
│  │                                                          │ │
│  │ Salon Marie                           ⭐ 4.8 (25 avis)  │ │
│  │ 📍 Douala, Akwa                                         │ │
│  │                                                          │ │
│  │ "Salon de coiffure spécialisé en tresses africaines..." │ │
│  │                                                          │ │
│  │ 📞 CONTACTS:                                            │ │
│  │ ┌────────────────────────────────────────────────────┐  │ │
│  │ │ ⚠️ Contacts non disponibles                        │  │ │
│  │ │                                                     │  │ │
│  │ │ Ce prestataire n'a pas d'abonnement actif.         │  │ │
│  │ │ Ses coordonnées ne sont pas accessibles.           │  │ │
│  │ └────────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │ [Voir d'autres prestataires similaires]                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
