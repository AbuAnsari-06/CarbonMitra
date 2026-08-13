/**
 * Frontend Client-Side Firebase Configuration.
 * 
 * Read from environment variables at build-time using Vite's `import.meta.env`.
 * Exposes ONLY public client-side keys (VITE_FIREBASE_*).
 * NEVER includes server-side secrets like SENTINEL_HUB_CLIENT_SECRET or private keys.
 */

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const firebaseConfig: FirebaseClientConfig = {
  apiKey: import.meta?.env?.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta?.env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta?.env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta?.env?.VITE_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);
