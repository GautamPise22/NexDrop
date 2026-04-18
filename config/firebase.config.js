// src/config/firebase.config.js
import admin from "firebase-admin";
import { readFileSync } from "fs";

let app;

export function initFirebase() {
  if (admin.apps.length) return admin.apps[0]; // already initialised

  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    // Preferred for production: store the key as a base64 env var
    const json = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      "base64"
    ).toString("utf8");
    credential = admin.credential.cert(JSON.parse(json));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    // Convenient for local dev: point to a JSON file
    const serviceAccount = JSON.parse(
      readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8")
    );
    credential = admin.credential.cert(serviceAccount);
  } else {
    throw new Error(
      "No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_SERVICE_ACCOUNT_PATH."
    );
  }

  app = admin.initializeApp({ credential });
  console.log("✅ Firebase Admin SDK initialised");
  return app;
}

// Lazy-loaded helpers ─────────────────────────────────────────────────

/** Firestore instance */
export const db = () => admin.firestore();

/** Firebase Auth instance */
export const firebaseAuth = () => admin.auth();

// Firestore collection names (single source of truth)
export const COLLECTIONS = {
  USERS: "users",
  OTP: "otps",
  REFRESH_TOKENS: "refresh_tokens",
  TEMP_USERS: "temp_users",
  TEMP_OTPS: "temp_otps",
};