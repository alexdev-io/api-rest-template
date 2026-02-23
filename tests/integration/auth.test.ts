import { describe, it, expect } from "vitest";
import { getTestApp } from "../helpers/app";

describe("POST /api/v1/auth/register", () => {
  it("201 — creates user and returns tokens", async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: "POST", url: "/api/v1/auth/register",
      payload: { name: "John Doe", email: "john@example.com", password: "Password1!" },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.user.email).toBe("john@example.com");
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
    expect(body.user.password).toBeUndefined(); // never leak password
  });

  it("422 — invalid email", async () => {
    const app = await getTestApp();
    const res = await app.inject({
      method: "POST", url: "/api/v1/auth/register",
      payload: { name: "J", email: "bad-email", password: "Password1!" },
    });
    expect(res.statusCode).toBe(422);
  });

  it("409 — duplicate email", async () => {
    const app = await getTestApp();
    const p = { name: "J", email: "dup@example.com", password: "Password1!" };
    await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: p });
    const res = await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: p });
    expect(res.statusCode).toBe(409);
  });
});

describe("POST /api/v1/auth/login", () => {
  it("200 — valid credentials", async () => {
    const app = await getTestApp();
    await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { name: "J", email: "j@example.com", password: "Password1!" } });
    const res = await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email: "j@example.com", password: "Password1!" } });
    expect(res.statusCode).toBe(200);
    expect(res.json().accessToken).toBeDefined();
  });

  it("401 — wrong password", async () => {
    const app = await getTestApp();
    const res = await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email: "x@x.com", password: "wrong" } });
    expect(res.statusCode).toBe(401);
  });
});
