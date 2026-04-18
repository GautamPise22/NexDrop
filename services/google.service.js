// src/services/google.service.js
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify a Google ID token sent from the frontend (after sign-in with Google).
 *
 * Frontend flow:
 *  1. User clicks "Sign in with Google" → Google returns an `id_token`
 *  2. Frontend sends that `id_token` to POST /auth/google
 *  3. This function verifies it server-side
 *
 * @param {string} idToken  — the raw JWT from Google
 * @returns {{ uid: string, email: string, name: string, picture: string, emailVerified: boolean }}
 */
export async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google token payload.");
  }

  return {
    googleUid: payload.sub,              // Google's unique user ID
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    emailVerified: payload.email_verified ?? false,
  };
}