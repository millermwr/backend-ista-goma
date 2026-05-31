# 🚀 Guide Complet: Déployer le Backend sur Render.com

## ✅ Checklist Avant de Commencer

Vous devez avoir:
- [x] Repository GitHub pushé: https://github.com/millermwr/backend-ista-goma
- [x] Compte Render.com créé (gratuit sur https://render.com)
- [x] Credentials Neon disponibles dans `.env`
- [x] Backend prêt localement (`npm install` et `npm run build` fonctionnent)

---

## 📋 ÉTAPE 1: Préparer les Credentials

### 1.1 - Générer des JWT Secrets Sécurisés

**⚠️ IMPORTANT**: Les secrets actuels dans `.env` sont des placeholders. Vous devez en générer des nouveaux!

Exécutez cette commande **2 fois** pour générer 2 clés de 32 caractères:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Résultat attendu:**
```
a3f8e9d2c1b4f5e8a7d9c2b5f8a3d1e4c7b9f2a5d8e1b4c7a9f2d5e8b1a4
```

**Sauvegardez:**
- 1ère clé → `JWT_SECRET`
- 2ème clé → `JWT_REFRESH_SECRET`

### 1.2 - Vérifier les Credentials Neon

Dans votre `.env` local, vous devez avoir:

```env
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_SlPUM8c7CbOD@ep-falling-frog-ap9vb20i.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DATABASE_URL="postgresql://neondb_owner:npg_SlPUM8c7CbOD@ep-falling-frog-ap9vb20i.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**✅ Déjà configuré dans votre `.env`**

---

## 🌐 ÉTAPE 2: Connecter à Render.com

### 2.1 - Créer un Compte Render (si nécessaire)

1. Allez à: https://render.com
2. Cliquez **"Sign up"**
3. Connectez-vous avec GitHub
4. Autorisez Render à accéder à votre compte GitHub

### 2.2 - Login au Dashboard

1. Allez à: https://dashboard.render.com
2. Connectez-vous avec vos credentials

---

## 🏗️ ÉTAPE 3: Créer un Web Service

### 3.1 - Commencer une Nouvelle Deployment

1. **Dans le Dashboard Render:**
   - Cliquez le bouton **"New +"** en haut à gauche
   - Sélectionnez **"Web Service"**

### 3.2 - Connecter GitHub Repository

1. **Sélectionnez "Connect a GitHub repository"**
2. **Autorisez Render:**
   - Une fenêtre popup demande l'accès
   - Cliquez **"Authorize"**
3. **Recherchez votre repository:**
   - Tapez: `backend-ista-goma`
   - Ou: `millermwr/backend-ista-goma`
   - Sélectionnez-le dans la liste

### 3.3 - Configuration du Service

Remplissez les champs suivants:

| Champ | Valeur |
|-------|--------|
| **Name** | `istag-oma-backend` |
| **Environment** | `Node` |
| **Region** | `Oregon (US West)` |
| **Branch** | `master` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Plan** | `Free` ou `Starter` ($7/mois) |

**Explications:**
- **Name**: Nom visible dans Render (ex: istag-oma-backend)
- **Environment**: Langage Node.js
- **Region**: Oregon est le plus proche de la RDC
- **Branch**: master = branche principale
- **Build**: Installe dépendances et compile
- **Start**: Lance le serveur de production

---

## 🔐 ÉTAPE 4: Ajouter les Variables d'Environnement

### 4.1 - Ouvrir la Section Variables

1. **Dans le formulaire Render**, cherchez la section **"Environment"**
2. Cliquez **"Add Environment Variable"**

### 4.2 - Ajouter TOUTES les Variables

Copiez-collez chaque paire clé=valeur:

```env
NODE_ENV=production
PORT=3000
API_PREFIX=api
API_VERSION=v1

DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_SlPUM8c7CbOD@ep-falling-frog-ap9vb20i.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DATABASE_URL=postgresql://neondb_owner:npg_SlPUM8c7CbOD@ep-falling-frog-ap9vb20i.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=<COLLEZ_LA_1ERE_CLE_GENEREE>
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=<COLLEZ_LA_2E_CLE_GENEREE>
JWT_REFRESH_EXPIRATION=7d

CORS_ORIGIN=*
CORS_CREDENTIALS=true

LOG_LEVEL=info
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
```

**✅ Important:**
- Ne gardez PAS les valeurs placeholder pour JWT_SECRET
- Remplacez avec les clés générées à l'étape 1.1

### 4.3 - Exemple de Variables Complètes

```
NODE_ENV                    production
PORT                        3000
API_PREFIX                  api
API_VERSION                 v1
DATABASE_URL_UNPOOLED       postgresql://neondb_owner:npg_SlPUM8c7CbOD@...
DATABASE_URL                postgresql://neondb_owner:npg_SlPUM8c7CbOD@...
JWT_SECRET                  a3f8e9d2c1b4f5e8a7d9c2b5f8a3d1e4c7b9f2a5d8e1b4c7a9f2d5e8b1a4
JWT_EXPIRATION              24h
JWT_REFRESH_SECRET          b4f9e1d3c2a5e8b1c7f9a2d5e8b1c4f7a3d6e9b2c5f8a1d4e7b9c2f5a8d1
JWT_REFRESH_EXPIRATION      7d
CORS_ORIGIN                 *
CORS_CREDENTIALS            true
LOG_LEVEL                   info
```

---

## 🚀 ÉTAPE 5: Déployer

### 5.1 - Lancer le Déploiement

1. **Vérifiez les paramètres:**
   - Name: istag-oma-backend ✅
   - Environment: Node ✅
   - Region: Oregon ✅
   - Build Command: npm install && npm run build ✅
   - Start Command: npm run start:prod ✅
   - Variables d'environnement: Complètes ✅

2. **Cliquez: "Create Web Service"**

### 5.2 - Monitoring du Build

1. **Render commence le build:**
   - Vous verrez une page "Building..."
   - Des logs s'affichent en temps réel
   - Cela prend 5-10 minutes

2. **Logs attendus:**
   ```
   # Build phase (2-3 min)
   npm notice fetching dependencies...
   npm notice installed X packages...
   Building NestJS application...
   
   # Deploy phase (1-2 min)
   Build complete
   Starting server...
   App listening on port 3000 ✓
   Database connected ✓
   ```

3. **Une fois terminé:**
   - Statut change de "Building" → "Live"
   - Vous recevez une URL publique

---

## ✅ ÉTAPE 6: Vérifier le Déploiement

### 6.1 - Trouver votre URL publique

**Dans le Dashboard Render:**
- Vous verrez une URL comme: `https://istag-oma-backend.onrender.com`
- **Sauvegardez cette URL!** Vous l'utiliserez pour les apps mobiles/desktop

### 6.2 - Tester le Health Check

Ouvrez votre navigateur ou terminal:

```bash
curl https://istag-oma-backend.onrender.com/api/health
```

**Résultat attendu:**
```json
{
  "status": "ok",
  "timestamp": "2024-05-31T15:00:00Z"
}
```

### 6.3 - Tester la Swagger Documentation

Ouvrez dans votre navigateur:
```
https://istag-oma-backend.onrender.com/api/docs
```

Vous devez voir la documentation interactive de l'API.

### 6.4 - Tester le Login

```bash
curl -X POST https://istag-oma-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@istagoma.ac.cd",
    "password": "Admin@2024"
  }'
```

**Résultat attendu:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "admin@istagoma.ac.cd",
    "userType": "ADMIN"
  }
}
```

---

## 📱 ÉTAPE 7: Configurer les Applications (Mobile + Desktop)

### 7.1 - Mettre à Jour l'URL de l'API

**Dans app-mobile-gluon:**
- Fichier: `src/main/java/com/istagoma/config/ApiConfig.java`
- Cherchez: `API_BASE_URL`
- Changez: `http://localhost:3000` → `https://istag-oma-backend.onrender.com`

