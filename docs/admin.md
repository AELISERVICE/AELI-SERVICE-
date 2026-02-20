# 👑 API Administration - Documentation Complète

Documentation détaillée de tous les endpoints d'administration pour le développeur frontend.

## Base URL
```
/api/admin
```

🔒 **Authentification requise** : Token JWT avec rôle `admin`
```
Authorization: Bearer <token>
```

---

## 📊 1. STATISTIQUES DASHBOARD

### `GET /stats` - Tableau de bord principal

**Description :**  
Récupère toutes les statistiques globales de la plateforme en un seul appel. C'est le premier endpoint à appeler pour afficher le dashboard admin.

**Ce qu'il fait :**
- Compte le nombre total d'utilisateurs (clients, providers, admins)
- Compte les prestataires par statut (vérifiés, en attente, mis en avant)
- Calcule la note moyenne des avis
- Compte les demandes de contact en attente
- **Calcule le total des paiements et revenus** (nouveau ✨)
- Retourne les 5 derniers inscrits et les 5 derniers prestataires

**Utilisation frontend :**  
Afficher des cartes KPI sur le dashboard avec les chiffres clés.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,      // Tous les utilisateurs
      "clients": 120,    // Rôle client uniquement
      "providers": 30    // Rôle provider uniquement
    },
    "providers": {
      "total": 30,       // Profils prestataires créés
      "active": 25,      // isVerified = true
      "pending": 5,      // isVerified = false
      "featured": 3      // isFeatured = true (mis en avant)
    },
    "services": {
      "total": 85        // Services actifs (isActive = true)
    },
    "reviews": {
      "total": 200,           // Avis visibles
      "averageRating": "4.35" // Moyenne globale /5
    },
    "contacts": {
      "total": 500,      // Total demandes de contact
      "pending": 45      // Non lues par le prestataire
    },
    "payments": {
      "total": 150,           // Nombre total de paiements
      "totalAmount": 2500000, // Montant total accepté en FCFA
      "accepted": 120,        // Paiements acceptés
      "pending": 15,          // Paiements en attente
      "refused": 10,          // Paiements refusés
      "cancelled": 5          // Paiements annulés
    },
    "recentUsers": [
      {
        "id": "8c43c085-0088-4037-94f1-e30d841b01c5",
        "firstName": "Fatou",
        "lastName": "Onana",
        "email": "fatou.onana104@example.com",
        "role": "provider",
        "phoneNumber": "+237 6XX XXX XXX",
        "country": "Cameroun",
        "gender": "female",
        "isEmailVerified": true,
        "isActive": true,
        "lastLogin": "2026-02-17T09:45:00Z",
        "createdAt": "2026-02-17T01:01:25.181Z",
        "updatedAt": "2026-02-17T09:45:00Z"
      },
      {
        "id": "6c78d566-7b3b-4990-9d72-3df52738fc21",
        "firstName": "Jean",
        "lastName": "Fokou",
        "email": "jean.fokou103@example.com",
        "role": "client",
        "phoneNumber": "+237 6XX XXX XXX",
        "country": "Cameroun",
        "gender": "male",
        "isEmailVerified": false,
        "isActive": true,
        "lastLogin": null,
        "createdAt": "2026-02-17T01:01:25.077Z",
        "updatedAt": "2026-02-17T01:01:25.077Z"
      }
    ],     // 5 derniers inscrits (toutes les infos comme lors de l'inscription)
    "recentProviders": [
      {
        "id": "uuid",
        "userId": "uuid-user",
        "businessName": "Salon Marie Coiffure",
        "description": "Salon de coiffure professionnel pour femmes",
        "location": "Yaoundé, Centre-ville",
        "address": "Rue de la Paix, Quartier Bastos",
        "whatsapp": "+237 6XX XXX XXX",
        "facebook": "https://facebook.com/salonmarie",
        "instagram": "@salonmarie_cm",
        "photos": ["url1.jpg", "url2.jpg"],
        "activities": ["coiffure", "maquillage", "manucure"],
        "latitude": 3.8667,
        "longitude": 11.5167,
        "isVerified": true,
        "isFeatured": false,
        "featuredUntil": null,
        "viewsCount": 1250,
        "contactsCount": 89,
        "averageRating": 4.5,
        "totalReviews": 23,
        "documents": [
          {
            "type": "cni",
            "url": "https://cloudinary.com/cni.jpg",
            "uploadedAt": "2026-02-15T10:30:00Z",
            "status": "approved"
          }
        ],
        "verificationStatus": "approved",
        "verificationNotes": "Documents validés",
        "verifiedAt": "2026-02-15T14:20:00Z",
        "verifiedBy": "admin-uuid",
        "createdAt": "2026-02-17T08:30:00Z",
        "updatedAt": "2026-02-17T09:15:00Z",
        "user": {
          "id": "uuid-user",
          "firstName": "Marie",
          "lastName": "Ndiaye",
          "email": "marie.ndiaye@example.com",
          "phone": "+237 6XX XXX XXX",
          "country": "Cameroun",
          "gender": "female",
          "isEmailVerified": true,
          "isActive": true,
          "lastLogin": "2026-02-17T09:15:00Z",
          "createdAt": "2026-02-17T08:30:00Z",
          "updatedAt": "2026-02-17T09:15:00Z"
        }
      }
    ]  // 5 derniers prestataires (TOUTES les infos complètes)
  }
}
```

---

### `GET /security-stats` - Dashboard sécurité

**Description :**  
Statistiques de sécurité en temps réel pour surveiller les tentatives de connexion suspectes.

**Ce qu'il fait :**
- Compte les tentatives de connexion échouées (dernière heure et 24h)
- Identifie les événements à haut risque
- Liste les IPs les plus suspectes
- Compte les IPs actuellement bannies

**Utilisation frontend :**  
Afficher un widget "Sécurité" avec indicateurs de risque.

**Réponse :**
```json
{
  "hourlyFailedAttempts": 12,   // Échecs connexion dernière heure
  "dailyFailedAttempts": 47,    // Échecs connexion 24h
  "highRiskEvents24h": 3,       // Événements risque "high"
  "activeBannedIPs": 5,         // IPs bloquées actuellement
  "topSuspiciousIPs": [         // Top 10 IPs suspectes
    { "ipAddress": "192.168.1.1", "count": 15 },
    { "ipAddress": "10.0.0.5", "count": 8 }
  ]
}
```

---

### `GET /analytics` - Statistiques API

**Description :**  
Métriques d'utilisation de l'API pour comprendre le trafic.

**Ce qu'il fait :**
- Agrège les statistiques globales d'appels API
- Identifie les endpoints les plus utilisés

**Réponse :**
```json
{
  "stats": {
    "totalRequests": 15420,
    "avgResponseTime": 145,  // ms
    "errorRate": 0.02        // 2%
  },
  "endpoints": [
    { "endpoint": "GET /api/providers", "count": 3500 },
    { "endpoint": "POST /api/auth/login", "count": 2100 }
  ]
}
```

### `GET /analytics/hourly?date=2026-01-15` - Répartition horaire

**Description :**  
Trafic API heure par heure pour une date donnée.

---

## 👥 2. GESTION DES UTILISATEURS

### `GET /users` - Liste des utilisateurs

**Description :**  
Récupère la liste paginée des utilisateurs avec filtres. **Les administrateurs sont exclus par défaut.**

**Ce qu'il fait :**
- Recherche par nom, prénom ou email
- Filtre par rôle (client, provider)
- **Exclut automatiquement les admins** (sauf si `role` est explicitement spécifié)
- Pagination côté serveur
- Exclut les champs sensibles (password, tokens)

**Paramètres query :**
| Param | Type | Défaut | Description |
|-------|------|--------|-------------|
| `page` | int | 1 | Numéro de page |
| `limit` | int | 20 | Éléments par page (max 100) |
| `role` | string | - | `client`, `provider` (admins exclus par défaut) |
| `search` | string | - | Recherche nom/email |

**Exemple :**
```
GET /api/admin/users?page=1&limit=10&search=marie
```

---

### `PUT /users/:id/status` - Activer/Désactiver un compte

**Description :**  
Active ou désactive un compte utilisateur. Un compte désactivé ne peut plus se connecter.

**Ce qu'il fait :**
- Met à jour le champ `isActive` de l'utilisateur
- Empêche l'admin de se désactiver lui-même
- Invalide implicitement les sessions actives

**Body :**
```json
{ "isActive": false }  // ou true pour réactiver
```

**⚠️ Contrainte :**  
Un admin ne peut PAS se désactiver lui-même (erreur 400).

---

### `DELETE /users/:id` - Supprimer un compte

**Description :**  
Supprime définitivement un compte utilisateur et **toutes ses données associées** (prestataire, avis, favoris, contacts, tokens, paiements, etc.).

**Ce qu'il fait :**
- Supprime l'utilisateur de la base de données
- **CASCADE** : supprime automatiquement le prestataire associé et toutes les données liées
- Crée un audit log de l'action
- Invalide le cache des prestataires si l'utilisateur avait un profil prestataire

**⚠️ Contraintes :**
- Un admin ne peut PAS se supprimer lui-même (erreur 400)
- Un admin ne peut PAS supprimer un autre admin (erreur 400)
- **Action irréversible** — toutes les données sont perdues

**Réponse :**
```json
{
  "success": true,
  "message": "Utilisateur supprimé",
  "data": {
    "deletedUser": {
      "id": "uuid",
      "email": "marie@example.com",
      "firstName": "Marie",
      "lastName": "Ndiaye",
      "role": "provider",
      "hadProvider": true,
      "providerBusinessName": "Salon Marie Coiffure"
    }
  }
}
```

**Utilisation frontend :**  
Afficher une modale de confirmation avec le nom et l'email de l'utilisateur avant de supprimer. Mentionner que la suppression est **irréversible** et que le prestataire associé sera aussi supprimé.

---

## 📋 3. CANDIDATURES PRESTATAIRES

### `GET /provider-applications` - Liste des candidatures

**Description :**  
Récupère toutes les demandes de clients souhaitant devenir prestataires.

**Ce qu'il fait :**
- Liste les candidatures avec leurs documents (CNI, photos)
- Inclut les informations de l'utilisateur demandeur
- Filtre par statut (pending, approved, rejected)

**Paramètres query :**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Numéro de page |
| `limit` | int | Éléments par page |
| `status` | string | `pending`, `approved`, `rejected` |

**Workflow frontend :**
1. Afficher liste avec `status=pending`
2. Cliquer sur une candidature → `GET /provider-applications/:id`
3. Valider ou rejeter → `PUT /provider-applications/:id/review`

---

### `GET /provider-applications/:id` - Détails candidature

**Description :**  
Récupère tous les détails d'une candidature pour la revue.

**Ce qu'il retourne :**
- Informations business (nom, description, localisation)
- Contacts (WhatsApp, réseaux sociaux)
- **Documents** (CNI, photos) avec URLs Cloudinary
- Historique (date création, date revue si applicable)
- Informations utilisateur (nom, email, téléphone)

---

### `PUT /provider-applications/:id/review` - Onboarding initial (Admettre)

**Description :**  
Décision initiale sur une candidature. Cet endpoint transforme le Client en Prestataire mais ne le valide pas encore définitivement.

**⚠️ IMPORTANT - Ce qu'il fait si `approved` :**
1. Change le rôle de l'utilisateur : `client` → `provider`
2. Crée le profil `Provider` (avec `isVerified: false` et `status: under_review`)
3. Crée un abonnement d'essai gratuit de 30 jours
4. Envoie un email de bienvenue
5. **Le prestataire apparaît maintenant dans "Prestataires en cours de revue"** pour la validation finale des documents.

**Tout est exécuté dans une transaction DB** : si une étape échoue, tout est annulé.

**Body (approbation) :**
```json
{
  "decision": "approved",
  "adminNotes": "Dossier complet, profil vérifié"
}
```

**Body (rejet) :**
```json
{
  "decision": "rejected",
  "rejectionReason": "CNI illisible, veuillez resoumettre une photo claire",
  "adminNotes": "Photo floue, demander un scan"
}
```

**Réponse si approuvé :**
```json
{
  "success": true,
  "application": { ... },
  "provider": {
    "id": "uuid",
    "businessName": "...",
    "isVerified": false,
    "verificationStatus": "under_review"
  }
}
```

---

## 🏪 4. GESTION DES PRESTATAIRES

### `GET /providers/pending` - Prestataires non vérifiés

**Description :**  
Liste les prestataires existants qui n'ont pas encore été vérifiés (`isVerified = false`).

**Différence avec candidatures :**
- Les candidatures sont des **demandes** avant création du profil
- Les prestataires pending ont **déjà** un profil mais non vérifié

---

### `GET /providers/under-review` - Documents en cours de revue (ÉTAPE FINALE)

**Description :**  
Liste tous les prestataires (nouveaux ou existants) qui ont des documents en attente de validation. C'est ici que vous effectuez la vérification finale pour donner le badge "Vérifié".

**Workflow :**
1. Cliquer sur un prestataire → Voir ses documents.
2. Utiliser `PUT /providers/:id/review-documents` pour valider les pièces.

---

### `GET /providers/featured` - Prestataires mis en avant

**Description :**  
Liste tous les prestataires actuellement mis en avant (`isFeatured = true`), triés par date de fin de mise en avant (`featuredUntil`).

**Ce qu'il fait :**
- Filtre sur `isFeatured: true`
- Permet de voir quels sont les prestataires dont la mise en avant expire bientôt.

---

### `PUT /providers/:id/verify` - Valider/Rejeter un prestataire

**Description :**  
Valide ou rejette un prestataire existant.

**Ce qu'il fait :**
- Met à jour `isVerified` du prestataire
- Envoie un email de notification (validation ou rejet)
- **⚠️ Le motif de rejet (`rejectionReason`) est obligatoire** lors d'un rejet
- Le motif est envoyé par email au prestataire

**Body (validation) :**
```json
{ "isVerified": true }
```

**Body (rejet) :**
```json
{
  "isVerified": false,
  "rejectionReason": "Vos documents ne sont pas conformes aux exigences de la plateforme"
}
```

**⚠️ Contrainte :**  
`rejectionReason` est **obligatoire** quand `isVerified: false` (5-500 caractères). Un rejet sans motif retournera une erreur 400.

---

### `PUT /providers/:id/feature` - Mettre en avant

**Description :**  
Met un prestataire "en vedette" pour qu'il apparaisse en priorité dans les recherches.

**Ce qu'il fait :**
- Met à jour `isFeatured = true`
- Le prestataire apparaît en haut des résultats de recherche
- Si une `duration` (en jours) est fournie, le système calcule automatiquement la date d'expiration (`featuredUntil`).
- Une tâche cron s'exécute chaque nuit à 00:30 pour retirer automatiquement la mise en avant des prestataires dont la date `featuredUntil` a expiré.
- Pour retirer manuellement la mise en avant, passez `isFeatured = false`.
- Envoie un email de notification

**Body (Ajouter avec durée) :**
```json
{ 
  "isFeatured": true,
  "duration": 7
}
```

**Body (Retirer) :**
```json
{ 
  "isFeatured": false
}
```

---

### `PUT /providers/:id/status` - Activer/Désactiver un prestataire

**Description :**  
Active ou désactive un prestataire **indépendamment du compte utilisateur**. Un prestataire désactivé n'apparaît plus dans les résultats de recherche publics, mais son compte utilisateur reste fonctionnel.

**Différence avec la désactivation du user :**
| Action | Résultat |
|--------|----------|
| `PUT /users/:id/status` `{isActive: false}` | L'utilisateur **ne peut plus se connecter** |
| `PUT /providers/:id/status` `{isActive: false}` | Le prestataire **est masqué** des listes publiques, mais le user peut toujours se connecter |
| `DELETE /users/:id` | Le user **et** le prestataire sont **définitivement supprimés** |

**Ce qu'il fait :**
- Met à jour `isActive` du prestataire
- Les prestataires avec `isActive: false` sont automatiquement exclus des résultats publics (`GET /api/providers`)
- Crée un audit log de l'action
- Invalide le cache des prestataires

**Body (désactiver) :**
```json
{
  "isActive": false,
  "reason": "Non-respect des conditions d'utilisation de la plateforme"
}
```

> ⚠️ Le champ `reason` est **obligatoire** lors de la désactivation (5-500 caractères). Un email sera envoyé au prestataire avec la raison et un lien pour contacter le service client.

**Body (réactiver) :**
```json
{ "isActive": true }
```

> Un email de confirmation sera envoyé au prestataire pour l'informer que son profil est de nouveau visible.

**Réponse :**
```json
{
  "success": true,
  "message": "Prestataire désactivé",
  "data": {
    "provider": {
      "id": "uuid",
      "userId": "user-uuid",
      "businessName": "Salon Marie Coiffure",
      "description": "...",
      "location": "Douala",
      "isActive": false,
      "isFeatured": false,
      "featuredUntil": null,
      "user": {
        "id": "user-uuid",
        "email": "marie@example.com",
        "firstName": "Marie",
        "lastName": "Ndiaye"
      },
      "...": "Tous les autres champs du modèle Provider sont retournés"
    }
  }
}
```

**Utilisation frontend :**  
Afficher un toggle ON/OFF dans la fiche prestataire côté admin. Préciser que le prestataire ne sera plus visible publiquement mais pourra toujours accéder à son compte.

---

### `PUT /providers/:id/review-documents` - Réviser documents

**Description :**  
Validation détaillée des documents soumis par un prestataire (CNI, licence commerciale, etc.).

**Ce qu'il fait :**
- Marque chaque document comme approuvé ou rejeté
- Met à jour le statut de vérification global
- Envoie un email avec les raisons de rejet si applicable

**Body :**
```json
{
  "decision": "approved",  // "approved", "rejected" ou "under_review"
  "notes": "Commentaire admin",
  "approvedDocuments": [0, 1],  // Index des documents approuvés
  "rejectedDocuments": [
    { "index": 2, "reason": "Document expiré" }
  ]
}
```

---

## ⭐ 5. MODÉRATION DES AVIS

### `GET /reviews` - Liste des avis

**Description :**  
Récupère tous les avis pour la modération.

**Paramètres query :**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Numéro de page |
| `limit` | int | Éléments par page |
| `visible` | bool | `true` ou `false` pour filtrer |

---

### `PUT /reviews/:id/visibility` - Masquer/Afficher un avis

**Description :**  
Modère un avis sans le supprimer.

**Ce qu'il fait :**
- Change `isVisible` de l'avis
- **Recalcule automatiquement** la note moyenne du prestataire
- L'avis masqué n'apparaît plus publiquement

**Body :**
```json
{ "isVisible": false }
```

---

## 💳 6. PAIEMENTS

### `GET /payments` - Historique des paiements

**Description :**  
Récupère tous les paiements de la plateforme pour le suivi financier.

**Ce qu'il retourne :**
- Liste paginée des paiements
- Détails : montant, type, statut, date, utilisateur, prestataire
- Totaux calculés

---

## 🔒 7. SÉCURITÉ

### `GET /security-logs` - Journaux de sécurité

**Description :**  
Récupère les événements de sécurité (connexions, tentatives échouées, etc.).

**Paramètres query :**
| Param | Type | Description |
|-------|------|-------------|
| `limit` | int | Nombre d'événements (défaut: 100) |
| `eventType` | string | `login_success`, `login_failed`, `otp_failed`, etc. |
| `riskLevel` | string | `low`, `medium`, `high` |
| `userId` | UUID | Filtrer par utilisateur |
| `success` | bool | Événements réussis ou échoués |
| `startDate` | date | Début période |
| `endDate` | date | Fin période |

---

### `GET /security-logs/export` - Export CSV

**Description :**  
Télécharge les logs de sécurité en format CSV.

---

### `GET /banned-ips` - IPs bannies

**Description :**  
Liste les IPs actuellement bloquées.

---

### `POST /banned-ips` - Bannir une IP

**Description :**  
Bloque manuellement une IP suspecte.

**Body :**
```json
{
  "ipAddress": "192.168.1.100",
  "reason": "Tentatives de brute force",
  "duration": 86400  // Durée en secondes (24h), null = permanent
}
```

---

### `DELETE /banned-ips/:ip` - Débannir

**Description :**  
Retire une IP de la liste noire.

---

## 📤 8. EXPORTS

### `GET /export/users` - Export utilisateurs CSV
### `GET /export/providers` - Export prestataires CSV
### `GET /export/reviews` - Export avis CSV
### `GET /export/contacts` - Export contacts CSV
### `GET /export/report` - Rapport PDF global

**Description :**  
Génère des fichiers téléchargeables pour analyse externe (Excel, etc.).

---

## 📜 9. AUDIT LOGS

### `GET /audit-logs` - Journal d'audit

**Description :**  
Historique des actions effectuées sur la plateforme (création, modification, suppression).

**Paramètres query :**
| Param | Type | Description |
|-------|------|-------------|
| `limit` | int | Nombre d'entrées |
| `userId` | UUID | Actions d'un utilisateur |
| `entityType` | string | `User`, `Provider`, `Review`, etc. |

---

## 📢 10. GESTION DES BANNIÈRES

### `POST /banners` - Créer une bannière (Admin)

**Description :**  
Ajoute une nouvelle bannière publicitaire avec upload d'image.

**Body (Multipart/Form-Data) :**
- `title` (string, requis) : Titre de l'annonce
- `description` (string) : Texte optionnel
- `bannerImage` (file, requis) : Fichier image (JPG, PNG, WebP)
- `linkUrl` (string) : URL de redirection au clic
- `type` (enum) : `main_home`, `sidebar`, `featured`, `popup`
- `startDate` (date) : Début de diffusion (optionnel)
- `endDate` (date) : Fin de diffusion (optionnel)
- `isActive` (boolean) : Défaut true
- `order` (int) : Priorité d'affichage (0 par défaut)

---

### `GET /banners/admin` - Liste complète (Admin)

**Description :**  
Récupère toutes les bannières configurées, actives ou non, pour la gestion administrative.

---

### `PUT /banners/:id` - Modifier une bannière (Admin)

**Description :**  
Met à jour les informations d'une bannière. Si une nouvelle `bannerImage` est fournie, l'ancienne est supprimée de Cloudinary.

---

### `DELETE /banners/:id` - Supprimer (Admin)

**Description :**  
Supprime définitivement la bannière de la base de données et l'image de Cloudinary.

---

### `GET /api/banners` - Liste publique (Tout le monde)

**Description :**  
Endpoint public pour afficher les bannières sur le site. Il filtre automatiquement les bannières actives et dont la date est valide.

---

## 🎨 Recommandations Frontend

### Dashboard suggéré

```
┌─────────────────────────────────────────────────────────────────┐
│  DASHBOARD ADMIN                                                 │
├─────────────┬─────────────┬─────────────┬─────────────┐         │
│ 👥 Users    │ 🏪 Providers│ ⭐ Reviews  │ 📩 Contacts │         │
│ 150 total   │ 25 actifs   │ 4.35 ★      │ 45 pending  │         │
│ +12 ce mois │ 5 pending   │ 200 total   │             │         │
└─────────────┴─────────────┴─────────────┴─────────────┘         │
│                                                                  │
│  📋 CANDIDATURES EN ATTENTE (GET /provider-applications?status=pending)
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Marie D. - Salon Marie - il y a 2h          [Voir] [Valider]││
│  │ Fatou K. - Traiteur Fatou - il y a 5h       [Voir] [Valider]││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  🔒 SÉCURITÉ (GET /security-stats)                              │
│  ┌──────────────────────────────────────────────┐               │
│  │ ⚠️ 12 tentatives échouées cette heure        │               │
│  │ 🚫 5 IPs bannies                             │               │
│  └──────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 Codes d'erreur

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 400 | Données invalides / Décision invalide |
| 401 | Non authentifié |
| 403 | Non autorisé (pas admin) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

