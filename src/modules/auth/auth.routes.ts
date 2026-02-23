import type { FastifyInstance } from "fastify";
import { RegisterSchema, LoginSchema, RefreshSchema } from "./auth.schema";
import * as authService from "./auth.service";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/register", {
    schema: {
      tags: ["auth"],
      summary: "Register a new user",
      body: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string" }, email: { type: "string", format: "email" }, password: { type: "string", minLength: 8 } } },
      response: { 201: { type: "object", properties: { user: { type: "object" }, accessToken: { type: "string" }, refreshToken: { type: "string" } } } },
    },
    handler: async (request, reply) => {
      const input = RegisterSchema.parse(request.body);
      reply.code(201).send(await authService.register(input));
    },
  });

  app.post("/login", {
    schema: {
      tags: ["auth"],
      summary: "Login",
      body: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string" } } },
    },
    handler: async (request, reply) => {
      reply.send(await authService.login(LoginSchema.parse(request.body)));
    },
  });

  app.post("/refresh", {
    schema: {
      tags: ["auth"],
      summary: "Refresh access token",
      body: { type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string" } } },
    },
    handler: async (request, reply) => {
      const { refreshToken } = RefreshSchema.parse(request.body);
      reply.send(await authService.refresh(refreshToken));
    },
  });

  app.post("/logout", {
    schema: { tags: ["auth"], summary: "Logout — revoke refresh token", security: [{ bearerAuth: [] }] },
    preHandler: [app.authenticate],
    handler: async (request, reply) => {
      const { refreshToken } = RefreshSchema.parse(request.body);
      await authService.logout(refreshToken);
      reply.code(204).send();
    },
  });

  app.post("/logout-all", {
    schema: { tags: ["auth"], summary: "Logout all devices", security: [{ bearerAuth: [] }] },
    preHandler: [app.authenticate],
    handler: async (request: any, reply) => {
      await authService.logoutAll(request.user.sub);
      reply.code(204).send();
    },
  });
}
