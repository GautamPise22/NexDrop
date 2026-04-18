// src/services/email.service.js
import nodemailer from "nodemailer";

let _transporter;

function getTransporter() {
  if (_transporter) return _transporter;

  // Initialize the Nodemailer transporter using your .env variables
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true", // false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return _transporter;
}

/**
 * Send an OTP email.
 * @param {string} toEmail
 * @param {string} otp
 */
export async function sendOTPEmail(toEmail, otp) {
  const minutes = process.env.OTP_EXPIRES_IN_MINUTES || "10";

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "Your NexDrop Verification Code",
    text: `Your OTP is: ${otp}\n\nThis code expires in ${minutes} minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:auto;">
        <h2 style="color:#1a1a2e;">Verification Code</h2>
        <p>Use the code below to verify your account:</p>
        <div style="
          font-size:36px;font-weight:700;letter-spacing:12px;
          background:#f0f4ff;padding:20px 30px;border-radius:8px;
          text-align:center;color:#2563eb;margin:24px 0;
        ">${otp}</div>
        <p style="color:#6b7280;font-size:14px;">
          This code expires in <strong>${minutes} minutes</strong>.<br/>
          If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  });
}

/**
 * Send a welcome email after successful registration.
 * @param {string} toEmail
 * @param {string} name
 */
export async function sendWelcomeEmail(toEmail, name) {
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "Welcome aboard! 🎉",
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:auto;">
        <h2>Hi ${name}, welcome to NexDrop!</h2>
        <p>Your account has been created successfully. Start exploring now.</p>
      </div>
    `,
  });
}