---

## 🔄 WORKFLOWS VISUELS

### Dashboard Admin
```
┌─────────────────────────────────────────────────────────────────┐
│                      GET /api/admin/stats                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 👥 Users │ │ 🏪 Provid│ │ ⭐ Reviews│ │ 📩 Contact│          │
│  │ total    │ │ verified │ │ total    │ │ pending  │           │
│  │ new/month│ │ pending  │ │ avg rate │ │ today    │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📋 CANDIDATURES EN ATTENTE                                  ││
│  │ GET /provider-applications?status=pending                   ││
│  │ ┌─────────────────────────────────────────────────────────┐ ││
│  │ │ Marie D. - Salon Marie - il y a 2h      [Voir][Valider] │ ││
│  │ │ Fatou K. - Traiteur Fatou - il y a 5h   [Voir][Valider] │ ││
│  │ └─────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔒 SÉCURITÉ - GET /security-stats                          ││
│  │ ⚠️ 12 tentatives échouées cette heure                       ││
│  │ 🚫 5 IPs bannies                                            ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

### Workflow Validation Candidature Prestataire
```
[Client] POST /api/providers/apply
    │
    ▼
┌─────────────────────┐
│ ProviderApplication │
│ status: pending     │
│ documents: [CNI]    │
└─────────┬───────────┘
          │
          │ 📧 Email confirmation
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                           ADMIN                                  │
│                                                                  │
│  GET /api/admin/provider-applications?status=pending            │
│      │                                                           │
│      ▼                                                           │
│  ┌─────────────────────┐                                        │
│  │ Liste candidatures  │                                        │
│  │ • Marie - Salon     │                                        │
│  │ • Fatou - Traiteur  │                                        │
│  └─────────┬───────────┘                                        │
│            │ Clic sur une candidature                           │
│            ▼                                                     │
│  GET /api/admin/provider-applications/:id                       │
│      │                                                           │
│      ▼                                                           │
│  ┌─────────────────────┐                                        │
│  │ Détails complets:   │                                        │
│  │ • Infos business    │                                        │
│  │ • Documents CNI     │                                        │
│  │ • Photos            │                                        │
│  └─────────┬───────────┘                                        │
│            │                                                     │
│      ┌─────┴─────┐                                              │
│      ▼           ▼                                              │
│  [APPROUVER]  [REJETER]                                         │
│      │           │                                              │
│      │           └───────────────────────────────┐              │
│      │                                           ▼              │
│      │                     PUT /review { decision: "rejected" } │
│      │                           │                              │
│      │                           ▼                              │
│      │                     ┌─────────────────┐                  │
│      │                     │ status: rejected│                  │
│      │                     │ 📧 Email rejet  │                  │
│      │                     └─────────────────┘                  │
│      │                                                           │
│      ▼                                                           │
│  PUT /provider-applications/:id/review { decision: "approved" } │
└──────┬──────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSACTION ATOMIQUE                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 1. User.role = 'provider'                                 │  │
│  │ 2. Provider.create({..., isVerified: false })             │  │
│  │ 3. Subscription.create({status: 'trial', days: 30})      │  │
│  │ 4. Application.status = 'approved'                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Si erreur → ROLLBACK total                                     │
└──────┬──────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────┐
│ 📧 Email Bienvenue   │
└─────────┬───────────┘
          │
          ▼
    ⏳ Prestataire créé mais en attente de vérification finale
       (Apparaît dans /admin/providers/under-review)
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│              ÉTAPE 2: VÉRIFICATION DOCUMENTAIRE                  │
│                                                                  │
│  GET /api/admin/providers/under-review                           │
│      │                                                           │
│      ▼                                                           │
│  PUT /api/admin/providers/:id/review-documents                   │
│  { decision: "approved", approvedDocuments: [0, 1] }             │
│                                                                  │
└──────┬──────────────────────────────────────────────────────────┘
       │
       ▼
    ✅ Prestataire Certifié (isVerified: true)
       Badge visible publiquement
