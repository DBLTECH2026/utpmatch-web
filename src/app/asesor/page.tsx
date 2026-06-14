"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { AdvisorDashboardData, AdvisorSession } from "@/lib/types";
import { NotificationBell } from "@/components/NotificationBell";

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short" })
    + " · " + d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function SessionCard({ s }: { s: AdvisorSession }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100">
      <img src="/user.svg" alt="avatar" className="w-9 h-9 rounded-full shrink-0" />
      <div className="min-w-0">
        <p className="font-semibold text-sm truncate">{s.usuario}</p>
        <p className="text-xs text-gris truncate">{[s.carrera, s.ciclo ? `Ciclo ${s.ciclo}` : null].filter(Boolean).join(" · ")}</p>
        {s.fecha && <p className="text-xs text-teal font-medium mt-0.5">{formatFecha(s.fecha)}</p>}
        {s.notas && <p className="text-xs text-gris mt-1 line-clamp-2">{s.notas}</p>}
      </div>
    </div>
  );
}

export default function AsesorDashboardPage() {
  const router = useRouter();
  const [d, setD] = useState<AdvisorDashboardData | null>(null);

  useEffect(() => {
    api<{ data: AdvisorDashboardData }>("/advisor/dashboard").then(r => setD(r.data)).catch(() => {});
  }, []);

  if (!d) return (
    <div className="flex flex-col min-h-screen animate-pulse p-6 gap-4">
      <div className="h-6 w-48 rounded-xl bg-gray-200" />
      <div className="h-28 rounded-2xl bg-gray-200" />
      <div className="h-40 rounded-2xl bg-gray-200" />
    </div>
  );

  const stats = [
    { label: "Pendientes",  value: d.pendientes,  color: "bg-amber-50 text-amber-600",   icon: "bx-time-five" },
    { label: "Confirmadas", value: d.confirmadas,  color: "bg-teal/10 text-teal",         icon: "bx-calendar-check" },
    { label: "Completadas", value: d.completadas,  color: "bg-gray-100 text-gris",        icon: "bx-check-circle" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-5 sm:px-9 py-5 bg-white border-b border-gray-100">
        <div>
          <p className="text-gris text-[13px]">Panel de asesor</p>
          <h1 className="text-xl font-extrabold leading-tight">{d.nombre}</h1>
        </div>
        <div className="hidden lg:flex"><NotificationBell mode="asesor" /></div>
      </header>

      <div className="flex-1 p-5 sm:p-9 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(s => (
            <div key={s.label} className={`rounded-2xl p-4 flex flex-col items-center gap-1 ${s.color}`}>
              <i className={`bx ${s.icon} text-2xl`} />
              <span className="text-2xl font-extrabold">{s.value}</span>
              <span className="text-[11px] font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Sesiones de hoy */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[15px]">Sesiones de hoy</h2>
            <button onClick={() => router.push("/asesor/reservas")} className="text-xs text-teal font-semibold">
              Ver todo →
            </button>
          </div>
          {d.hoy.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-6 text-center text-gris text-sm">
              Sin sesiones programadas para hoy
            </div>
          ) : (
            <div className="space-y-2">
              {d.hoy.map(s => <SessionCard key={s.id} s={s} />)}
            </div>
          )}
        </div>

        {/* Próximas */}
        {d.proximas.length > 0 && (
          <div>
            <h2 className="font-bold text-[15px] mb-3">Próximas sesiones</h2>
            <div className="space-y-2">
              {d.proximas.map(s => <SessionCard key={s.id} s={s} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
