// src/utils/otp.utils.js
import crypto from "crypto";

/**
 * Generate a cryptographically-safe numeric OTP.
 * @param {number} length  Defaults to env OTP_LENGTH or 6
 * @returns {string}       Zero-padded numeric string, e.g. "083421"
 */
export function generateOTP(length = parseInt(process.env.OTP_LENGTH ?? "6", 10)) {
  const max = Math.pow(10, length);          // 10^6 = 1_000_000
  const otp = crypto.randomInt(0, max);       // cryptographically secure
  return String(otp).padStart(length, "0");
}

/**
 * Compute OTP expiry timestamp.
 * @returns {Date}
 */
export function otpExpiresAt() {
  const minutes = parseInt(process.env.OTP_EXPIRES_IN_MINUTES ?? "10", 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}