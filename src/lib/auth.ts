/** Servicios de autenticación: envuelven los endpoints /auth de la API. */

import { api, setToken, clearToken } from "./api";
import type { User } from "./types";

interface AuthResponse {
  message: string;
  data: { user: User; token: string };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  codigo_utp?: string;
  carrera?: string;
  ciclo?: number;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const res = await api<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
  setToken(res.data.token);
  return res.data.user;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setToken(res.data.token);
  return res.data.user;
}

export async function logout(): Promise<void> {
  try {
    await api("/auth/logout", { method: "POST" });
  } finally {
    clearToken(); // limpiar siempre, aunque el server falle
  }
}

export async function me(): Promise<User> {
  const res = await api<{ data: User }>("/me");
  return res.data;
}
