import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import appRoutes from "./routes/index.js"; 
import { initFirebase } from "./config/firebase.config.js";


const fastify = Fastify({
  logger: process.env.NODE_ENV === "development",
});

// REMOVED 'await' here. Fastify will queue these up.
fastify.register(helmet, { global: true });

fastify.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(",") ?? true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

fastify.setErrorHandler(async (error, request, reply) => {
  const statusCode = error.statusCode ?? error.status ?? 500;

  if (error.validation) {
    return reply.status(400).send({
      success: false,
      message: "Validation error.",
      errors: error.validation.map((e) => ({
        field: e.instancePath.replace("/", "") || e.params?.missingProperty,
        message: e.message,
      })),
    });
  }

  if (statusCode >= 500) {
    fastify.log.error(error);
    return reply.status(500).send({ success: false, message: "Internal server error." });
  }

  return reply.status(statusCode).send({ success: false, message: error.message });
});

fastify.get('/', async (request, reply) => {
  return reply.status(200).send({ message: "Welcome to the Nex Drop API!" });
});

fastify.register(appRoutes, { prefix: "/api" });

// Initialize Firebase safely
try {
  initFirebase();
} catch (error) {
  console.error("Firebase init failed:", error);
}

// Cache the app state to prevent Vercel timeouts on cold starts
let appReady = false;

export default async function handler(req, res) {
  if (!appReady) {
    await fastify.ready();
    appReady = true;
  }

  const response = await fastify.inject({
    method: req.method,
    url: req.url,
    headers: req.headers,
    payload: req.method !== "GET" ? req.body : undefined,
  });

  res.statusCode = response.statusCode;
  
  for (const [key, value] of Object.entries(response.headers)) {
    res.setHeader(key, value);
  }

  res.end(response.body);
}

if (!process.env.VERCEL) {
  const PORT = parseInt(process.env.PORT ?? "3000", 10);
  fastify.listen({ port: PORT, host: "0.0.0.0" })
    .then(() => console.log(`🚀 Local dev server listening on port ${PORT}`))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}