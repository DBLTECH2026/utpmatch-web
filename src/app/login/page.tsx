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
      <div className="flex flex-col justify-center px-8 sm:px-14 py-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-24 w-72 h-72 rounded-full bg-rojoT -z-0" />
        <div className="relative z-10 max-w-[420px] w-full mx-auto">
          <Logo size={88} />
          <h1 className="mt-7 text-[40px] leading-[1.05] font-extrabold">
            Encuentra tu
            <br />
            <span className="bg-gradient-to-r from-rojo to-teal bg-clip-text text-transparent">
              match laboral.
            </span>
          </h1>
          <p className="mt-3 text-gris">
            Ingresa con tu cuenta para continuar tu ruta.
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
          </form>

          <p className="mt-5 text-sm text-gris">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-semibold text-rojo">
              Regístrate
            </Link>
          </p>
        </div>
      </div>

      {/* Columna marca */}
      <div className="hidden lg:flex flex-col justify-center bg-tinta text-white p-14 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-rojo/20" />
        <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-teal/20" />
        <div className="relative z-10 max-w-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-white/50">
            Empleabilidad Score
          </p>
          <p className="mt-2 text-white/85 text-lg">
            Un número que crece al cerrar brechas y mejorar tu CV.
          </p>
          <div className="mt-8 space-y-3">
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
