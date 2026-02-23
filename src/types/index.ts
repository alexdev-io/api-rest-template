export interface JWTPayload {
  sub: string;
  email: string;
  role: "USER" | "ADMIN";
  type: "access" | "refresh";
}

export type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};