**Exemple:**
```java
public class ApiConfig {
    public static final String API_BASE_URL = "https://istag-oma-backend.onrender.com/api/v1";
    // ...
}
```

**Dans app-desktop-javafx:**
- Fichier: `src/main/resources/config.properties`
- Cherchez: `api.url`
- Changez: `http://localhost:3000` → `https://istag-oma-backend.onrender.com`

**Exemple:**
```properties
api.url=https://istag-oma-backend.onrender.com/api/v1
```

### 7.2 - Rebuilder les Applications

```bash
# Mobile
cd app-mobile-gluon
mvn clean install
mvn javafx:run

# Desktop
cd app-desktop-javafx
mvn clean install
mvn javafx:run
```

---

## 🔔 ÉTAPE 8: Gestion Continue

### 8.1 - Auto-Deployment

Désormais, **chaque push sur GitHub déclenche automatiquement un redéploiement**:

```bash
# Développer localement
git add .
git commit -m "Feature: Add new endpoint"
git push origin master

# Render détecte le changement et redéploie automatiquement (5-10 min)
```

### 8.2 - Monitorer l'Application

**Dans le Dashboard Render:**
- **Logs**: Dashboard → Logs (voir les erreurs en temps réel)
- **Metrics**: Dashboard → Metrics (CPU, Mémoire, Requêtes)
- **Redémarrer**: Dashboard → "Restart" (si le service gèle)

