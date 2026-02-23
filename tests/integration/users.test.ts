import { describe, it, expect } from "vitest";
import { getTestApp } from "../helpers/app";

const setup = async (email = "user@example.com") => {
  const app = await getTestApp();
  await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { name: "User", email, password: "Password1!" } });
  const r = await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email, password: "Password1!" } });
  return { app, token: r.json().accessToken as string };
};

describe("GET /api/v1/users/me", () => {
  it("200 — returns profile", async () => {
    const { app, token } = await setup();
    const res = await app.inject({ method: "GET", url: "/api/v1/users/me", headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    expect(res.json().email).toBe("user@example.com");
  });

  it("401 — no token", async () => {
    const { app } = await setup("noauth@example.com");
    const res = await app.inject({ method: "GET", url: "/api/v1/users/me" });
    expect(res.statusCode).toBe(401);
  });
});

describe("PATCH /api/v1/users/me", () => {
  it("200 — updates name", async () => {
    const { app, token } = await setup("patch@example.com");
    const res = await app.inject({ method: "PATCH", url: "/api/v1/users/me", headers: { authorization: `Bearer ${token}` }, payload: { name: "New Name" } });
    expect(res.statusCode).toBe(200);
    expect(res.json().name).toBe("New Name");
  });
});
