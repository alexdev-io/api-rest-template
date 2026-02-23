import { beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "../../src/lib/prisma";

beforeAll(async () => { await prisma.$connect(); });
afterAll(async () => { await prisma.$disconnect(); });
beforeEach(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});