### 8.3 - Mettre à Jour les Variables d'Environnement

1. Dashboard → Select service → **Settings**
2. Sous "Environment", modifiez la variable
3. Cliquez **"Save"** (le service redémarre automatiquement)

---

## ⚠️ Troubleshooting

### ❌ Erreur: "Build failed"

**Cause**: Erreur de compilation ou dépendances manquantes

```bash
# Solution: Vérifier localement d'abord
npm install
npm run build
```

Si ça fonctionne localement mais pas sur Render:
- Vérifier `.gitignore` (ne commit pas `node_modules`)
- Vérifier que package.json est à jour
- Voir les logs Render pour plus de détails

### ❌ Erreur: "Cannot connect to database"

**Cause**: Credentials Neon incorrects ou réseau

```bash
# Vérifier localement
psql "postgresql://neondb_owner:npg_SlPUM8c7CbOD@ep-falling-frog-ap9vb20i.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

Si ça fonctionne localement:
- Vérifier DATABASE_URL dans Render
- Vérifier que Neon est accessible de partout (vérifier IP whitelist)

### ❌ Service arrête après 2 minutes

**Cause**: L'app crash au démarrage

**Solution**: Vérifier les logs Render
```
Dashboard → Logs → Chercher "Error" ou "Crash"
```

### ❌ "Free" plan arrête après 15 min d'inactivité

**Si vous avez un plan Free:**
- Le service s'arrête après 15 minutes sans requête
- **Solution**: Upgrade à "Starter" ($7/mois) pour service toujours actif

---

## 🎯 Résumé des URLs Importantes

| Service | URL |
|---------|-----|
| **Dashboard Render** | https://dashboard.render.com |
| **Votre Backend** | https://istag-oma-backend.onrender.com |
| **API Documentation** | https://istag-oma-backend.onrender.com/api/docs |
| **Health Check** | https://istag-oma-backend.onrender.com/api/health |
| **GitHub Repo** | https://github.com/millermwr/backend-ista-goma |
| **Neon Console** | https://console.neon.tech |

---

## ✨ Checklist Finale

- [ ] JWT secrets générés (étape 1.1)
- [ ] Render.com compte créé
- [ ] Repository GitHub connecté à Render
- [ ] Web Service créé avec configuration
- [ ] Variables d'environnement ajoutées
- [ ] Build succès (status "Live")
- [ ] Health check répond (200 OK)
- [ ] Swagger docs accessible
- [ ] Login endpoint fonctionne
- [ ] JWT secrets configurés (pas placeholders)
- [ ] CORS configuré pour production
- [ ] Mobile/Desktop apps configurées avec nouvelle URL
- [ ] Vérifiée: données de l'API s'affichent dans apps

---

## 🚀 Vous êtes Prêt!

Votre backend est maintenant:
- ✅ Déployé sur Render.com
- ✅ Accessible publiquement
- ✅ Connecté à Neon PostgreSQL
- ✅ Prêt pour les applications mobiles/desktop
- ✅ Auto-déployé avec chaque push GitHub

**Durée totale: 15-20 minutes**

Questions? Consultez:
- Documentation Render: https://render.com/docs
- Documentation NestJS: https://docs.nestjs.com
- Documentation Neon: https://neon.tech/docs
