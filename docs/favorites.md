# ❤️ API Favoris - Documentation Complète

Documentation détaillée des endpoints de gestion des favoris.

## Base URL
```
/api/favorites
```

🔒 **Toutes les routes requièrent une authentification**

---

## 💖 Fonctionnalité Favoris

### Principe
Les utilisateurs authentifiés peuvent sauvegarder des prestataires en favoris pour les retrouver facilement plus tard.

### Caractéristiques
- Un utilisateur peut avoir **plusieurs favoris**
- Un prestataire ne peut être ajouté qu'**une seule fois** par utilisateur
- Les favoris sont **persistants** (sauvegardés en base)

---

## ➕ 1. AJOUTER AUX FAVORIS

### `POST /` - Ajouter un favori

**🔒 Authentification requise**

**Description :**  
Ajoute un prestataire à la liste des favoris de l'utilisateur.

**Ce qu'il fait :**
1. Vérifie que le prestataire existe
2. Vérifie que ce n'est pas déjà un favori
3. Crée l'enregistrement Favorite

**Body :**
```json
{
  "providerId": "uuid"
}
```

**Réponse 201 :**
```json
{
  "success": true,
  "message": "Prestataire ajouté aux favoris",
  "favorite": {
    "id": "uuid",
    "providerId": "uuid",
    "createdAt": "2026-01-15T19:30:00Z"
  }
}
```

**Erreurs possibles :**
| Code | Message | Cause |
|------|---------|-------|
| 400 | Déjà en favoris | Prestataire déjà ajouté |
| 404 | Prestataire non trouvé | ID invalide |

**Workflow frontend :**
```javascript
const toggleFavorite = async (providerId, isFavorite) => {
  if (isFavorite) {
    await fetch(`/api/favorites/${providerId}`, { method: 'DELETE' });
  } else {
    await fetch('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ providerId })
    });
  }
};
```

---

## 📋 2. LISTE DES FAVORIS

### `GET /` - Mes favoris

**🔒 Authentification requise**

**Description :**  
Récupère la liste de tous les prestataires en favoris de l'utilisateur.

**Ce qu'il fait :**
- Retourne les favoris avec les informations des prestataires
- Inclut les données essentielles pour l'affichage

**Paramètres query :**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Numéro de page |
| `limit` | int | Éléments par page |

**Réponse 200 :**
```json
{
  "success": true,
  "favorites": [
    {
      "id": "uuid",
      "addedAt": "2026-01-15T19:30:00Z",
      "provider": {
        "id": "uuid",
        "businessName": "Salon Marie",
        "description": "Coiffure professionnelle...",
        "location": "Douala",
        "averageRating": 4.8,
        "totalReviews": 25,
        "photos": ["url1"],
        "isVerified": true,
        "subscription": {
          "isActive": true
        }
      }
    },
    {
      "id": "uuid",
      "addedAt": "2026-01-10T14:00:00Z",
      "provider": {
        "id": "uuid",
        "businessName": "Traiteur Fatou",
        "description": "Cuisine traditionnelle...",
        "location": "Yaoundé",
        "averageRating": 4.5,
        "totalReviews": 18,
        "photos": ["url2"],
        "isVerified": true,
        "subscription": {
          "isActive": true
        }
      }
    }
  ],
  "count": 5,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5
  }
}
```

---

## ➖ 3. RETIRER DES FAVORIS

### `DELETE /:providerId` - Supprimer un favori

**🔒 Authentification requise**

**Description :**  
Retire un prestataire de la liste des favoris.

**Ce qu'il fait :**
- Vérifie que le favori existe
- Supprime l'enregistrement

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Prestataire retiré des favoris"
}
```

---

## ✅ 4. VÉRIFIER UN FAVORI

### `GET /check/:providerId` - Est-ce un favori ?

**🔒 Authentification requise**

**Description :**  
Vérifie si un prestataire est dans les favoris de l'utilisateur. Utile pour afficher l'état du bouton favori.

**Ce qu'il fait :**
- Recherche le favori pour ce prestataire
- Retourne un booléen

**Réponse 200 :**
```json
{
  "success": true,
  "isFavorite": true
}
```

**Réponse si non favori :**
```json
{
  "success": true,
  "isFavorite": false
}
```

**Workflow frontend :**
```javascript
// Dans la page profil prestataire
const checkFavoriteStatus = async (providerId) => {
  const response = await fetch(`/api/favorites/check/${providerId}`);
  const { isFavorite } = await response.json();
  
  // Mettre à jour le bouton
  const heartIcon = document.querySelector('.favorite-btn');
  heartIcon.classList.toggle('active', isFavorite);
};
```

---

## 🎨 Composants Frontend Suggérés

### Bouton Favori (sur carte prestataire)
```javascript
const FavoriteButton = ({ providerId, initialState }) => {
  const [isFavorite, setIsFavorite] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      if (isFavorite) {
        await fetch(`/api/favorites/${providerId}`, { 
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ providerId })
        });
      }
      setIsFavorite(!isFavorite);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggle} 
      disabled={loading}
      className={`favorite-btn ${isFavorite ? 'active' : ''}`}
    >
      {isFavorite ? '❤️' : '🤍'}
    </button>
  );
};
```

### Page Mes Favoris
```html
<div class="favorites-page">
  <h1>Mes Favoris ❤️</h1>
  
  <div class="favorites-grid">
    <!-- Carte prestataire avec bouton retirer -->
    <div class="provider-card">
      <img src="photo.jpg" alt="Salon Marie" />
      <h3>Salon Marie</h3>
      <p>⭐ 4.8 (25 avis)</p>
      <p>📍 Douala</p>
      <div class="actions">
        <button class="view-btn">Voir le profil</button>
        <button class="remove-btn">Retirer ❌</button>
      </div>
    </div>
  </div>
  
  <!-- État vide -->
  <div class="empty-state" hidden>
    <p>Vous n'avez pas encore de favoris</p>
    <a href="/providers">Découvrir les prestataires</a>
  </div>
