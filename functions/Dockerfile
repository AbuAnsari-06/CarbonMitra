# Dockerfile for Local Testing of Firebase Functions & Firestore Emulator Suite
FROM node:20-alpine

# Install Java Runtime Environment required for Firebase Emulators
RUN apk add --no-cache openjdk17-jre bash curl

# Install Firebase CLI globally
RUN npm install -g firebase-tools

WORKDIR /app

# Copy root and functions package definitions
COPY package*.json ./
COPY functions/package*.json ./functions/

# Install root & functions dependencies
RUN npm install
WORKDIR /app/functions
RUN npm install

WORKDIR /app
COPY . .

# Build functions TypeScript code
WORKDIR /app/functions
RUN npm run build

WORKDIR /app

# Expose Firebase Emulator ports
# 4000: Emulator Suite UI, 5001: Functions, 8080: Firestore
EXPOSE 4000 5001 8080

CMD ["firebase", "emulators:start", "--only", "functions,firestore", "--host", "0.0.0.0"]
