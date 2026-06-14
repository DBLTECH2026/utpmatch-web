"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { Logo, Button, Field } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard/perfil");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al ingresar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Columna formulario */}
      <div className="flex flex-col justify-center px-8 sm:px-14 py-12">
        <div className="max-w-[420px] w-full mx-auto">
          <Logo size={88} />
          <h1 className="mt-7 text-[40px] leading-[1.05] font-extrabold">
            Encuentra tu
            <br />
            <span
              style={{
                background: "linear-gradient(90deg,#E2231A,#13A07C)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              match laboral.
            </span>
          </h1>
          <p className="mt-3 text-gris">
            El copiloto de IA que arma tu ruta, mejora tu CV y te conecta con los
            empleos donde de verdad calzas. Para alumnos UTP de cualquier carrera.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field
              label="Correo institucional"
              type="email"
              placeholder="tucodigo@utp.edu.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Field
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="rounded-xl bg-rojoT px-4 py-3 text-sm text-rojo2">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando…" : "Ingresar con cuenta UTP"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/registro")}
            >
              Crear cuenta nueva
            </Button>
          </form>

          <p className="mt-5 text-xs text-gris">SSO institucional · @utp.edu.pe</p>
        </div>
      </div>

      {/* Columna marca */}
      <div className="hidden lg:flex flex-col justify-center bg-tinta text-white p-14">
        <div className="max-w-md">
          <div className="flex items-center gap-5 mb-9">
            <div className="relative w-[124px] h-[124px] shrink-0">
              <svg
                className="w-[124px] h-[124px]"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle cx="62" cy="62" r="52" stroke="rgba(255,255,255,.13)" strokeWidth="11" fill="none" />
                <circle
                  cx="62"
                  cy="62"
                  r="52"
                  stroke="#13A07C"
                  strokeWidth="11"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={327}
                  strokeDashoffset={327 - (327 * 68) / 100}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[38px] font-extrabold">68</span>
                <span className="text-[10px] text-white/50">/ 100</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50">
                Empleabilidad Score
              </p>
              <p className="mt-1 text-white/85 text-[15px] max-w-[220px]">
                Un número que crece al cerrar brechas y mejorar tu CV.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-white/[.08] border border-white/10 p-4">
              <p className="font-semibold">Perfil 360 vivo</p>
              <p className="text-sm text-white/55">
                UTP + LinkedIn + GitHub, sincronizado solo.
              </p>
            </div>
            <div className="rounded-2xl bg-white/[.08] border border-white/10 p-4">
              <p className="font-semibold">Match real</p>
              <p className="text-sm text-white/55">
                Vacantes reales de Perú, no genéricas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
