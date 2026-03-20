import type { User } from "../types/types";

export function formatUserCreatedAt(user?: Partial<User> | null) {
  const value = user?.created_at;
  if (!value) return "Noma'lum";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Noma'lum";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
