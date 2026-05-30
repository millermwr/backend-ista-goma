FROM node:18-alpine

WORKDIR /app

# Copier package.json et package-lock.json
COPY backend-nestjs/package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY backend-nestjs/src ./src
COPY backend-nestjs/tsconfig.json ./

# Build
RUN npm run build

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start:prod"]
