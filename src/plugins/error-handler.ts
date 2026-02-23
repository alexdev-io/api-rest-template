import fp from "fastify-plugin";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

export default fp(async (app) => {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(422).send({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        issues: error.flatten().fieldErrors,
      });
    }
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        error: error.message,
        code: error.code,
      });
    }
    if (error.validation) {
      return reply.code(400).send({
        error: "Bad request",
        code: "BAD_REQUEST",
        issues: error.validation,
      });
    }
    logger.error("Unhandled error", { error, path: request.url });
    return reply.code(500).send({ error: "Internal server error", code: "INTERNAL_ERROR" });
  });
});
