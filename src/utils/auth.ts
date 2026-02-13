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
