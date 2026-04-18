import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import appRoutes from "./routes/index.js"; 
import { initFirebase } from "./config/firebase.config.js";

initFirebase();

const fastify = Fastify({
  logger: process.env.NODE_ENV === "development",
});


await fastify.register(helmet, { global: true });

await fastify.register(cors, {
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


fastify.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));

fastify.register(appRoutes, { prefix: "/api" });


export default async function handler(req, res) {
  await fastify.ready();
  
  fastify.server.emit('request', req, res);
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