</div>
```

### Style CSS
```css
.favorite-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;
}

.favorite-btn:hover {
  transform: scale(1.2);
}

.favorite-btn.active {
  animation: heartbeat 0.3s ease-in-out;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}
```

---

## 🔄 Flux Utilisateur

```
┌─────────────────────────────────────────────────────────────────┐
│                    GESTION DES FAVORIS                           │
└─────────────────────────────────────────────────────────────────┘

  [Page prestataire]                    [Page Mes Favoris]
         │                                      │
         ▼                                      │
  ┌─────────────┐                              │
  │ 🤍 Ajouter  │ ◄─────────────────────────────
  │ aux favoris │                              │
  └──────┬──────┘                              │
         │ POST /favorites                      │
         ▼                                      │
  ┌─────────────┐                              │
  │ ❤️ Favori   │ ─────────────────────────────►
  │             │      GET /favorites          │
  └──────┬──────┘                              ▼
         │                              ┌─────────────┐
         │ DELETE /favorites/:id        │ Liste des   │
         ▼                              │ favoris     │
  ┌─────────────┐                       └─────────────┘
  │ 🤍 Retirer  │
  │ des favoris │
  └─────────────┘
```

---

## 🚨 Codes d'erreur

| Code | Situation |
|------|-----------|
| 400 | Déjà en favoris |
| 401 | Non authentifié |
| 404 | Prestataire/Favori non trouvé |

---

## 🔄 WORKFLOWS VISUELS

### Bouton Favori sur Carte Prestataire
```
┌─────────────────────────────────────────────────────────────────┐
│                    BOUTON FAVORI                                 │
│                    POST/DELETE /api/favorites                    │
└─────────────────────────────────────────────────────────────────┘

┌─── ÉTAT NON FAVORI ───────────────────────────────────────────┐
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                            [🤍]          │ │
│  │ [📸 Photo prestataire]                                   │ │
│  │                                                          │ │
│  │ Salon Marie                           ⭐ 4.8            │ │
│  │ 📍 Douala                             (25 avis)         │ │
│  │                                                          │ │
│  │ "Salon de coiffure spécialisé..."                       │ │
│  │                                                          │ │
│  │ [Voir le profil]                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Clic sur [🤍]                                                 │
│      │                                                         │
│      ├── Vérification: utilisateur connecté ?                 │
│      │       │                                                 │
│      │       ├── NON → Popup "Connectez-vous pour sauvegarder"│
│      │       │                                                 │
│      │       └── OUI → POST /api/favorites                    │
│      │                 { providerId: "uuid" }                  │
│      │                                                         │
│      └── Animation: 🤍 → ❤️ (battement de cœur)              │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌─── ÉTAT FAVORI ───────────────────────────────────────────────┐
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                            [❤️]          │ │
│  │ [📸 Photo prestataire]                                   │ │
│  │                                                          │ │
│  │ Salon Marie                           ⭐ 4.8            │ │
│  │ 📍 Douala                             (25 avis)         │ │
│  │                                                          │ │
│  │ "Salon de coiffure spécialisé..."                       │ │
│  │                                                          │ │
│  │ [Voir le profil]                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Clic sur [❤️]                                                 │
│      │                                                         │
│      └── DELETE /api/favorites/:providerId                    │
│          Animation: ❤️ → 🤍                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Page "Mes Favoris"
```
┌─────────────────────────────────────────────────────────────────┐
│                    MES FAVORIS                                   │
│                    GET /api/favorites                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ❤️ Mes Favoris (5)                                             │
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ [📸]            │ │ [📸]            │ │ [📸]            │   │
│  │                 │ │                 │ │                 │   │
│  │ Salon Marie     │ │ Traiteur Fatou  │ │ Couture Awa     │   │
│  │ ⭐ 4.8 (25)    │ │ ⭐ 4.5 (18)    │ │ ⭐ 4.9 (42)    │   │
│  │ 📍 Douala      │ │ 📍 Yaoundé     │ │ 📍 Douala      │   │
│  │                 │ │                 │ │                 │   │
│  │ [Voir] [❌]     │ │ [Voir] [❌]     │ │ [Voir] [❌]     │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐                        │
│  │ [📸]            │ │ [📸]            │                        │
│  │                 │ │                 │                        │
│  │ DJ Mix Master   │ │ Décor Events    │                        │
│  │ ⭐ 4.2 (8)     │ │ ⭐ 4.7 (35)    │                        │
│  │ 📍 Kribi       │ │ 📍 Yaoundé     │                        │
│  │                 │ │                 │                        │
│  │ [Voir] [❌]     │ │ [Voir] [❌]     │                        │
│  └─────────────────┘ └─────────────────┘                        │
│                                                                  │
│  Ajouté le plus récemment en premier                            │
└─────────────────────────────────────────────────────────────────┘
```

