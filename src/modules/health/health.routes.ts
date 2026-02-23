import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";

export default async function healthRoutes(app: FastifyInstance) {
  app.get("/", {
    schema: {
      tags: ["health"],
      summary: "Health check",
      response: { 200: { type: "object", properties: { status: { type: "string" }, db: { type: "string" }, uptime: { type: "number" } } } },
    },
    handler: async (_req, reply) => {
      let db = "ok";
      try { await prisma.$queryRaw`SELECT 1`; } catch { db = "error"; }
      reply.send({ status: "ok", db, uptime: process.uptime() });
    },
  });
}
