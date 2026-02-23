import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { ConflictError, UnauthorizedError } from "../../lib/errors";
import type { RegisterInput, LoginInput } from "./auth.schema";
import type { JWTPayload } from "../../types";

const SALT_ROUNDS = 12;

const issueTokens = (payload: Omit<JWTPayload, "type">) => ({
  accessToken: jwt.sign(
    { ...payload, type: "access" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY } as any
  ),
  refreshToken: jwt.sign(
    { ...payload, type: "refresh" },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY } as any
  ),
});

const storeRefreshToken = async (token: string, userId: string) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
};

export const register = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ConflictError("Email already registered");

  const password = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, password },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const tokens = issueTokens({ sub: user.id, email: user.email, role: user.role });
  await storeRefreshToken(tokens.refreshToken, user.id);
  return { user, ...tokens };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new UnauthorizedError("Invalid credentials");

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new UnauthorizedError("Invalid credentials");

  const tokens = issueTokens({ sub: user.id, email: user.email, role: user.role });
  await storeRefreshToken(tokens.refreshToken, user.id);

  const { password: _, ...safeUser } = user;
  return { user: safeUser, ...tokens };
};

export const refresh = async (refreshToken: string) => {
  let payload: JWTPayload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JWTPayload;
  } catch {
    throw new UnauthorizedError("Invalid refresh token");
  }
  if (payload.type !== "refresh") throw new UnauthorizedError("Invalid token type");

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Refresh token expired or revoked");
  }

  // Rotate — revoke old, issue new
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const tokens = issueTokens({ sub: payload.sub, email: payload.email, role: payload.role });
  await storeRefreshToken(tokens.refreshToken, payload.sub);
  return tokens;
};

export const logout = async (refreshToken: string) => {
  await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { revoked: true } });
};

export const logoutAll = async (userId: string) => {
  await prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
};
