import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import swaggerPlugin from "./plugins/swagger";
import authPlugin from "./plugins/auth";
import errorHandlerPlugin from "./plugins/error-handler";
import healthRoutes from "./modules/health/health.routes";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";

export const buildApp = async () => {
  const app = Fastify({
    logger: false,
    ajv: { customOptions: { removeAdditional: true, coerceTypes: true } },
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(cookie);
  await app.register(rateLimit, { max: env.RATE_LIMIT_MAX, timeWindow: env.RATE_LIMIT_WINDOW });
  await app.register(swaggerPlugin);
  await app.register(authPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(healthRoutes, { prefix: `/api/${env.API_VERSION}/health` });
  await app.register(authRoutes,   { prefix: `/api/${env.API_VERSION}/auth` });
  await app.register(usersRoutes,  { prefix: `/api/${env.API_VERSION}/users` });

  app.addHook("onRequest", (req, _reply, done) => {
    logger.info(`→ ${req.method} ${req.url}`);
    done();
  });

  return app;
};
