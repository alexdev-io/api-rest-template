import { describe, it, expect } from "vitest";
import { getTestApp } from "../helpers/app";

describe("GET /api/v1/health", () => {
  it("returns ok", async () => {
    const app = await getTestApp();
    const res = await app.inject({ method: "GET", url: "/api/v1/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("ok");
    expect(typeof res.json().uptime).toBe("number");
  });
});
