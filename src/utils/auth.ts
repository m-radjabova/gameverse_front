import axios from "axios";
import { API_ORIGIN } from "../utils";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const ROLE_KEY = "role";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );

    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds;
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearAuthStorage(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export async function refreshSession(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken || isTokenExpired(refreshToken)) {
    clearAuthStorage();
    return null;
  }

  try {
    const response = await axios.post(`${API_ORIGIN}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    const nextAccessToken = response.data?.access_token as string | undefined;
    const nextRefreshToken = response.data?.refresh_token as string | undefined;

    if (!nextAccessToken) {
      clearAuthStorage();
      return null;
    }

    setTokens(nextAccessToken, nextRefreshToken);
    return nextAccessToken;
  } catch {
    clearAuthStorage();
    return null;
  }
}

export async function logoutRequest(): Promise<void> {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    const refreshToken = getRefreshToken();
    await axios.post(
      `${API_ORIGIN}/auth/logout`,
      { refresh_token: refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  } catch {
    // Best effort logout. Local cleanup still must happen.
  } finally {
    clearAuthStorage();
  }
}
