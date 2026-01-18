# 📖 Guide d'Infrastructure : Déploiement & CI/CD Automatisé

Ce document explique comment installer l'application AELI sur un VPS
Ubuntu et configurer GitHub pour que chaque mise à jour du code soit
déployée automatiquement.

------------------------------------------------------------------------

## 🏗️ Étape 1 : Préparation du VPS (Système)

Connectez-vous à votre VPS en SSH et préparez l'environnement Docker.

### 1. Mise à jour du système

``` bash
sudo apt update && sudo apt upgrade -y
```

### 2. Installation de Docker

``` bash
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
newgrp docker
```

------------------------------------------------------------------------

## 📁 Étape 2 : Installation Initiale de l'App

### 1. Récupération du projet

``` bash
git clone https://github.com/AELISERVICE/AELI-SERVICE-.git ~/my-app
cd ~/my-app
```

### 2. Configuration des variables d'environnement

Créez le fichier de configuration (obligatoire pour que l'app se
connecte à la base de données).

``` bash
nano .env
```

Copiez et collez vos variables (DB_HOST, DB_USER, etc.).\
**Note :** Utilisez `DB_HOST=aeli_postgres` pour Docker.

**Doit figurer dans le .env en plus de vos autres informations:**
``` 
# Database Configuration (PostgreSQL)
DB_HOST=db
DB_PORT=5432
DB_NAME=aeli_services
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# Redis Configuration (optional, cache disabled if not available)
REDIS_URL=redis://aeli_redis:6379
REDIS_HOST=aeli_redis
REDIS_PORT=6379
```


------------------------------------------------------------------------

## 🤖 Étape 3 : Configuration du CI/CD (GitHub Actions)

### 1. Création du dossier de workflow

``` bash
mkdir -p .github/workflows
nano .github/workflows/deploy.yml
```

### 2. Contenu du fichier `deploy.yml`

``` yaml
name: Deploy AELI Service

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  test:
    name: 🧪 Run Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Tests
        run: npm test || echo "No tests specified yet"

  deploy:
    name: 🚀 Deploy to VPS
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: 51.79.68.223
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/my-app
            
            # 1. Mise à jour du code
            git pull origin main
            
            # 2. Redémarrage avec la nouvelle syntaxe (SANS le tiret)
            # On utilise -T pour éviter les erreurs de terminal (TTY) dans le CI
            sudo docker compose up -d --build
            
            # 3. Application des migrations Sequelize
            sudo docker compose exec -T api npx sequelize-cli db:migrate
            
            # 4. Nettoyage
            sudo docker image prune -f
            
            # 5. Statut final
            sudo docker ps
```

### 3. Envoi de la configuration vers GitHub

``` bash
git add .github/
git commit -m "Setup CI/CD automation"
git push origin main
```

------------------------------------------------------------------------

## 🔐 Étape 4 : Sécurisation (Secrets GitHub)

``` bash
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
```

``` bash
cat ~/.ssh/id_ed25519
```

Ajoutez les secrets suivants dans GitHub Actions : - SSH_HOST -
SSH_USERNAME - SSH_PRIVATE_KEY

------------------------------------------------------------------------

## 🚀 Étape 5 : Déploiement & Vérification

``` bash
docker ps
```

------------------------------------------------------------------------

## 🛠️ Commandes Utiles de Maintenance

  --------------------------------------------------------------------------------
  Action                              Commande
  ----------------------------------- --------------------------------------------
  Voir les logs de l'API              `docker compose logs -f api`

  Redémarrer manuellement             `docker compose restart`

  Voir l'espace disque Docker         `docker system df`
  
  Consulter les status de dernier deployement         `docker ps`

  Forcer une mise à jour manuelle     `git pull && docker compose up -d --build`
  --------------------------------------------------------------------------------
