import type { User } from "../types/types";

export type AppRole = "admin" | "teacher" | "user" | "student";

export function getUserRoles(user: User | null | undefined): string[] {
  if (!user?.roles) return [];
  return user.roles.map((role) => role.toLowerCase());
}

export function hasAnyRole(
  user: User | null | undefined,
  roles: AppRole[],
): boolean {
  const userRoles = new Set(getUserRoles(user));
  return roles.some((role) => {
    if (role === "student") {
      return userRoles.has("student") || userRoles.has("user");
    }
    return userRoles.has(role);
  });
}
