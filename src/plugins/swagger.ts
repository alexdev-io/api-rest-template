import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "../config/env";

export default fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "API REST Template",
        description: "Production-ready REST API — Fastify + TypeScript + Prisma + Zod",
        version: "1.0.0",
      },
      servers: [{ url: `http://localhost:${env.PORT}`, description: "Development" }],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
      tags: [
        { name: "health", description: "Health checks" },
        { name: "auth", description: "Authentication" },
        { name: "users", description: "User management" },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: true },
    staticCSP: true,
  });
});
