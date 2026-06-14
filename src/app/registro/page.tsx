"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { Career } from "@/lib/types";
import { Logo, Button, Field, Select } from "@/components/ui";

export default function RegistroPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    codigo_utp: "",
    carrera: "",
    ciclo: "",
  });
  const [careers, setCareers] = useState<Career[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar catálogo de carreras (público).
  useEffect(() => {
    api<{ data: Career[] }>("/careers", { auth: false })
      .then((r) => setCareers(r.data))
      .catch(() => {});
  }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGeneral(null);
    setLoading(true);
    try {
      await register({
        ...form,
        ciclo: form.ciclo ? Number(form.ciclo) : undefined,
        codigo_utp: form.codigo_utp || undefined,
      });
      router.push("/dashboard/perfil");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors);
        if (Object.keys(err.errors).length === 0) setGeneral(err.message);
      } else {
        setGeneral("Error al registrar.");
      }
    } finally {
      setLoading(false);
    }
  }

  const err = (f: string) => errors[f]?.[0];

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_20px_60px_-12px_rgba(20,20,30,0.18)] p-8 sm:p-10">
        <Logo size={72} />
        <h1 className="mt-5 text-[28px] font-extrabold leading-tight">
          Crea tu cuenta
        </h1>
        <p className="mt-1 text-gris text-sm">
          Empieza a construir tu ruta de empleabilidad.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field
            label="Nombre completo"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={err("name")}
            required
          />
          <Field
            label="Correo institucional"
            type="email"
            placeholder="tucodigo@utp.edu.pe"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            error={err("email")}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Código UTP"
              value={form.codigo_utp}
              onChange={(e) => set("codigo_utp", e.target.value)}
              error={err("codigo_utp")}
            />
            <Field
              label="Ciclo"
              type="number"
              min={1}
              max={12}
              value={form.ciclo}
              onChange={(e) => set("ciclo", e.target.value)}
              error={err("ciclo")}
            />
          </div>
          <Select
            label="Carrera"
            placeholder="Selecciona tu carrera"
            options={careers.map((c) => c.carrera)}
            value={form.carrera}
            onChange={(e) => set("carrera", e.target.value)}
            error={err("carrera")}
            required
          />
          <Field
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            error={err("password")}
            required
          />
          <Field
            label="Confirmar contraseña"
            type="password"
            value={form.password_confirmation}
            onChange={(e) => set("password_confirmation", e.target.value)}
            required
          />
          <p className="text-xs text-gris">
            Mínimo 8 caracteres, con mayúsculas, minúsculas, número y símbolo.
          </p>

          {general && (
            <p className="rounded-xl bg-rojoT px-4 py-3 text-sm text-rojo2">
              {general}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-gris text-center">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-rojo">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
