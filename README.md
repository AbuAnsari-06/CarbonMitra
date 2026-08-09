# CarbonMitra (dMRV & Carbon Credit Marketplace)

> **Satellite-Driven Direct Measurement, Reporting, and Verification (dMRV) & Polygon Blockchain Carbon Credit Marketplace for Indian Smallholder Agriculture.**

CarbonMitra empowers Indian farmers to tokenize verified soil carbon sequestration into transparent, ERC-20 compliant Carbon Credits on the Polygon Amoy testnet. By combining high-resolution **Sentinel-2 L2A Multispectral Satellite Imagery** (Normalized Difference Vegetation Index - NDVI), **Gemini 2.5 Flash Agronomic AI**, and automated **Smart Contracts**, CarbonMitra removes corporate greenwashing and unlocks direct climate finance for rural agrarian communities.

---

## 🏗️ Architecture Overview

```
                          ┌────────────────────────────────────────┐
                          │         CarbonMitra React UI           │
                          │   (Tailwind CSS + Leaflet GIS Map)     │
                          └───────────────────┬────────────────────┘
                                              │ REST API Calls
                                              ▼
                          ┌────────────────────────────────────────┐
                          │         Express / Cloud Functions      │
                          │         API Backend (TypeScript)       │
                          └──────┬─────────────────┬───────────────┘
                                 │                 │
         ┌───────────────────────┘                 └───────────────────────┐
         ▼                                                                 ▼
┌─────────────────────────────────┐                               ┌─────────────────────────────────┐
│     Sentinel Hub L2A API        │                               │    Polygon Amoy Testnet RPC     │
│ (B04 Red, B08 NIR Satellite)    │                               │ (CarbonCredit Smart Contract)   │
└─────────────────────────────────┘                               └─────────────────────────────────┘
         │                                                                 │
         ▼                                                                 ▼
┌─────────────────────────────────┐                               ┌─────────────────────────────────┐
│     Gemini 2.5 AI Advisor       │                               │     Firestore / Memory Store    │
│ (Agronomic Yield Analysis)      │                               │ (Farmland & Transaction Ledger) │
└─────────────────────────────────┘                               └─────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript (Strict Mode), Tailwind CSS, Lucide React, Motion, Leaflet GIS
- **Backend**: Node.js, Express, Firebase Cloud Functions (TypeScript), GCP Secret Manager
- **Remote Sensing / Earth Observation**: Sentinel Hub API (Sentinel-2 L2A Multispectral - Band 4 Red, Band 8 Near Infrared)
- **AI / Machine Learning**: Google GenAI SDK (`@google/genai`) with Gemini 2.5 Flash
- **Blockchain & Smart Contracts**: Solidity v0.8.20, Hardhat, Polygon Amoy Testnet, Ethers.js
- **Persistence & Auditing**: Firebase Firestore, In-Memory Rate-Limiter & TTL Cache Engine

---

## ⚙️ Setup & Installation Instructions

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Hardhat (`npm install -g hardhat`)

### 1. Clone & Install Dependencies
```bash
# Clone repository
git clone https://github.com/carbonmitra/carbonmitra.git
cd carbonmitra

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# Gemini API Key for Agronomic AI Insights
GEMINI_API_KEY=your_gemini_api_key_here

# Sentinel Hub OAuth Credentials (for Live Satellite Data)
SENTINEL_HUB_CLIENT_ID=your_sentinel_hub_client_id
SENTINEL_HUB_CLIENT_SECRET=your_sentinel_hub_client_secret

# Polygon Amoy Testnet & Contract Configuration
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
CARBON_CREDIT_CONTRACT_ADDRESS=0x948123A1B2C3D4e5f6A7B8C9D0E1f2A3B4C5D6E7
BACKEND_WALLET_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
POLYGON_SCAN_AMOY_BASE=https://amoy.polygonscan.com

# Firebase / GCP Project Configuration
FIREBASE_PROJECT_ID=carbonmitra-app
GCP_PROJECT_ID=carbonmitra-app
SECRET_MANAGER_WALLET_KEY_NAME=BACKEND_WALLET_PRIVATE_KEY
```

---

## 📜 Smart Contract Deployment (Polygon Amoy)

The Solidity contract `CarbonCredit.sol` handles credit minting, ownership transfers, and audit record verification.

### Compile Contract
```bash
npx hardhat compile
```

### Deploy to Polygon Amoy Testnet
```bash
npx hardhat run scripts/deploy.ts --network polygonAmoy
```

After deployment, update `CARBON_CREDIT_CONTRACT_ADDRESS` in `.env` with the outputted contract address.

---

## ⚡ Running the Application Locally

```bash
# Start Vite Frontend + Express API Server in Development
npm run dev

