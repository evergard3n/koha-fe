import type { UserPublic } from "~/lib/interfaces/auth.interface";

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

export function setAuthSession(accessToken: string, user: UserPublic): void {
  state.accessToken = accessToken;
  state.user = user;
}

export function setAccessToken(accessToken: string): void {
  state.accessToken = accessToken;
}

export function clearAuthSession(): void {
  state.accessToken = null;
  state.user = null;
}
