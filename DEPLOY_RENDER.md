# 🚀 Guide de Déploiement sur Render.com

## Prérequis
- ✅ Compte GitHub actif
- ✅ Compte Render.com (gratuit: https://render.com)
- ✅ Credentials Neon PostgreSQL configurées
- ✅ Repository pushé sur GitHub

## Étapes de Déploiement

### 1️⃣ Créer un Service Web sur Render

1. Connectez-vous à [Render.com](https://render.com)
2. Cliquez sur **"New +"** → **"Web Service"**
3. Sélectionnez **"Connect a GitHub repository"**
4. Autorisez Render à accéder à votre compte GitHub
5. Sélectionnez le repository: `backend-ista-goma`
6. Cliquez sur **"Connect"**

### 2️⃣ Configurer le Service Web

#### Paramètres Généraux
- **Name**: `istag-oma-backend`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` *(le plus proche de la RDC)*
- **Branch**: `master`

#### Build & Start Commands
```bash
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

#### Plan
- Recommandé: **Starter** ($7/mois) pour commencer
- Peut être upgradé à tout moment

### 3️⃣ Configuration des Variables d'Environnement

Dans le formulaire Render, sous **"Environment"**, ajouter:

```env
NODE_ENV=production
PORT=3000
API_PREFIX=api
API_VERSION=1

DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_SlPUM8c7CbOD@ep-falling-frog-ap9vb20i.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DATABASE_URL=postgresql://neondb_owner:npg_SlPUM8c7CbOD@ep-falling-frog-ap9vb20i.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=changez_cette_valeur_en_string_aleatoire_long_en_production
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=changez_cette_valeur_en_string_aleatoire_long_en_production
JWT_REFRESH_EXPIRATION=7d

CORS_ORIGIN=*
CORS_CREDENTIALS=true

LOG_LEVEL=info
```

⚠️ **IMPORTANT**: Changez les `JWT_SECRET` et `JWT_REFRESH_SECRET` par des valeurs sécurisées!

Générez une clé sécurisée:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4️⃣ Déployer le Service

1. Cliquez sur **"Create Web Service"**
2. Render commencera le build automatiquement
3. Attendez que le statut passe de **"Building"** à **"Live"** (5-10 min)
4. Votre URL sera: `https://istag-oma-backend.onrender.com`

### 5️⃣ Vérifier le Déploiement

```bash
# Testez l'API
curl https://istag-oma-backend.onrender.com/api/health

# Consultez la documentation Swagger
https://istag-oma-backend.onrender.com/docs
```

## Déploiements Futurs

Désormais, chaque push sur `master` déclenche un redéploiement automatique:

```bash
# Pour déployer une nouvelle version
git add .
git commit -m "Feature: Add new endpoint"
git push origin master

# Render détecte le changement et redéploie automatiquement
# Vérifiez le statut dans le dashboard Render
```

## Problèmes Courants & Solutions

### ❌ Erreur: "Cannot find module 'xxx'"
**Solution**: Les dépendances ne sont pas installées
```bash
# Sur votre machine locale:
npm install
npm run build
git push origin master
# Render réessayera avec npm install frais
```

### ❌ Erreur: "Database connection failed"
**Solution**: Vérifiez les credentials Neon
```bash
# Testez la connexion localement:
psql "postgresql://neondb_owner:npg_SlPUM8c7CbOD@ep-falling-frog-ap9vb20i.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### ❌ Service s'arrête immédiatement après le démarrage
**Solution**: Vérifiez les logs dans Render
- Dashboard → Logs
- Cherchez les erreurs TypeORM
- Assurez-vous que le database.module.ts initialise correctement

### ❌ Swagger Documentation non accessible
**Solution**: Vérifiez main.ts
- setupSwagger() doit être appelé dans NestFactory.create()
- Visitez: `https://votre-url/docs`

### ⚠️ Build trop lent (>15 min)
**Solution**: Render a un timeout de build à 45 min
- Assurez-vous que package.json n'a pas de scripts de build lourds
- Supprimez les dépendances non utilisées
- Vérifiez que dist/ et node_modules/ sont dans .gitignore

## Monitoring & Maintenance

### Logs en Temps Réel
Dashboard Render → **Logs** (mise à jour automatique)

### Metrics
Dashboard Render → **Metrics** (CPU, Mémoire, Requêtes)

### Redémarrage Manual
Dashboard Render → **"Restart"** (utile si le service gèle)

### Mise à Jour des Variables d'Environnement
1. Dashboard Render → **"Environment"**
2. Modifiez les variables
3. Cliquez **"Save"** (le service redémarre automatiquement)

## Sécurité - Checklist Pré-Production

- [ ] JWT_SECRET changé et complexe (32+ caractères)
- [ ] JWT_REFRESH_SECRET changé et complexe
- [ ] NODE_ENV = "production"
- [ ] LOG_LEVEL = "info" (pas "debug")
- [ ] CORS_ORIGIN configuré correctement (pas "*" en production)
- [ ] Database credentials vérifiées dans Neon dashboard
- [ ] Backups Neon activés (Settings → Backups)
- [ ] SSL/TLS forcé dans la chaîne de connexion Neon
- [ ] Plans Render configurés à "Standard" pour la production

## Redimensionnement Futur

Si le trafic augmente:

### Option 1: Upgrade Render Plan
- Dashboard Render → **"Plan"**
- Choisir "Standard" ou "Pro"
- Déploiement automatique sur meilleur matériel

### Option 2: Ajouter une Base de Données Render
- Render supporte PostgreSQL manage (optionnel)
- Mais Neon est plus performant pour ce cas

### Option 3: Mise en Cache avec Redis
- Ajouter Redis à Render ($5/mois)
- Configurer cache dans NestJS pour les endpoints de lectures

## Support & Documentation

- **Render Docs**: https://render.com/docs
- **NestJS Docs**: https://docs.nestjs.com
- **Neon Docs**: https://neon.tech/docs
- **Discord Render**: https://discord.gg/render

---

**Votre Application Live**: `https://istag-oma-backend.onrender.com`

**Date de déploiement**: 2024
**Statut**: ✅ Production Ready
