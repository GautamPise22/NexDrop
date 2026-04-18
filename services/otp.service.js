import nodemailer from "nodemailer";
import { db, COLLECTIONS } from "../config/firebase.config.js";
import { hashOTP, verifyPassword } from "../utils/hash.js";
import { STATUS, OTP_PURPOSE } from "../utils/constants.js";
import { errorResponseBody, successResponseBody } from "../utils/responseBody.js";

const generateOTP = () => String(Math.floor(1000 + Math.random() * 9000));

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendOtpService = async (data) => {
    const { email_id, purpose, name, password } = data;
    let upperPurpose = purpose?.toUpperCase();

    if (![OTP_PURPOSE.SIGNUP, OTP_PURPOSE.SIGNIN, OTP_PURPOSE.RESET_PASSWORD].includes(upperPurpose)) {
        throw {
            err: { purpose: "Invalid purpose." },
            code: STATUS.BAD_REQUEST,
            message: "Purpose must be 'SIGNUP', 'SIGNIN' or 'RESET_PASSWORD'."
        };
    }

    if (upperPurpose === OTP_PURPOSE.SIGNUP && !name) {
        throw { err: { name: "Name is required for signup." }, code: STATUS.BAD_REQUEST, message: "Validation Error" };
    }

    let userName = name || "User";

    const usersSnapshot = await db().collection(COLLECTIONS.USERS).where("email_id", "==", email_id).get();
    const userExists = !usersSnapshot.empty;
    let userRecord = userExists ? usersSnapshot.docs[0].data() : null;

    // --- SCENARIO HANDLING ---

    // Case A: SIGNIN or RESET_PASSWORD -> User MUST exist
    if (upperPurpose === OTP_PURPOSE.SIGNIN || upperPurpose === OTP_PURPOSE.RESET_PASSWORD) {
        if (!userExists) {
            throw { err: { email_id: "User not found. Please sign up first." }, code: STATUS.NOT_FOUND, message: "Resource Not Found" };
        }

        if (upperPurpose === OTP_PURPOSE.SIGNIN) {
            if (!password) {
                throw { err: { password: "Password is required for signin." }, code: STATUS.BAD_REQUEST, message: "Validation Error" };
            }
            
            // Note: Make sure verifyPassword correctly compares plain vs hashed
            const isPasswordValid = await verifyPassword(password, userRecord.password);
            if (!isPasswordValid) {
                throw { err: { password: "Incorrect password." }, code: STATUS.UNAUTHORISED, message: "Authentication Failed" };
            }
        }
        userName = userRecord.name;
    }

    // Case B: SIGNUP -> User MUST NOT exist
    else if (upperPurpose === OTP_PURPOSE.SIGNUP) {
        if (userExists) {
            throw { err: { email_id: "User already exists. Please log in instead." }, code: STATUS.CONFLICT, message: "Conflict Error" };
        }
    }

    // 3. Generate & Hash OTP
    const code = generateOTP();
    const hashedCode = await hashOTP(code);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 4. Upsert into TEMP_OTPS collection
    await db().collection(COLLECTIONS.TEMP_OTPS).doc(email_id).set({
        email_id,
        code: hashedCode,
        purpose: upperPurpose,
        expires_at
    });

    // 5. Prepare & Send Email
    let subjectText = "Your One-Time Password";
    let displayPurpose = upperPurpose;

    if (upperPurpose === OTP_PURPOSE.SIGNUP) subjectText = "Your Verification Code for Signup";
    else if (upperPurpose === OTP_PURPOSE.SIGNIN) subjectText = "Your One-Time Password for Signin";
    else if (upperPurpose === OTP_PURPOSE.RESET_PASSWORD) {
        displayPurpose = "RESET PASSWORD";
        subjectText = "Password Reset Verification Code";
    }

    const mailOptions = {
        from: process.env.EMAIL,
        to: email_id,
        subject: subjectText,
        text: `Your OTP for ${displayPurpose} is ${code}. It is valid for 5 minutes. DO NOT SHARE THIS CODE.`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border-radius: 8px; background-color: #f9f9f9; border: 1px solid #ddd;">
            <div style="text-align: center; background-color: #0a1941ff; padding: 15px; border-radius: 8px 8px 0 0;">
                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Maharashtra_Police_Insignia_India%5B1%5D-1JIZ4S6NTIdYu8aBpAKvqXl1zXn1VJ.png" alt="Sanket Darshak Logo" style="max-width: 80px;">
                <h2 style="color: #ffffff; margin: 10px 0;">OTP Verification</h2>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
                <p style="font-size: 16px;">Dear <strong>${userName}</strong>,</p>
                <p>Your One-Time Password for <strong>${displayPurpose}</strong> is:</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 10px; text-align: center;">
                    <h2 style="color: #030711; font-size: 24px; margin: 0;">${code}</h2>
                    <p style="margin-top: 5px; color: red;">This OTP expires in 5 minutes.</p>
                </div>
                <p style="text-align: center; color: gray; font-size: 12px; margin-top: 20px;">
                    If you did not request this OTP, please ignore this email.<br>
                    Thank you, <br>Sanket Darshak Team
                </p>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color:gray; font-size:12px; text-align: center;">This is an autogenerated message. Please do not reply to this email.</p>
        </div>`
    };

    await transporter.sendMail(mailOptions);

    const response = { ...successResponseBody };
    response.message = `OTP sent successfully to ${email_id}`;
    response.data = { email_id, purpose: upperPurpose };
    return response;
};