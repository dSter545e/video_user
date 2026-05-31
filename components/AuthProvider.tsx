"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { getViewerToken, getViewerUser, VIEWER_AUTH_CHANGED_EVENT, ViewerUser } from "../lib/auth";

type AuthContextValue = {
  user: ViewerUser | null;
  token: string;
  isAuthenticated: boolean;
  loading: boolean;
  refreshAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ViewerUser | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  const refreshAuth = () => {
    setUser(getViewerUser());
    setToken(getViewerToken());
    setLoading(false);
  };

  useEffect(() => {
    refreshAuth();
    window.addEventListener(VIEWER_AUTH_CHANGED_EVENT, refreshAuth);
    window.addEventListener("storage", refreshAuth);
    return () => {
      window.removeEventListener(VIEWER_AUTH_CHANGED_EVENT, refreshAuth);
      window.removeEventListener("storage", refreshAuth);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      refreshAuth,
    }),
    [user, token, loading]
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