---

### État Vide (Aucun Favori)
```
┌─────────────────────────────────────────────────────────────────┐
│                    MES FAVORIS                                   │
│                    GET /api/favorites → []                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ❤️ Mes Favoris                                                 │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │                         💔                                   ││
│  │                                                              ││
│  │            Vous n'avez pas encore de favoris                ││
│  │                                                              ││
│  │   Parcourez les prestataires et cliquez sur le cœur        ││
│  │   pour les sauvegarder ici !                                ││
│  │                                                              ││
│  │                [Découvrir les prestataires]                 ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Workflow Complet Toggle Favori
```
┌─────────────────────────────────────────────────────────────────┐
│                    TOGGLE FAVORI (Frontend)                      │
└─────────────────────────────────────────────────────────────────┘

[User clique sur le cœur]
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ // Code JavaScript                                               │
│                                                                  │
│ async function toggleFavorite(providerId) {                     │
│   // 1. État optimiste (UI+rapide)                              │
│   setLoading(true);                                             │
│   const newState = !isFavorite;                                 │
│   setIsFavorite(newState);  // Update UI immédiatement          │
│                                                                  │
│   try {                                                          │
│     if (newState) {                                              │
│       // Ajouter aux favoris                                    │
│       await fetch('/api/favorites', {                           │
│         method: 'POST',                                         │
│         headers: { Authorization: `Bearer ${token}` },          │
│         body: JSON.stringify({ providerId })                    │
│       });                                                        │
│       showToast('❤️ Ajouté aux favoris !');                     │
│     } else {                                                     │
│       // Retirer des favoris                                    │
│       await fetch(`/api/favorites/${providerId}`, {             │
│         method: 'DELETE',                                        │
│         headers: { Authorization: `Bearer ${token}` }           │
│       });                                                        │
│       showToast('💔 Retiré des favoris');                       │
│     }                                                            │
│   } catch (error) {                                              │
│     // Rollback si erreur                                       │
│     setIsFavorite(!newState);                                   │
│     showError('Erreur, réessayez');                             │
│   } finally {                                                    │
│     setLoading(false);                                          │
│   }                                                              │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ Animation CSS                                                    │
│                                                                  │
│ @keyframes heartbeat {                                          │
│   0%   { transform: scale(1); }                                 │
│   25%  { transform: scale(1.3); }                               │
│   50%  { transform: scale(1); }                                 │
│   75%  { transform: scale(1.2); }                               │
│   100% { transform: scale(1); }                                 │
│ }                                                                │
│                                                                  │
│ .favorite-btn.active {                                          │
│   animation: heartbeat 0.5s ease-in-out;                        │
│   color: #e74c3c;                                               │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

### Vérification Favori au Chargement
```
┌─────────────────────────────────────────────────────────────────┐
│                    CHARGEMENT PAGE PRESTATAIRE                   │
│                    GET /api/favorites/check/:providerId          │
└─────────────────────────────────────────────────────────────────┘

[Page profil prestataire chargée]
    │
    ├── GET /api/providers/:id (données du profil)
    │
    └── GET /api/favorites/check/:providerId (état favori)
        │
        ▼
    { "success": true, "isFavorite": true/false }
        │
        ▼
    ┌─────────────────────────────────────────────────────────────┐
    │ if (isFavorite) {                                            │
    │   heartButton.classList.add('active');  // ❤️                │
    │   heartButton.textContent = '❤️';                            │
    │ } else {                                                      │
    │   heartButton.classList.remove('active');  // 🤍              │
    │   heartButton.textContent = '🤍';                            │
    │ }                                                             │
    └─────────────────────────────────────────────────────────────┘
```
