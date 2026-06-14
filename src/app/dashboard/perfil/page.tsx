"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Career, Profile } from "@/lib/types";
import { Button, Field, Select } from "@/components/ui";

export default function PerfilPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ rol_objetivo: "", headline: "", about: "" });

  // Roles disponibles según la carrera del alumno.
  const rolesDisponibles =
    careers.find((c) => c.carrera === user?.carrera)?.roles ?? [];

  // Cargar catálogo de carreras (para el selector de rol objetivo).
  useEffect(() => {
    api<{ data: Career[] }>("/careers", { auth: false })
      .then((r) => setCareers(r.data))
      .catch(() => {});
  }, []);

  // Cargar perfil real desde la API.
  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: Profile }>("/profile");
        setProfile(res.data);
        setForm({
          rol_objetivo: res.data.rol_objetivo ?? "",
          headline: res.data.headline ?? "",
          about: res.data.about ?? "",
        });
      } catch {
        // perfil vacío
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await api<{ data: Profile }>("/profile", {
        method: "PUT",
        body: form,
      });
      setProfile(res.data);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-9 py-5 bg-white border-b border-gray-100">
        <h1 className="text-xl font-extrabold">Perfil 360</h1>
        <div className="w-10 h-10 rounded-full bg-rojoT flex items-center justify-center font-bold text-rojo">
          {user?.name?.slice(0, 2).toUpperCase()}
        </div>
      </header>

      <div className="p-9 grid lg:grid-cols-2 gap-6">
        {/* Datos del usuario + score */}
        <section className="space-y-6">
          <div className="rounded-3xl bg-tinta text-white p-6 flex items-center gap-5">
            <div className="relative w-[96px] h-[96px] shrink-0">
              <svg
                className="w-[96px] h-[96px]"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,.13)" strokeWidth="9" fill="none" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#13A07C"
                  strokeWidth="9"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={251}
                  strokeDashoffset={251 - (251 * (profile?.empleabilidad_score ?? 0)) / 100}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[28px] font-extrabold">
                  {profile?.empleabilidad_score ?? 0}
                </span>
                <span className="text-[9px] text-white/50">SCORE</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50">
                Empleabilidad Score
              </p>
              <p className="mt-1 text-white/85 text-sm">
                Crece al cerrar brechas y mejorar tu CV.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gris mb-3">
              Datos institucionales
            </p>
            <dl className="space-y-2 text-sm">
              <Row k="Nombre" v={user?.name} />
              <Row k="Correo" v={user?.email} />
              <Row k="Código UTP" v={user?.codigo_utp ?? "—"} />
              <Row k="Carrera" v={user?.carrera ?? "—"} />
              <Row k="Ciclo" v={user?.ciclo ? `${user.ciclo}.º` : "—"} />
            </dl>
          </div>

          {profile?.skills && profile.skills.length > 0 && (
            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-teal2 mb-3">
                Tus skills
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-tealT px-3 py-1.5 text-[13px] font-semibold text-teal2"
                  >
                    {s.verificado && <i className="bx bx-check" />} {s.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Editor del perfil */}
        <section>
          <form
            onSubmit={save}
            className="rounded-2xl bg-white border border-gray-100 p-6 space-y-4"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-gris">
              Editar perfil
            </p>
            <Select
              label={`Rol objetivo (meta) · ${user?.carrera ?? "tu carrera"}`}
              placeholder="Selecciona tu meta"
              options={rolesDisponibles}
              value={form.rol_objetivo}
              onChange={(e) => setForm({ ...form, rol_objetivo: e.target.value })}
            />
            <Field
              label="Headline"
              placeholder="Tu titular profesional"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
            />
            <label className="block">
              <span className="text-[13px] font-semibold text-tinta">Sobre mí</span>
              <textarea
                rows={5}
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-teal/30"
                placeholder="Cuéntanos sobre ti…"
              />
            </label>

            {saved && (
              <p className="rounded-xl bg-tealT px-4 py-3 text-sm text-teal2">
                Perfil actualizado
              </p>
            )}

            <Button type="submit" variant="teal" disabled={saving || loading}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gris">{k}</dt>
      <dd className="font-semibold text-tinta">{v}</dd>
    </div>
  );
}
