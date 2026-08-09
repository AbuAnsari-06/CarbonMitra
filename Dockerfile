# Stage 1: Build Vite React Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci || npm install

# Copy source code
COPY . .

# Build Vite static bundle
RUN npm run build

# Stage 2: Serve with Production-Grade Nginx
FROM nginx:alpine AS runner

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (gzip, caching, SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
