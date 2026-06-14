"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { GapsData, RouteData } from "@/lib/types";
import { NotificationBell } from "@/components/NotificationBell";

/** Ruta & Brechas — "ya tienes / te falta" + ruta priorizada hacia el rol. */
export default function RutaPage() {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [gaps, setGaps] = useState<GapsData | null>(null);

  async function load() {
    const [r, g] = await Promise.all([
      api<{ data: RouteData }>("/route"),
      api<{ data: GapsData }>("/gaps"),
    ]);
    setRoute(r.data);
    setGaps(g.data);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  if (!route || !gaps) {
    return (
      <div className="flex flex-col min-h-screen animate-pulse p-6 gap-4">
        <div className="h-6 w-48 rounded-xl bg-gray-200" />
        <div className="h-40 rounded-2xl bg-gray-200" />
        <div className="h-40 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-5 sm:px-9 py-5 bg-white border-b border-gray-100">
        <h1 className="text-xl font-extrabold">Ruta & Brechas</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-niebla">
            <span className="text-[13px] text-gris pl-2">Meta:</span>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow-sm">
              <span className="font-semibold text-[14px]">{route.rol_objetivo}</span>
            </div>
          </div>
          <div className="hidden lg:flex"><NotificationBell /></div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-9">
        {/* Ya tienes */}
        <div className="rounded-2xl bg-white border border-gray-100 p-5 mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-teal2 mb-2">Ya tienes (tu base)</p>
          <div className="flex flex-wrap gap-2">
            {gaps.tiene.map((s) => (
              <span key={s.skill_id} className="rounded-full bg-tealT px-3 py-1.5 text-[13px] font-semibold text-teal2">
<i className="bx bx-check" /> {s.nombre}
              </span>
            ))}
            {gaps.tiene.length === 0 && <span className="text-sm text-gris">Aún sin skills registradas.</span>}
          </div>
        </div>

        {/* Te falta · ruta priorizada */}
        <p className="text-xs font-bold uppercase tracking-widest text-rojo mb-3">
          Te falta · ruta priorizada hacia tu meta
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {route.pasos.map((p) => (
            <div key={p.orden} className="rounded-2xl bg-white border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className={`w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-bold ${
                  p.estado === "en_curso" ? "bg-rojo" : "bg-rojo/80"
                }`}>
                  {p.orden}
                </span>
                <span className="text-rojo text-xs font-bold">{p.demanda_pct}%</span>
              </div>
              <p className="font-semibold">{p.skill}</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
                <div className="h-1.5 bg-rojo rounded-full" style={{ width: `${p.demanda_pct}%` }} />
              </div>
              {p.taller && <p className="text-[11px] text-gris mt-2">Taller UTP: {p.taller}</p>}
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-tinta text-white p-5 flex items-center justify-between">
          <p className="text-[15px]">
            Completando la ruta: <b>Match {route.match_actual}% → <span className="text-teal">{route.match_meta}%</span></b> hacia {route.rol_objetivo}.
          </p>
          <i className="bx bxs-bullseye text-2xl text-teal" />
        </div>
      </div>
    </div>
  );
}
