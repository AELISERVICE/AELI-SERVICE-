# 🚀 AELI Services API - Documentation du Déploiement CI/CD

Ce projet utilise une architecture conteneurisée avec **Docker** et un pipeline de déploiement automatique via **GitHub Actions**. Toute modification poussée sur la branche `main` est automatiquement déployée sur le serveur VPS.

---

## 🏗️ Architecture Stack

* **Runtime**: Node.js (API Backend)
* **Base de données**: PostgreSQL 15 (Persistance des données)
* **Cache/Queue**: Redis 7 (Gestion des files d'attente et cache)
* **Orchestration**: Docker Compose
* **CI/CD**: GitHub Actions
* **Hébergement**: VPS (Ubuntu) - IP: `51.79.68.223`

---

## 🛠️ Fonctionnement du Pipeline CI/CD

Le workflow est défini dans `.github/workflows/deploy.yml`. 



À chaque `git push origin main` :
1.  **Authentification** : GitHub se connecte au VPS via SSH en utilisant une clé privée sécurisée.
2.  **Mise à jour** : Le script exécute un `git pull` sur le VPS pour récupérer le dernier code.
3.  **Synchronisation Docker** : 
    * `sudo docker-compose down` : Arrête proprement les services actuels.
    * `sudo docker-compose up -d --build` : Reconstruit l'image API et relance tous les services en mode détaché.
4.  **Nettoyage** : `sudo docker image prune -f` supprime les anciennes images inutilisées pour économiser l'espace disque.

---

## ⚙️ Configuration de l'Environnement (.env)

Le fichier `.env` sur le VPS est la source de vérité et contient les secrets de production. **Il ne doit jamais être versionné sur GitHub.**

### Variables cruciales pour la communication Docker :
Pour que l'API puisse joindre la base de données et Redis à l'intérieur du réseau Docker, utilisez les noms de services définis dans `docker-compose.yml` :

```env
# Database (PostgreSQL)
DB_HOST=db             # Obligatoire : correspond au nom du service Docker
DB_PORT=5432
DB_NAME=aeli_services
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

# Cache (Redis)
REDIS_URL=redis://redis:6379

# API Config
PORT=5000
API_BASE_URL=[http://51.79.68.223:5000](http://51.79.68.223:5000)
NODE_ENV=development   # À changer en 'production' pour le lancement officiel
