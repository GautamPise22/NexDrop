import { signupUser, sendOTP } from "../controller/auth.controller.js";
import { sendOtpSchema, signupSchema } from "../interceptors/auth.interceptor.js";
export default async function authRoutes(fastify, opts) {

  // Correct syntax: path, schema object, handler function
  fastify.post("/send-otp", sendOtpSchema, sendOTP);

  // FIXED: Removed the {} wrapping the arguments
  fastify.post("/signup", signupSchema, signupUser);


  // fastify.post("/google", {
  //   schema: {
  //     summary: "Sign in with Google ID token",
  //     tags: ["Auth"],
  //     body: {
  //       type: "object",
  //       required: ["idToken"],
  //       properties: { idToken: { type: "string" } },
  //     },
  //   },
  //   handler: ctrl.googleSignIn,
  // });


  // fastify.post("/register/initiate", {
  //   schema: {
  //     summary: "Step 1 — Send OTP to verify email before registration",
  //     tags: ["Auth"],
  //     body: {
  //       type: "object",
  //       required: ["email"],
  //       properties: { email },
  //     },
  //   },
  //   handler: ctrl.initiateRegister,
  // });

  // fastify.post("/register/complete", {
  //   schema: {
  //     summary: "Step 2 — Verify OTP and create account",
  //     tags: ["Auth"],
  //     body: {
  //       type: "object",
  //       required: ["email", "otp", "password"],
  //       properties: {
  //         email,
  //         otp,
  //         password,
  //         displayName: { type: "string", minLength: 1, maxLength: 64 },
  //       },
  //     },
  //   },
  //   handler: ctrl.completeRegister,
  // });


  // fastify.post("/login/password", {
  //   schema: {
  //     summary: "Sign in with email + password",
  //     tags: ["Auth"],
  //     body: {
  //       type: "object",
  //       required: ["email", "password"],
  //       properties: { email, password },
  //     },
  //   },
  //   handler: ctrl.passwordLogin,
  // });


  // fastify.post("/login/otp/request", {
  //   schema: {
  //     summary: "Step 1 — Request OTP for passwordless login",
  //     tags: ["Auth"],
  //     body: {
  //       type: "object",
  //       required: ["email"],
  //       properties: { email },
  //     },
  //   },
  //   handler: ctrl.requestLoginOTP,
  // });

  // fastify.post("/login/otp/verify", {
  //   schema: {
  //     summary: "Step 2 — Verify OTP and sign in",
  //     tags: ["Auth"],
  //     body: {
  //       type: "object",
  //       required: ["email", "otp"],
  //       properties: { email, otp },
  //     },
  //   },
  //   handler: ctrl.verifyLoginOTP,
  // });


  // fastify.post("/password/reset/request", {
  //   schema: {
  //     summary: "Step 1 — Send OTP for password reset",
  //     tags: ["Auth"],
  //     body: {
  //       type: "object",
  //       required: ["email"],
  //       properties: { email },
  //     },
  //   },
  //   handler: ctrl.requestPasswordReset,
  // });

  // fastify.post("/password/reset/confirm", {
  //   schema: {
  //     summary: "Step 2 — Verify OTP and set new password",
  //     tags: ["Auth"],
  //     body: {
  //       type: "object",
  //       required: ["email", "otp", "newPassword"],
  //       properties: { email, otp, newPassword: password },
  //     },
  //   },
  //   handler: ctrl.resetPassword,
  // });


  // fastify.post("/token/refresh", {
  //   schema: {
  //     summary: "Refresh access token using refresh token",
  //     tags: ["Auth"],
  //     body: {
  //       type: "object",
  //       required: ["refreshToken"],
  //       properties: { refreshToken: { type: "string" } },
  //     },
  //   },
  //   handler: ctrl.refreshToken,
  // });


  // fastify.post("/logout", {
  //   preHandler: [authenticate],
  //   schema: {
  //     summary: "Logout — revoke refresh token",
  //     tags: ["Auth"],
  //     security: [{ bearerAuth: [] }],
  //   },
  //   handler: ctrl.logout,
  // });

  // fastify.get("/me", {
  //   preHandler: [authenticate],
  //   schema: {
  //     summary: "Get current authenticated user",
  //     tags: ["Auth"],
  //     security: [{ bearerAuth: [] }],
  //   },
  //   handler: ctrl.getMe,
  // });
}