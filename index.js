import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import appRoutes from "./routes/index.js"; 
import { initFirebase } from "./config/firebase.config.js";

// Optional: Only load dotenv locally, not on Vercel
if (!process.env.VERCEL) {
  import("dotenv/config");
}

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

app.get('/', (req, res) => {
  res.status(200).json({ message: "Welcome to the Nex Drop API!" });
});

fastify.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));

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