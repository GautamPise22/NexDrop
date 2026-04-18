// src/utils/jwt.utils.js
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/**
 * Sign an access token (short-lived).
 * @param {{ uid: string, email: string, role?: string }} payload
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    issuer: "fastify-auth",
  });
}

/**
 * Sign a refresh token (long-lived).
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    issuer: "fastify-auth",
  });
}

/**
 * Verify an access token. Throws if invalid / expired.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET, { issuer: "fastify-auth" });
}

/**
 * Verify a refresh token. Throws if invalid / expired.
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET, { issuer: "fastify-auth" });
}

/** Extract the bearer token from the Authorization header. */
export function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}