```

---

### Workflow Export Données
```
┌─────────────────────────────────────────────────────────────────┐
│                      EXPORTS ADMIN                               │
│                                                                  │
│  GET /api/admin/export/users                                    │
│      └──► users_2026-01-15.csv                                  │
│           id, email, firstName, lastName, role, createdAt       │
│                                                                  │
│  GET /api/admin/export/providers                                │
│      └──► providers_2026-01-15.csv                              │
│           businessName, location, rating, views, verified       │
│                                                                  │
│  GET /api/admin/export/reviews                                  │
│      └──► reviews_2026-01-15.csv                                │
│           provider, user, rating, comment, date                 │
│                                                                  │
│  GET /api/admin/export/contacts                                 │
│      └──► contacts_2026-01-15.csv                               │
│           sender, provider, message, status, date               │
│                                                                  │
│  GET /api/admin/export/report                                   │
│      └──► rapport_mensuel.pdf                                   │
│           Stats globales + graphiques + tendances               │
│                                                                  │
│  GET /api/admin/security-logs/export                            │
│      └──► security_logs_2026-01-01_to_2026-01-15.csv           │
│           date, eventType, ip, email, riskLevel, success        │
└─────────────────────────────────────────────────────────────────┘
```

---

### Workflow Gestion Paiements
```
[Admin] GET /api/admin/payments?status=ACCEPTED&page=1
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LISTE DES PAIEMENTS                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ID           │ Type        │ Montant │ User    │ Status    │ │
│  ├──────────────┼─────────────┼─────────┼─────────┼───────────┤ │
│  │ AELI170534...│ subscription│ 5000 XAF│ Marie D.│ ✅ ACCEPTED│ │
│  │ AELI170535...│ boost       │ 2000 XAF│ Fatou K.│ ✅ ACCEPTED│ │
│  │ AELI170536...│ featured    │10000 XAF│ Jean P. │ ⏳ PENDING │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📊 TOTAUX                                                   ││
│  │                                                              ││
│  │ Total encaissé (ACCEPTED):  157 000 FCFA                    ││
│  │ En attente (PENDING):        12 000 FCFA                    ││
│  │ Nombre de transactions:      45                              ││
│  │                                                              ││
│  │ Par type:                                                    ││
│  │ • Abonnements:  120 000 FCFA (25 tx)                        ││
│  │ • Featured:      25 000 FCFA (3 tx)                         ││
│  │ • Boost:         12 000 FCFA (17 tx)                        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

