"use client";

/**
 * AuthContext — estado global de sesión en el cliente.
 * Rehidrata el usuario desde el token al montar (GET /me).
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getToken } from "./api";
import * as auth from "./auth";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: auth.RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehidratar sesión al cargar la app.
  useEffect(() => {
    (async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        setUser(await auth.me());
      } catch {
        // token inválido/expirado → sesión limpia
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login: async (email, password) => setUser(await auth.login(email, password)),
    register: async (payload) => setUser(await auth.register(payload)),
    logout: async () => {
      await auth.logout();
      setUser(null);
    },
    refresh: async () => setUser(await auth.me()),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
