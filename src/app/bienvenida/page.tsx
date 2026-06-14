"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Career } from "@/lib/types";
import { Logo } from "@/components/ui";

// Icono boxicons por rol (heurística por palabra clave).
function rolIcon(rol: string): string {
  const r = rol.toLowerCase();
  if (r.includes("frontend")) return "bx-code-alt";
  if (r.includes("backend")) return "bx-server";
  if (r.includes("data")) return "bx-bar-chart-alt-2";
  if (r.includes("qa") || r.includes("testing")) return "bx-bug";
  if (r.includes("proceso")) return "bx-trending-up";
  if (r.includes("logística") || r.includes("logistica")) return "bx-package";
  if (r.includes("calidad")) return "bx-badge-check";
  if (r.includes("operaciones")) return "bx-cog";
  if (r.includes("legal") || r.includes("abogado")) return "bx-shield";
  if (r.includes("tributario") || r.includes("contable") || r.includes("costos")) return "bx-calculator";
  if (r.includes("auditor")) return "bx-search-alt";
  return "bx-target-lock";
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

export default function BienvenidaPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    api<{ data: Career[] }>("/careers", { auth: false }).then((r) => setCareers(r.data)).catch(() => {});
  }, []);

  if (loading || !user) {
    return <div className="grid place-items-center min-h-screen text-gris">Cargando…</div>;
  }

  const roles = careers.find((c) => c.carrera === user.carrera)?.roles ?? [];
  const skills = user.profile?.skills ?? [];
  const cursos = user.courses ?? [];

  async function elegir(rol: string) {
    setSaving(rol);
    try {
      // Setear la meta recalcula ruta/brechas en el backend.
      await api("/route/target", { method: "PUT", body: { rol_objetivo: rol } });
      await refresh();
      router.push("/dashboard");
    } catch {
      setSaving(null);
    }
  }

  return (
    <main className="min-h-screen bg-niebla">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Saludo */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Logo size={56} />
          <h1 className="mt-5 text-[34px] font-extrabold leading-tight flex items-center gap-2">
            Hola, {user.name.split(" ")[0]}
            <i className="bx bx-hand text-rojo" />
          </h1>
          <p className="text-gris mt-1">
            Bienvenida a <b className="text-tinta">UTP+Match</b>. Ya importamos tu información de la UTP. Elige tu meta y armamos tu ruta.
          </p>
        </motion.div>

        {/* Resumen UTP */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-3 gap-4 mt-8"
        >
          <motion.div variants={item} className="rounded-2xl bg-white border border-gray-100 p-5">
            <i className="bx bx-book-open text-rojo text-2xl" />
            <p className="text-2xl font-extrabold mt-2">Ciclo {user.ciclo ?? "—"}</p>
            <p className="text-xs text-gris">{user.carrera}</p>
          </motion.div>
          <motion.div variants={item} className="rounded-2xl bg-white border border-gray-100 p-5">
            <i className="bx bx-list-check text-teal text-2xl" />
            <p className="text-2xl font-extrabold mt-2">{cursos.length} cursos</p>
            <p className="text-xs text-gris">importados de UTP</p>
          </motion.div>
          <motion.div variants={item} className="rounded-2xl bg-white border border-gray-100 p-5">
            <i className="bx bx-bulb text-rojo text-2xl" />
            <p className="text-2xl font-extrabold mt-2">{skills.length} skills</p>
            <p className="text-xs text-gris">en tu perfil</p>
          </motion.div>
        </motion.div>

        {/* Skills + cursos */}
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <motion.div variants={item} initial="hidden" animate="show" className="rounded-2xl bg-white border border-gray-100 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-teal2 mb-3">Tus skills</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s.id} className="rounded-full bg-tealT px-3 py-1.5 text-[13px] font-semibold text-teal2">
                  {s.verificado && <i className="bx bx-check" />} {s.nombre}
                </span>
              ))}
              {skills.length === 0 && <span className="text-sm text-gris">Aún sin skills.</span>}
            </div>
          </motion.div>
          <motion.div variants={item} initial="hidden" animate="show" className="rounded-2xl bg-white border border-gray-100 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gris mb-3">Cursos UTP</p>
            <ul className="space-y-1.5 text-sm">
              {cursos.slice(0, 5).map((c) => (
                <li key={c.nombre} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className={`bx ${c.estado === "aprobado" ? "bx-check-circle text-teal" : "bx-time text-gris"}`} />
                    {c.nombre}
                  </span>
                  <span className="text-gris">{c.nota ?? "—"}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Elegir rol */}
        <div className="mt-10">
          <h2 className="text-xl font-extrabold">¿Qué quieres ser?</h2>
          <p className="text-gris text-sm mb-5">
            Elige tu rol objetivo de {user.carrera}. Podrás cambiarlo cuando quieras — tu ruta se recalcula sola.
          </p>
          <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((rol) => (
              <motion.button
                key={rol}
                variants={item}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!!saving}
                onClick={() => elegir(rol)}
                className="text-left rounded-2xl bg-white border-2 border-gray-100 hover:border-rojo p-5 transition disabled:opacity-60"
              >
                <div className="w-11 h-11 rounded-xl bg-rojoT flex items-center justify-center mb-3">
                  <i className={`bx ${rolIcon(rol)} text-rojo text-2xl`} />
                </div>
                <p className="font-bold">{rol}</p>
                <p className="text-xs text-gris mt-1">
                  {saving === rol ? "Armando tu ruta…" : "Ver mi ruta hacia esta meta"}
                </p>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
