import { z } from "zod";

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

export const UserParamsSchema = z.object({
  id: z.string().min(1),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
