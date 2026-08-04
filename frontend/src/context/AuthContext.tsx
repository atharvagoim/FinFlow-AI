import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient, setAccessToken } from "../api/client";

export type Role = "admin" | "finance_manager" | "employee";
export interface AuthUser { id: string; name: string; email: string; role: Role; isEmailVerified?: boolean; }

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("finflow-access-token");
    const storedUser = localStorage.getItem("finflow-user");
    if (token && storedUser) {
      setAccessToken(token);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function persistSession(accessToken: string, refreshToken: string, authUser: AuthUser) {
    localStorage.setItem("finflow-access-token", accessToken);
    localStorage.setItem("finflow-refresh-token", refreshToken);
    localStorage.setItem("finflow-user", JSON.stringify(authUser));
    setAccessToken(accessToken);
    setUser(authUser);
  }

  async function login(email: string, password: string) {
    const { data } = await apiClient.post("/auth/login", { email, password });
    persistSession(data.data.accessToken, data.data.refreshToken, data.data.user);
  }

  async function signup(name: string, email: string, password: string) {
    await apiClient.post("/auth/signup", { name, email, password });
  }

  function logout() {
    const refreshToken = localStorage.getItem("finflow-refresh-token");
    apiClient.post("/auth/logout", { refreshToken }).catch(() => {});
    localStorage.removeItem("finflow-access-token");
    localStorage.removeItem("finflow-refresh-token");
    localStorage.removeItem("finflow-user");
    setAccessToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
