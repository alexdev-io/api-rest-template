import fp from "fastify-plugin";
import jwtPlugin from "@fastify/jwt";
import { env } from "../config/env";
import { UnauthorizedError } from "../lib/errors";
import type { JWTPayload } from "../types";

export default fp(async (app) => {
  await app.register(jwtPlugin, { secret: env.JWT_ACCESS_SECRET });

  app.decorate("authenticate", async (request: any, _reply: any) => {
    try {
      await request.jwtVerify();
      if ((request.user as JWTPayload).type !== "access") {
        throw new UnauthorizedError("Invalid token type");
      }
    } catch (e: any) {
      if (e instanceof UnauthorizedError) throw e;
      throw new UnauthorizedError("Invalid or expired token");
    }
  });

  app.decorate("requireAdmin", async (request: any, reply: any) => {
    await (app as any).authenticate(request, reply);
    if ((request.user as JWTPayload).role !== "ADMIN") {
      throw new ForbiddenError();
    }
  });
});

import { ForbiddenError } from "../lib/errors";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: any, reply: any) => Promise<void>;
    requireAdmin: (req: any, reply: any) => Promise<void>;
  }
}
