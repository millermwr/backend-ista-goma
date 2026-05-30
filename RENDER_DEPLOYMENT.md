# 🚀 Déploiement sur Render

## 📋 Configuration Render pour ISTAG Oma Backend API

Ce guide explique comment déployer le backend NestJS sur Render.com.

### ✅ Prérequis

- Compte Render: https://render.com (gratuit)
- Compte GitHub avec ce repository clonné
- Database Neon déjà configurée

---

## 🔧 Étapes de Déploiement

### Étape 1: Connecter GitHub à Render

1. Aller sur https://dashboard.render.com
2. Cliquer sur **"New +"** → **"Web Service"**
3. Connecter votre GitHub: `millermwr/backend-ista-goma.git`
4. Autoriser l'accès au repository

### Étape 2: Configuration du Service

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run start:prod
```

**Runtime:** Node

**Plan:** Free (ou Starter)

### Étape 3: Variables d'Environnement

Ajouter dans Render Dashboard:

```env
NODE_ENV=production
APP_PORT=3000
APP_HOST=0.0.0.0
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_SlPUM8c7CbOD@ep-falling-frog-ap9vb20i.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DATABASE_URL=postgresql://neondb_owner:npg_SlPUM8c7CbOD@ep-falling-frog-ap9vb20i.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_very_secure_secret_key_here_change_this
JWT_REFRESH_SECRET=your_very_secure_refresh_key_here_change_this
CORS_ORIGIN=*
LOG_LEVEL=info
```

### Étape 4: Déployer

1. Cliquer **"Deploy"**
2. Attendre le build (2-3 minutes)
3. Vérifier les logs
4. Accéder à: `https://your-service-name.onrender.com`

---

## 🧪 Vérifier le Déploiement

```bash
# Test health check
curl https://your-service-name.onrender.com/status

# Test API docs
https://your-service-name.onrender.com/api/docs
```

**Réponse attendue:**
```json
{
  "status": "operational",
  "version": "1.0.0",
  "timestamp": "2024-05-30T..."
}
```

---

## 🔐 Sécurité

⚠️ **IMPORTANT:** Changer les secrets JWT en production!

1. Générer nouvelles clés:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Mettre à jour dans Render Dashboard:
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`

---

## 📊 Monitoring sur Render

- **Logs:** Dashboard Render → Logs tab
- **Metrics:** Dashboard Render → Metrics tab
- **Uptime:** Render gère automatiquement
- **Restarts:** Auto-restart on crash

---

## 🐛 Dépannage

### Service ne démarre pas
```
→ Vérifier DATABASE_URL est correct
→ Vérifier NODE_ENV=production
→ Voir logs: Dashboard → Logs
```

### Erreur de connexion BD
```
→ Vérifier DATABASE_URL_UNPOOLED
→ Vérifier credentials Neon
→ Vérifier SSL certificates
```

### Endpoints retournent 500
```
→ Vérifier JWT_SECRET
→ Vérifier CORS_ORIGIN
→ Voir logs détaillés
```

---

## 🔄 Redéployer

**Après un commit:**
1. Push vers GitHub (automatique)
2. Render détecte et redéploie
3. Voir progression dans logs

**Manual redeploy:**
1. Dashboard Render
2. Click "Manual Deploy"
3. Select latest commit

---

## 📈 Scaling (Optionnel)

Pour passer au plan payant:
1. Dashboard Render → Plan
2. Sélectionner Starter ($7/mois)
3. Meilleure performance et stockage

---

## 🎯 URLs Utiles

| Service | URL |
|---------|-----|
| API Health | `https://your-service.onrender.com/status` |
| Swagger Docs | `https://your-service.onrender.com/api/docs` |
| Backend Root | `https://your-service.onrender.com` |
| GitHub Repo | https://github.com/millermwr/backend-ista-goma |

---

## ✅ Checklist Déploiement

- [ ] GitHub connected
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm run start:prod`
- [ ] DATABASE_URL configurée
- [ ] JWT secrets générés & changés
- [ ] CORS_ORIGIN = *
- [ ] Service démarré avec succès
- [ ] Health check répond
- [ ] Swagger docs accessible
- [ ] Logs visibles dans Render

---

**Déploiement réussi ! 🚀 Votre API est en ligne !**

Pour les questions: dev@istagoma.ac.cd
