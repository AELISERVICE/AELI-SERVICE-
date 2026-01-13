# 🛠️ Services API

Gestion des services et catégories.

## Base URL
```
/api/services
```

---

## Catégories

### GET `/categories` - Liste des Catégories

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Coiffure",
        "slug": "coiffure",
        "description": "Services de coiffure...",
        "icon": "💇",
        "isActive": true,
        "order": 1
      }
    ]
  }
}
```

---

### POST `/categories` - Créer une Catégorie 🔒

⚠️ **Rôle requis:** `admin`

**Body:**
```json
{
  "name": "Maquillage",
  "description": "Services de maquillage professionnel",
  "icon": "💄",
  "order": 5
}
```

---

### PUT `/categories/:id` - Modifier une Catégorie 🔒

⚠️ **Rôle requis:** `admin`

**Body:**
```json
{
  "name": "Maquillage Pro",
  "isActive": true,
  "order": 3
}
```

---

## Services

### GET `/provider/:providerId` - Services d'un Prestataire

**Réponse 200:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid",
        "name": "Coupe femme",
        "description": "Coupe classique ou moderne",
        "price": 5000,
        "priceType": "from",
        "priceMax": null,
        "duration": 45,
        "tags": ["femme", "coupe"],
        "isActive": true,
        "category": {
          "name": "Coiffure",
          "slug": "coiffure"
        }
      }
    ]
  }
}
```

---

### POST `/` - Créer un Service 🔒

⚠️ **Rôle requis:** `provider`

**Body:**
```json
{
  "categoryId": "uuid",
  "name": "Tresses africaines",
  "description": "Tresses traditionnelles ou modernes...",
  "price": 10000,
  "priceType": "from",
  "priceMax": 25000,
  "duration": 180,
  "tags": ["tresses", "femme"]
}
```

**Types de prix:**
| Type | Description |
|------|-------------|
| `fixed` | Prix fixe |
| `from` | À partir de X |
| `range` | Entre X et Y (utiliser priceMax) |
| `contact` | Sur devis |

---

### PUT `/:id` - Modifier un Service 🔒

Seul le propriétaire peut modifier.

---

### DELETE `/:id` - Supprimer un Service 🔒

Seul le propriétaire peut supprimer.

---

## Schéma Service

| Champ | Type | Description |
|-------|------|-------------|
| `id` | uuid | ID unique |
| `providerId` | uuid | ID prestataire |
| `categoryId` | uuid | ID catégorie |
| `name` | string | Nom du service |
| `description` | string | Description |
| `price` | number | Prix en FCFA |
| `priceType` | enum | Type de prix |
| `priceMax` | number | Prix max (pour range) |
| `duration` | int | Durée en minutes |
| `tags` | string[] | Tags/mots-clés |
| `isActive` | bool | Actif/inactif |
