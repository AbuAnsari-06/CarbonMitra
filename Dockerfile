# Stage 1: Build Application (Frontend & Express Server)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci || npm install

# Copy source code
COPY . .

# Build Vite static bundle and Express server bundle
RUN npm run build

# Stage 2: Serve with Node.js Server
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency definitions and install production dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy built dist from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

CMD ["node", "dist/server.cjs"]
