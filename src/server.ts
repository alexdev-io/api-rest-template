import { buildApp } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";

const start = async () => {
  const app = await buildApp();
  await app.listen({ port: env.PORT, host: env.HOST });
  logger.info(`🚀 Server → http://${env.HOST}:${env.PORT}`);
  logger.info(`📖 Swagger UI → http://localhost:${env.PORT}/docs`);
};

start().catch((err) => {
  logger.error("Fatal startup error", err);
  process.exit(1);
});
