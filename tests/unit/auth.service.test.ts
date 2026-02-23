import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authService from "../../../src/modules/auth/auth.service";
import { prisma } from "../../../src/lib/prisma";
import bcrypt from "bcryptjs";

vi.mock("../../../src/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    refreshToken: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  },
}));

const mockUser = {
  id: "cuid1", email: "test@example.com", name: "Test",
  role: "USER" as const, password: "", createdAt: new Date(), updatedAt: new Date(),
};

beforeEach(async () => {
  mockUser.password = await bcrypt.hash("Password1!", 4);
  vi.clearAllMocks();
});

describe("register", () => {
  it("creates user and returns tokens", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);
    const r = await authService.register({ name: "T", email: "t@e.com", password: "Password1!" });
    expect(r.accessToken).toBeDefined();
    expect(r.refreshToken).toBeDefined();
  });

  it("throws ConflictError on duplicate email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    await expect(authService.register({ name: "T", email: "t@e.com", password: "Password1!" }))
      .rejects.toThrow("Email already registered");
  });
});

describe("login", () => {
  it("returns tokens on valid credentials", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);
    const r = await authService.login({ email: "t@e.com", password: "Password1!" });
    expect(r.accessToken).toBeDefined();
  });

  it("throws on wrong password", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    await expect(authService.login({ email: "t@e.com", password: "wrong" }))
      .rejects.toThrow("Invalid credentials");
  });

  it("throws if user not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    await expect(authService.login({ email: "no@e.com", password: "Password1!" }))
      .rejects.toThrow("Invalid credentials");
  });
});
