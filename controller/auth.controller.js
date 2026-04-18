import * as authService from "../services/auth.service.js";
import { successResponseBody, errorResponseBody } from "../utils/responseBody.js";
import { STATUS } from "../utils/constants.js";
import { sendOtpService } from "../services/otp.service.js";

export const sendOTP = async (req, reply) => {
  try {
      const data = req.body;

      // 1. Pass the raw request body to your service
      const response = await sendOtpService(data);

      // 2. The service already formats the successResponseBody, so just send it!
      return reply.status(STATUS.OK).send(response);

  } catch (error) {
      console.error("OTP Controller Error:", error);

      // Clone your standard error template so we don't mutate the original
      const errorResponse = { ...errorResponseBody };

      // Handle expected business logic errors thrown from the service (e.g., 400, 404, 409)
      if (error.code) {
          errorResponse.message = error.message;
          errorResponse.err = error.err || {};
          return reply.status(error.code).send(errorResponse);
      }

      // Handle unexpected server crashes (e.g., Nodemailer failing, database down)
      errorResponse.message = "Something went wrong.";
      errorResponse.err = process.env.NODE_ENV === "development" ? error.message : {};
      
      return reply.status(STATUS.INTERNAL_SERVER_ERROR).send(errorResponse);
  }
};

export const signupUser = async (req, reply) => {
  try {
    const data = req.body;
    
    const response = await authService.signupService(data);
    
    const successResponse = { ...successResponseBody };
    successResponse.message = response.message;
    successResponse.data = response.data;

    return reply.status(STATUS.OK).send(successResponse);

  } catch (error) {
    console.error("Signup Controller Error:", error);

    const errorResponse = { ...errorResponseBody };

    if (error.code) {
      errorResponse.message = error.message;
      errorResponse.err = error.err || {};
      return reply.status(error.code).send(errorResponse);
    }

    errorResponse.message = "Something went wrong.";
    errorResponse.err = process.env.NODE_ENV === "development" ? error.message : {};
    
    return reply.status(STATUS.INTERNAL_SERVER_ERROR).send(errorResponse);
  }
};