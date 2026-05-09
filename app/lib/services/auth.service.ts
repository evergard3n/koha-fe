import apiClient from "~/lib/axios";
import type {
  AuthSessionData,
  LoginBody,
  LogoutBody,
  LogoutData,
  RefreshAuthSessionBody,
  SignupBody,
  UserPublic,
} from "~/lib/interfaces/auth.interface";

export async function signupUser(body: SignupBody): Promise<AuthSessionData> {
  const { data } = await apiClient.post("/auth/signup", body);
  return data as AuthSessionData;
}

export async function loginUser(body: LoginBody): Promise<AuthSessionData> {
  const { data } = await apiClient.post("/auth/login", body);
  return data as AuthSessionData;
}

export async function refreshAuthSession(
  body: RefreshAuthSessionBody
): Promise<AuthSessionData> {
  const { data } = await apiClient.post("/auth/refresh", body);
  return data as AuthSessionData;
}

export async function logoutUser(body: LogoutBody): Promise<LogoutData> {
  const { data } = await apiClient.post("/auth/logout", body);
  return data as LogoutData;
}

export async function fetchCurrentUser(): Promise<UserPublic> {
  const { data } = await apiClient.get("/users/me");
  return data as UserPublic;
}
