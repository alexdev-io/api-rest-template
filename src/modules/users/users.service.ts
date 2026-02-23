import { prisma } from "../../lib/prisma";
import { NotFoundError, ConflictError } from "../../lib/errors";
import type { UpdateUserInput } from "./users.schema";

const SELECT = {
  id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true,
} as const;

export const findAll = async (page: number, limit: number) => {
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({ select: SELECT, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.user.count(),
  ]);
  return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const findById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: SELECT });
  if (!user) throw new NotFoundError("User");
  return user;
};

export const update = async (id: string, input: UpdateUserInput) => {
  await findById(id);
  if (input.email) {
    const conflict = await prisma.user.findFirst({ where: { email: input.email, NOT: { id } } });
    if (conflict) throw new ConflictError("Email already in use");
  }
  return prisma.user.update({ where: { id }, data: input, select: SELECT });
};

export const remove = async (id: string) => {
  await findById(id);
  await prisma.user.delete({ where: { id } });
};
