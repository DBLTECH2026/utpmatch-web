"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

/** Dashboard — "viaje" del alumno: banner hoy→meta + timeline + KPIs + copiloto. */
export default function DashboardPage() {
  const router = useRouter();
  const [d, setD] = useState<DashboardData | null>(null);

  useEffect(() => {
    api<{ data: DashboardData }>("/dashboard").then((r) => setD(r.data)).catch(() => {});
  }, []);

  if (!d) {
    return <div className="grid place-items-center min-h-screen text-gris">Cargando…</div>;
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
      <header className="flex items-center justify-between px-9 py-5 bg-white border-b border-gray-100">
        <div>
          <p className="text-gris text-[13px]">Buenos días,</p>
          <h1 className="text-xl font-extrabold leading-tight">{d.usuario}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-rojoT flex items-center justify-center font-bold text-rojo">
          {d.usuario.slice(0, 2).toUpperCase()}
        </div>
      </header>

      <div className="p-9">
        {/* Banner del viaje */}
        <div className="rounded-3xl bg-tinta text-white p-7 mb-6 flex items-center gap-8">
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

        <div className="grid grid-cols-3 gap-6">
          {/* Timeline + KPIs */}
          <div className="col-span-2 rounded-2xl bg-white border border-gray-100 p-6">
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
          <div className="rounded-2xl bg-white border border-gray-100 p-6 flex flex-col">
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
