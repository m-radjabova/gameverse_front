export function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

export function toMediaUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/${path}`;
}


export const formatDuration = (duration: number | string | null | undefined) => {
    const totalMinutes = Number(duration);
    if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };