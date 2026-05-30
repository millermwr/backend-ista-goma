#!/bin/bash
# Script de vérification de la configuration du Backend ISTAG Oma

echo "🔍 Vérification de la configuration du backend..."
echo "=================================================="

# Vérification des fichiers essentiels
echo -e "\n📁 Vérification des fichiers..."

files=(
  ".env"
  ".env.example"
  "package.json"
  "tsconfig.json"
  "nest-cli.json"
  "render.yaml"
  "DEPLOY_RENDER.md"
  "src/main.ts"
  "src/app.module.ts"
  "src/database/database.module.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (MANQUANT)"
  fi
done

# Vérification de Node.js et npm
echo -e "\n🔧 Vérification des outils..."

if command -v node &> /dev/null; then
  echo "✅ Node.js: $(node --version)"
else
  echo "❌ Node.js non installé"
fi

if command -v npm &> /dev/null; then
  echo "✅ npm: $(npm --version)"
else
  echo "❌ npm non installé"
fi

# Vérification de git
if command -v git &> /dev/null; then
  echo "✅ Git: $(git --version)"
  echo "   Remote: $(git remote get-url origin)"
  echo "   Branch: $(git branch --show-current)"
else
  echo "❌ Git non installé"
fi

# Vérification de la structure du projet
echo -e "\n📦 Vérification des modules NestJS..."

modules=(
  "src/modules/auth"
  "src/modules/students"
  "src/modules/academics"
  "src/modules/grades"
  "src/modules/payments"
  "src/modules/employees"
  "src/modules/reports"
  "src/modules/users"
)

for module in "${modules[@]}"; do
  if [ -d "$module" ]; then
    echo "✅ $module"
  else
    echo "❌ $module (MANQUANT)"
  fi
done

# Vérification du .env
echo -e "\n🔑 Vérification des variables d'environnement..."

if grep -q "DATABASE_URL_UNPOOLED" .env 2>/dev/null; then
  echo "✅ DATABASE_URL_UNPOOLED configurée"
else
  echo "❌ DATABASE_URL_UNPOOLED manquante"
fi

if grep -q "JWT_SECRET" .env 2>/dev/null; then
  echo "✅ JWT_SECRET configuré"
else
  echo "❌ JWT_SECRET manquant"
fi

# Vérification du package.json
echo -e "\n📜 Vérification des scripts npm..."

if grep -q '"start:dev"' package.json 2>/dev/null; then
  echo "✅ Script: npm run start:dev"
else
  echo "❌ Script start:dev manquant"
fi

if grep -q '"build"' package.json 2>/dev/null; then
  echo "✅ Script: npm run build"
else
  echo "❌ Script build manquant"
fi

if grep -q '"start:prod"' package.json 2>/dev/null; then
  echo "✅ Script: npm run start:prod"
else
  echo "❌ Script start:prod manquant"
fi

echo -e "\n=================================================="
echo "✅ Vérification terminée!"
echo -e "\n📖 Prochaines étapes:"
echo "1. npm install"
echo "2. npm run build"
echo "3. npm run start:dev (développement) ou npm run start:prod (production)"
echo "4. Visitez http://localhost:3000/docs pour la documentation Swagger"
echo -e "\n🌐 Pour Render:"
echo "1. Visitez https://render.com"
echo "2. Créez un nouveau Web Service"
echo "3. Connectez votre repository GitHub"
echo "4. Configurez les variables d'environnement"
echo "5. Déployez!"
