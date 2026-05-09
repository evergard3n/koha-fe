import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  refreshAuthSession,
  signupUser,
} from "~/lib/services/auth.service";
import type {
  LoginBody,
  LogoutBody,
  RefreshAuthSessionBody,
  SignupBody,
} from "~/lib/interfaces/auth.interface";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useSignup() {
  return useMutation({
    mutationFn: (body: SignupBody) => signupUser(body),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (body: LoginBody) => loginUser(body),
  });
}

export function useRefreshAuthSession() {
  return useMutation({
    mutationFn: (body: RefreshAuthSessionBody) => refreshAuthSession(body),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: (body: LogoutBody) => logoutUser(body),
  });
}

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: fetchCurrentUser,
    enabled,
  });
}
