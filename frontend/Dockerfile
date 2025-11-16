FROM node:20-alpine

WORKDIR /app

# Aceptar ARG para API URL en build time
# Default: localhost para desarrollo local
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Convertir ARG a ENV variable para que Next.js lo use en el build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente
COPY . .

# Build de Next.js con variable de entorno disponible
RUN NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL npm run build

# Exponer puerto
EXPOSE 3001

# Comando de producción
CMD ["npm", "start"]
