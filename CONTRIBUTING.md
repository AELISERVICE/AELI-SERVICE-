# Guide de Contribution

Merci de l'intérêt que vous portez à AELI Services Backend ! Ce document fournit des directives pour contribuer au projet.

## 🚀 Mise en route

### Prérequis
- Node.js (v18+)
- PostgreSQL
- Redis (optionnel pour le développement local, requis pour la mise en cache)

### Installation
1. Clonez le dépôt.
2. Installez les dépendances : `npm install`.
3. Configurez votre environnement : `cp .env.example .env`.
4. Créez la base de données PostgreSQL.
5. Exécutez les migrations : `npm run db:migrate`.

## 🌿 Stratégie de Branchage (Git Flow)

- `main` : Branche stable de production.
- `develop` : Branche d'intégration pour les nouvelles fonctionnalités.
- `feature/*` : Nouvelles fonctionnalités (doit partir de `develop`).
- `bugfix/*` : Corrections de bugs (doit partir de `develop`).
- `hotfix/*` : Corrections urgentes en production (doit partir de `main`).

## ✍️ Standards de Code

- **Clean Code** : Suivez les principes du Clean Code.
- **Nomenclature** : 
    - Variables/Fonctions : `camelCase`.
    - Classes/Modèles : `PascalCase`.
    - Fichiers : `kebab-case` ou `camelCase` (de manière cohérente avec l'existant).
- **Commentaires** : Utilisez JSDoc pour documenter les fonctions et les classes complexes.

## 🧪 Tests

Toute nouvelle fonctionnalité ou correction de bug doit être accompagnée de tests.

- **Exécuter tous les tests** : `npm test`
- **Exécuter les tests avec couverture** : `npm run test:coverage`

Avant de soumettre une Pull Request, assurez-vous que tous les tests passent.

## 📬 Processus de Pull Request

1. Créez votre branche depuis `develop`.
2. Implémentez vos changements.
3. Ajoutez ou mettez à jour les tests.
4. Assurez-vous que les tests passent et que la couverture ne régresse pas.
5. Ouvrez une Pull Request vers la branche `develop`.
6. Décrivez clairement vos changements dans la description de la PR.

## 🛡️ Sécurité

Si vous découvrez une faille de sécurité, merci de ne pas ouvrir d'issue publique. Contactez directement les mainteneurs.
