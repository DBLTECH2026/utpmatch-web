"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { DashboardData } from "@/lib/types";
import { NotificationBell } from "@/components/NotificationBell";

interface MySession {
  id: number;
  asesor: string;
  especialidad: string | null;
  estado: string;
  fecha: string | null;
  notas: string | null;
  zoom_link: string | null;
}

/** Dashboard — "viaje" del alumno: banner hoy→meta + timeline + KPIs + copiloto. */
export default function DashboardPage() {
  const router = useRouter();
  const [d, setD] = useState<DashboardData | null>(null);
  const [proximaSesion, setProximaSesion] = useState<MySession | null>(null);

  function fetchSesion() {
    api<{ data: MySession[] }>("/my-sessions").then((r) => {
      const confirmed = r.data
        .filter(s => s.estado === "confirmada" && s.fecha)
        .sort((a, b) => new Date(a.fecha!).getTime() - new Date(b.fecha!).getTime());
      setProximaSesion(confirmed[0] ?? null);
    }).catch(() => {});
  }

  useEffect(() => {
    api<{ data: DashboardData }>("/dashboard").then((r) => setD(r.data)).catch(() => {});
    fetchSesion();
    const interval = setInterval(fetchSesion, 15_000);
    return () => clearInterval(interval);
  }, []);

  if (!d) {
    return (
      <div className="flex flex-col min-h-screen animate-pulse p-6 gap-4">
        <div className="h-6 w-48 rounded-xl bg-gray-200" />
        <div className="h-32 rounded-2xl bg-gray-200" />
        <div className="h-24 rounded-2xl bg-gray-200" />
        <div className="h-24 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  const hitos = [
    { label: "Bases", sub: "Python · Git · SQL", color: "bg-teal", icon: "bx-check", text: "" },
    ...d.ruta.slice(0, 2).map((p) => ({
      label: p.skill,
      sub: p.taller ?? `${p.demanda_pct}% demanda`,
      color: p.estado === "en_curso" ? "bg-rojo" : "bg-gray-200",
      icon: p.estado === "en_curso" ? "bx-right-arrow-alt" : "",
      text: p.estado === "en_curso" ? "" : String(p.orden),
    })),
    { label: "¡Postular!", sub: `${d.vacantes} vacantes`, color: "bg-tinta", icon: "bxs-bullseye", text: "" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-5 sm:px-9 py-5 bg-white border-b border-gray-100">
        <div>
          <p className="text-gris text-[13px]">Buenos días,</p>
          <h1 className="text-lg sm:text-xl font-extrabold leading-tight">{d.usuario}</h1>
        </div>
        <div className="hidden lg:flex"><NotificationBell /></div>
      </header>

      <div className="p-4 sm:p-6 lg:p-9">
        {/* Próxima asesoría confirmada */}
        {proximaSesion && (
          <div className="mb-5 rounded-2xl bg-teal/10 border border-teal/25 px-5 py-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center shrink-0">
              <i className="bx bx-calendar-check text-white text-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-teal mb-0.5">Próxima asesoría confirmada</p>
              <p className="font-semibold text-sm">{proximaSesion.asesor}
                {proximaSesion.especialidad && <span className="text-gris font-normal"> · {proximaSesion.especialidad}</span>}
              </p>
              <p className="text-sm text-teal font-medium mt-0.5">
                {new Date(proximaSesion.fecha!).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
                {" a las "}
                {new Date(proximaSesion.fecha!).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
              </p>
              {proximaSesion.notas && <p className="text-xs text-gris mt-1">{proximaSesion.notas}</p>}
              {proximaSesion.zoom_link && (
                <a
                  href={proximaSesion.zoom_link} target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal/90 transition"
                >
                  <i className="bx bx-video" /> Unirse a la reunión
                </a>
              )}
            </div>
          </div>
        )}

        {/* Banner del viaje */}
        <div className="rounded-3xl bg-tinta text-white p-5 sm:p-7 mb-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
          <div className="relative w-[96px] h-[96px] shrink-0">
            <svg className="w-[96px] h-[96px]" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,.13)" strokeWidth="9" fill="none" />
              <circle cx="48" cy="48" r="40" stroke="#13A07C" strokeWidth="9" fill="none" strokeLinecap="round"
                strokeDasharray={251} strokeDashoffset={251 - (251 * d.score) / 100} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[28px] font-extrabold">{d.score}</span>
              <span className="text-[9px] text-white/50">SCORE</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
              Tu viaje a {d.rol_objetivo}
            </p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[11px] text-white/50">hoy</p>
                <p className="text-3xl font-extrabold">{d.match_actual}%</p>
              </div>
              <div className="flex-1 h-2.5 rounded-full bg-white/15 relative">
                <div className="absolute h-2.5 rounded-full bg-gradient-to-r from-teal to-teal2"
                  style={{ width: `${d.match_actual}%` }} />
                <div className="absolute h-5 w-5 rounded-full bg-white border-2 border-teal -top-1.5"
                  style={{ left: `${Math.max(0, d.match_actual - 2)}%` }} />
              </div>
              <div className="text-center">
                <p className="text-[11px] text-white/50">meta</p>
                <p className="text-3xl font-extrabold text-teal">{d.match_meta}%</p>
              </div>
            </div>
            <p className="text-[13px] text-white/70 mt-3">
              Completa tus talleres y subes <b className="text-teal">+{d.match_meta - d.match_actual}% de match</b>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline + KPIs */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 p-5 sm:p-6">
            <h3 className="font-extrabold text-lg mb-5">Tu ruta paso a paso</h3>
            <div className="flex items-stretch gap-0">
              {hitos.map((h, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className={`w-11 h-11 mx-auto rounded-full ${h.color} flex items-center justify-center text-white font-bold`}>
                    {h.icon ? <i className={`bx ${h.icon} text-xl`} /> : h.text}
                  </div>
                  <p className="font-semibold text-sm mt-2">{h.label}</p>
                  <p className="text-[11px] text-gris">{h.sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <Kpi value={`${d.match_actual}%`} label="match actual" color="text-teal" />
              <Kpi value={String(d.brechas)} label="brechas" />
              <Kpi value={String(d.vacantes)} label="vacantes" />
            </div>
          </div>

          {/* Copiloto */}
          <div className="rounded-2xl bg-white border border-gray-100 p-5 sm:p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-rojo flex items-center justify-center text-white text-xs font-bold">IA</div>
              <h3 className="font-extrabold">Copiloto</h3>
              <span className="ml-auto text-[11px] text-teal">● activo</span>
            </div>
            {d.nudge ? (
              <>
                <div className="rounded-2xl bg-rojoT p-4 text-[13px] mb-3">{d.nudge.mensaje}</div>
                {d.nudge.cta_label && (
                  <button
                    onClick={() => d.nudge?.cta_route && router.push(d.nudge.cta_route)}
                    className="inline-flex w-max items-center gap-1.5 rounded-full bg-rojo px-3 py-1.5 text-[12.5px] font-semibold text-white"
                  >
                    {d.nudge.cta_label} <i className="bx bx-right-arrow-alt" />
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-gris">Sin avisos nuevos.</p>
            )}
            <button
              onClick={() => router.push("/dashboard/copiloto")}
              className="mt-auto text-sm font-semibold text-rojo text-left"
            >
              Abrir chat del copiloto <i className="bx bx-right-arrow-alt" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ value, label, color = "text-tinta" }: { value: string; label: string; color?: string }) {
  return (
    <div className="rounded-xl bg-niebla p-4">
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="text-xs text-gris">{label}</p>
    </div>
  );
}
