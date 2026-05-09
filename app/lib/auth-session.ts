import type { UserPublic } from "~/lib/interfaces/auth.interface";

const REFRESH_TOKEN_KEY = "koha-refresh-token";

interface AuthSessionState {
  accessToken: string | null;
  user: UserPublic | null;
}

const state: AuthSessionState = {
  accessToken: null,
  user: null,
};

export function getAccessToken(): string | null {
  return state.accessToken;
}

export function getCurrentUser(): UserPublic | null {
  return state.user;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(refreshToken: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    // Ignore storage failures; API calls still use in-memory access token.
  }
}

export function clearRefreshToken(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function setAuthSession(
  accessToken: string,
  refreshToken: string,
  user: UserPublic
): void {
  state.accessToken = accessToken;
  state.user = user;
  setRefreshToken(refreshToken);
}

export function setAccessToken(accessToken: string): void {
  state.accessToken = accessToken;
}

export function clearAuthSession(): void {
  state.accessToken = null;
  state.user = null;
  clearRefreshToken();
}
