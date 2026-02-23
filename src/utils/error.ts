import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Unexpected error";
  }

  const data = error.response?.data;
  const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const detail = payload?.detail;
  const message = payload?.message;
  const fallbackByCode =
    error.response?.status === 403
      ? "Sizda ruxsat yo'q"
      : error.response?.status === 404
        ? "Topilmadi"
        : "So'rovda xatolik";

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => item?.msg || item?.message || JSON.stringify(item))
      .join(", ");
  }
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  return fallbackByCode;
}