# Lint & Type Check (Strict Mode)
npm run lint

# Build for Production
npm run build
```

The application runs at `http://localhost:3000`.

---

## 🚀 Docker & Deployment Setup

### 1. Production Frontend Docker Container
The frontend is containerized using a multi-stage Docker build that compiles the Vite React application and serves static assets via an optimized Nginx server with gzip compression, security headers, and static asset caching.

```bash
# Build production Docker image
docker build -t carbonmitra-frontend .

# Run container on port 3000
docker run -d -p 3000:3000 --name carbonmitra-app carbonmitra-frontend
```

### 2. Local Firebase Functions Emulator Container
Cloud Functions are deployed via the Firebase CLI (`firebase deploy --only functions`), but a Docker container is provided for local testing of the Functions & Firestore emulator suite:

```bash
# Build and run Functions Emulator container
docker build -t carbonmitra-functions -f functions/Dockerfile .
docker run -p 4000:4000 -p 5001:5001 -p 8080:8080 carbonmitra-functions
```

---

## 📋 Pre-Deployment Checklist

Before deploying CarbonMitra to production, complete the following steps:

- [ ] **1. Firebase Functions Configuration / GCP Secret Manager**
  Set secrets and API keys in Firebase environment config or GCP Secret Manager:
  ```bash
  firebase functions:config:set \
    gemini.key="$GEMINI_API_KEY" \
    sentinel.client_id="$SENTINEL_HUB_CLIENT_ID" \
    sentinel.client_secret="$SENTINEL_HUB_CLIENT_SECRET" \
    polygon.rpc_url="$POLYGON_AMOY_RPC_URL" \
    polygon.contract_address="$CARBON_CREDIT_CONTRACT_ADDRESS"
  ```
- [ ] **2. Deploy Firestore Indexes**
  Deploy composite indexes for farmlands, carbon estimates, and marketplace listings:
  ```bash
  firebase deploy --only firestore:indexes
  ```
- [ ] **3. Deploy Security Rules**
  Deploy security rules to enforce authorization for land registration, credit minting, and transactions:
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] **4. Verify Polygon Amoy Smart Contract**
  Verify the contract source code on PolygonScan to enable public contract interaction and event auditing:
  ```bash
  npx hardhat verify --network polygonAmoy $CARBON_CREDIT_CONTRACT_ADDRESS
  ```
- [ ] **5. Deploy Cloud Functions**
  Deploy backend endpoints to Firebase Functions:
  ```bash
  firebase deploy --only functions
  ```

---

## 🔬 What’s Real vs. Production Simulation

| Feature / Component | Prototype / Demo Mode | Production Implementation |
| :--- | :--- | :--- |
| **Sentinel Satellite API** | Live call attempt to Sentinel Hub API; falls back gracefully to a high-resolution spatial coordinate biomass signature model if API quota is unconfigured. | Direct OAuth2 token handshake + Process API float32 GeoTIFF streaming with cloud masking (`SCL` classification bands). |
| **Polygon Blockchain Relay** | Generates verifiable transaction hashes and testnet token IDs using deterministic atomic nonces. | Fully signed transactions via Google Cloud Key Management Service (KMS) or hardware security modules (HSM). |
| **Farmer Rate Limiting** | In-memory 10 calls/day per farmer profile + 1-hour memory cache + 30-day estimate ledger. | Distributed Redis cluster + Firebase Firestore atomic document counters. |
| **AI Advisor Engine** | Server-side Gemini 2.5 Flash prompt generating structured JSON agronomic & carbon sequestration recommendations. | Production Gemini 2.5 Pro fine-tuned model with historical regional soil dataset grounding. |
| **User Authentication** | Instant single-click role switching (Farmer, Corporate Buyer, Auditor) with predefined profile contexts. | Firebase Authentication with multi-factor auth (MFA), biometric passkeys, and Aadhaar-linked farmer KYC. |

---

## 🛡️ License

Distributed under the Apache 2.0 License. See `LICENSE` for details.
