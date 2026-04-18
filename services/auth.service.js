import { db, COLLECTIONS } from "../config/firebase.config.js";
import { FieldValue } from "firebase-admin/firestore";
import { hashPassword, verifyOTP } from "../utils/hash.js";
import { USER_ROLE, STATUS, OTP_PURPOSE } from "../utils/constants.js";

export const signupService = async (data) => {
  const { auth_method, email_id, name, password, fcm_token, google_uid, otp } = data;

  // Google auth
  if (auth_method === "GOOGLE") {
    if (!google_uid) throw { code: STATUS.BAD_REQUEST, message: "google_uid required for Google auth." };

    const userRef = db().collection(COLLECTIONS.USERS).doc(google_uid);
    if ((await userRef.get()).exists) {
      throw { code: STATUS.CONFLICT, message: "User already exists." };
    }

    const userData = {
      user_id: google_uid,
      name: name || "",
      email_id: email_id,
      password: null,
      user_type: USER_ROLE.NORMAL_USER,
      fcm_token: fcm_token || null,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    };

    await userRef.set(userData);
    return { message: "Google signup successful", data: userData };
  }

  // Email auth
  if (auth_method === "EMAIL") {
    if (!password) throw { err: { password: "Required" }, code: STATUS.BAD_REQUEST, message: "Validation Error" };
    if (!otp) throw { err: { otp: "Required" }, code: STATUS.BAD_REQUEST, message: "Validation Error" };

    // 1. Fetch the OTP from Firebase
    const otpDocRef = db().collection(COLLECTIONS.TEMP_OTPS).doc(email_id);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      throw { err: { otp: "OTP not found or expired." }, code: STATUS.BAD_REQUEST, message: "Validation Error" };
    }

    const otpData = otpDoc.data();

    // 2. Validate OTP Expiration & Purpose
    if (otpData.expires_at.toDate() < new Date()) {
      await otpDocRef.delete(); // Clean up expired OTP
      throw { err: { otp: "OTP has expired." }, code: STATUS.BAD_REQUEST, message: "Validation Error" };
    }

    if (otpData.purpose !== OTP_PURPOSE.SIGNUP) {
      throw { err: { purpose: "OTP was not generated for signup." }, code: STATUS.BAD_REQUEST, message: "Validation Error" };
    }

    // 3. Verify OTP using Argon2
    const isOtpValid = await verifyOTP(otp, otpData.code);
    if (!isOtpValid) {
      throw { err: { otp: "Invalid OTP." }, code: STATUS.UNAUTHORISED, message: "Authentication Failed" };
    }

    // 4. Hash Password & Prepare User Data
    const hashedPassword = await hashPassword(password);
    const newUserRef = db().collection(COLLECTIONS.USERS).doc(); // Auto-generate ID

    const newUserData = {
      user_id: newUserRef.id,
      name: name || "",
      email_id: email_id,
      password: hashedPassword,
      user_type: USER_ROLE.NORMAL_USER,
      fcm_token: fcm_token || null,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    };

    const batch = db().batch();
    batch.set(newUserRef, newUserData);
    batch.delete(otpDocRef);
    await batch.commit();

    const responseData = { ...newUserData };
    delete responseData.password;

    return { message: "Signup successful", data: responseData };
  }
};