### Workflow Modération Avis
```
[Admin] GET /api/admin/reviews?visible=true
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MODÉRATION DES AVIS                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ⭐⭐⭐⭐⭐ - Fatou K. sur Salon Marie                      │ │
│  │ "Excellent service, très professionnelle !"                 │ │
│  │ 📅 15/01/2026                              [✅ Visible]     │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ ⭐ - Anonyme sur Traiteur Fatou                            │ │
│  │ "Nul, à éviter !!! 💩💩💩"                                 │ │
│  │ 📅 15/01/2026                              [🚫 Masquer]     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  PUT /api/admin/reviews/:id/visibility { isVisible: false }     │
│      │                                                           │
│      ▼                                                           │
│  ┌─────────────────────┐                                        │
│  │ review.isVisible = false                                     │
│  │ Provider.averageRating recalculé                            │
│  │ Avis masqué publiquement                                    │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

### Workflow Sécurité IP Banning
```
[Admin] GET /api/admin/security-stats
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD SÉCURITÉ                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ ⚠️ 12        │ │ 📊 47        │ │ 🔴 3         │            │
│  │ Échecs/heure │ │ Échecs/jour  │ │ High Risk    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  TOP IPs SUSPECTES:                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 192.168.1.100  │ 15 tentatives │                [🚫 Bannir] │ │
│  │ 10.0.0.50      │  8 tentatives │                [🚫 Bannir] │ │
│  │ 172.16.0.22    │  5 tentatives │                [⚠️ Surveiller]│
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  POST /api/admin/banned-ips                                     │
│  { ipAddress: "192.168.1.100", reason: "Brute force", duration: 86400 }
│      │                                                           │
│      ▼                                                           │
│  ┌─────────────────────┐                                        │
│  │ IP bloquée 24h      │                                        │
│  │ Toutes les requêtes │                                        │
│  │ → 403 Forbidden     │                                        │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```
