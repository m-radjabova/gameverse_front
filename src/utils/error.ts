import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Unexpected error";
  }

  const detail = (error.response?.data as any)?.detail;
  const message = (error.response?.data as any)?.message;
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
