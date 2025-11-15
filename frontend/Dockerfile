FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente
COPY . .

# Build de Next.js
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Comando de producción
CMD ["npm", "start"]
