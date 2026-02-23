import type { FastifyInstance } from "fastify";
import { UpdateUserSchema, UserParamsSchema, PaginationSchema } from "./users.schema";
import * as usersService from "./users.service";

export default async function usersRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/", {
    schema: { tags: ["users"], summary: "List users (admin)", security: [{ bearerAuth: [] }] },
    preHandler: [app.requireAdmin],
    handler: async (request, reply) => {
      const { page, limit } = PaginationSchema.parse(request.query);
      reply.send(await usersService.findAll(page, limit));
    },
  });

  app.get("/me", {
    schema: { tags: ["users"], summary: "Get own profile", security: [{ bearerAuth: [] }] },
    handler: async (request: any, reply) => {
      reply.send(await usersService.findById(request.user.sub));
    },
  });

  app.get("/:id", {
    schema: { tags: ["users"], summary: "Get user by ID (admin)", security: [{ bearerAuth: [] }], params: { type: "object", properties: { id: { type: "string" } } } },
    preHandler: [app.requireAdmin],
    handler: async (request, reply) => {
      const { id } = UserParamsSchema.parse(request.params);
      reply.send(await usersService.findById(id));
    },
  });

  app.patch("/me", {
    schema: { tags: ["users"], summary: "Update own profile", security: [{ bearerAuth: [] }] },
    handler: async (request: any, reply) => {
      const input = UpdateUserSchema.parse(request.body);
      reply.send(await usersService.update(request.user.sub, input));
    },
  });

  app.delete("/:id", {
    schema: { tags: ["users"], summary: "Delete user (admin)", security: [{ bearerAuth: [] }] },
    preHandler: [app.requireAdmin],
    handler: async (request, reply) => {
      const { id } = UserParamsSchema.parse(request.params);
      await usersService.remove(id);
      reply.code(204).send();
    },
  });
}
