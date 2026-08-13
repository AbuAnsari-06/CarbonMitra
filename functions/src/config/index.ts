import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import dotenv from "dotenv";

dotenv.config();

/**
 * Approximate/demo exchange rate (1 USD ~ 80 INR) used for currency display & estimation.
 * NOTE: This is a static approximate rate for demo/testing purposes.
 */
export const APPROX_INR_PER_USD = 80;

/**
 * Interface representing all validated backend configuration options.
 */
export interface BackendConfig {
  geminiApiKey?: string;
  sentinelHubClientId?: string;
  sentinelHubClientSecret?: string;
  polygonAmoyRpcUrl: string;
  carbonCreditContractAddress: string;
  firebaseProjectId?: string;
  gcpProjectId?: string;
  secretManagerWalletKeyName?: string;
  approxInrPerUsd: number;
}

let secretManagerClient: SecretManagerServiceClient | null = null;
let cachedPrivateKey: string | null = null;

/**
 * Validates that required environment variables are present.
 */
export function validateAndGetConfig(options: { isStrict?: boolean } = {}): BackendConfig {
  const { isStrict = false } = options;

  const config: BackendConfig = {
    geminiApiKey: process.env.GEMINI_API_KEY,
    sentinelHubClientId: process.env.SENTINEL_HUB_CLIENT_ID,
    sentinelHubClientSecret: process.env.SENTINEL_HUB_CLIENT_SECRET,
    polygonAmoyRpcUrl: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
    carbonCreditContractAddress: process.env.CARBON_CREDIT_CONTRACT_ADDRESS || "0x948123A1B2C3D4e5f6A7B8C9D0E1f2A3B4C5D6E7",
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT_ID,
    gcpProjectId: process.env.GCP_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    secretManagerWalletKeyName: process.env.SECRET_MANAGER_WALLET_KEY_NAME || "BACKEND_WALLET_PRIVATE_KEY",
    approxInrPerUsd: APPROX_INR_PER_USD,
  };

  const missingVars: string[] = [];

  if (isStrict) {
    if (!config.sentinelHubClientId || config.sentinelHubClientId === "your_sentinel_hub_client_id") {
      missingVars.push("SENTINEL_HUB_CLIENT_ID");
    }
    if (!config.sentinelHubClientSecret || config.sentinelHubClientSecret === "your_sentinel_hub_client_secret") {
      missingVars.push("SENTINEL_HUB_CLIENT_SECRET");
    }
    if (!config.polygonAmoyRpcUrl) {
      missingVars.push("POLYGON_AMOY_RPC_URL");
    }
    if (!config.carbonCreditContractAddress) {
      missingVars.push("CARBON_CREDIT_CONTRACT_ADDRESS");
    }

    if (missingVars.length > 0) {
      throw new Error(
        `[Config Error] Missing required backend environment variable(s): ${missingVars.join(", ")}. ` +
        `Please configure them in your environment or .env file.`
      );
    }
  }

  return config;
}

/**
 * PRODUCTION BEST PRACTICE:
 * Fetches the backend wallet private key at function cold start from Google Cloud Secret Manager.
 */
export async function getBackendWalletPrivateKey(): Promise<string> {
  if (cachedPrivateKey) {
    return cachedPrivateKey;
  }

  const projectId = process.env.GCP_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const secretName = process.env.SECRET_MANAGER_WALLET_KEY_NAME || "BACKEND_WALLET_PRIVATE_KEY";

  if (projectId && process.env.NODE_ENV === "production") {
    try {
      if (!secretManagerClient) {
        secretManagerClient = new SecretManagerServiceClient();
      }
      
      const secretResourceName = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      console.log(`[Secret Manager] Accessing cold-start secret version: ${secretResourceName}`);
      
      const [version] = await secretManagerClient.accessSecretVersion({
        name: secretResourceName,
      });

      const payload = version.payload?.data?.toString();
      if (payload) {
        cachedPrivateKey = payload.trim();
        return cachedPrivateKey;
      }
    } catch (err) {
      console.warn(
        `[Secret Manager Warning] Failed to fetch secret '${secretName}' from GCP Secret Manager. ` +
        `Falling back to process.env.BACKEND_WALLET_PRIVATE_KEY. Error:`,
        err
      );
    }
  }

  const envKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
  if (envKey && envKey !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
    cachedPrivateKey = envKey.trim();
    return cachedPrivateKey;
  }

  console.info(
    `[Config Notice] No backend wallet key configured in Secret Manager or BACKEND_WALLET_PRIVATE_KEY. ` +
    `Using simulated testnet relay key.`
  );
  return "0x0000000000000000000000000000000000000000000000000000000000000000";
}
