import authRoutes from "./auth.routes.js";

export default async function routes(fastify, opts) {
  fastify.register(authRoutes, { prefix: "/auth" });
}