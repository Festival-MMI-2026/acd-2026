import type { H3Event } from "h3";
import { auth } from "./auth";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  banned?: boolean | null;
};

export async function getSessionUser(
  event: H3Event,
): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export async function requireUser(event: H3Event): Promise<SessionUser> {
  const user = await getSessionUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  if (user.banned) {
    throw createError({ statusCode: 403, statusMessage: "Account banned" });
  }
  return user;
}

export async function requireAdmin(event: H3Event): Promise<SessionUser> {
  const user = await requireUser(event);
  if (user.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  }
  return user;
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "admin";
}
