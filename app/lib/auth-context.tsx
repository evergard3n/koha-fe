import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearAuthSession, getCurrentUser, setAuthSession } from "~/lib/auth-session";
import { loginUser, logoutUser, refreshAuthSession } from "~/lib/services/auth.service";
import type { UserPublic } from "~/lib/interfaces/auth.interface";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: UserPublic | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserPublic | null>(() => getCurrentUser());

  useEffect(() => {
    let mounted = true;

    const hydrateFromCookie = async () => {
      try {
        const session = await refreshAuthSession();
        if (!mounted) return;
        setAuthSession(session.accessToken, session.user);
        setUser(session.user);
        setStatus("authenticated");
      } catch {
        if (!mounted) return;
        clearAuthSession();
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    void hydrateFromCookie();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const session = await loginUser({ username, password });
    setAuthSession(session.accessToken, session.user);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      clearAuthSession();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login,
      logout,
    }),
    [status, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
