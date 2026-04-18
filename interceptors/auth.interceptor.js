export const signupSchema = {
  schema: {
    body: {
      type: "object",
      required: ["auth_method", "email_id", "name"],
      properties: {
        auth_method: {
          type: "string",
          enum: ["GOOGLE", "EMAIL"]
        },
        email_id: {
          type: "string",
          format: "email",
          maxLength: 100
        },
        name: {
          type: "string",
          minLength: 2,
          maxLength: 50
        },
        password: {
          type: "string",
          minLength: 8,
          maxLength: 128
        },
        fcm_token: {
          type: "string"
        },
        google_uid: {
          type: "string"
        },
        otp: { 
          type: "string",
          minLength: 4,
          maxLength: 6
        }
      },
      additionalProperties: false
    }
  }
};

export const sendOtpSchema = {
  schema: {
    body: {
      type: "object",
      required: ["email_id", "purpose"], 
      properties: {
        email_id: { 
          type: "string", 
          format: "email",
          maxLength: 100
        },
        purpose: { 
          type: "string", 
          enum: ["SIGNUP", "SIGNIN", "RESET_PASSWORD"] 
        },
        name: { 
          type: "string", 
          minLength: 2,
          maxLength: 50
        },
        password: { 
          type: "string" 
        }
      },
      additionalProperties: false 
    }
  }
};