"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { NotificationBell } from "@/components/NotificationBell";
import type { VacancyDetail } from "@/lib/types";
import { Button } from "@/components/ui";

/** Detalle de vacante — match + requisitos cumplidos/faltantes + postular. */
export default function VacanteDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [v, setV] = useState<VacancyDetail | null>(null);

  useEffect(() => {
    api<{ data: VacancyDetail }>(`/match/${id}`).then((r) => setV(r.data)).catch(() => {});
  }, [id]);

  if (!v) return (
    <div className="flex flex-col min-h-screen animate-pulse p-6 gap-4">
      <div className="h-6 w-48 rounded-xl bg-gray-200" />
      <div className="h-32 rounded-2xl bg-gray-200" />
      <div className="h-24 rounded-2xl bg-gray-200" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-5 sm:px-9 py-5 bg-white border-b border-gray-100">
        <button onClick={() => router.push("/dashboard/empleos")} className="flex items-center gap-2 text-gris text-sm">
          <i className="bx bx-left-arrow-alt" /> Empleos / <span className="text-tinta font-semibold">{v.titulo}</span>
        </button>
        <div className="hidden lg:flex"><NotificationBell /></div>
      </header>

      <div className="p-4 sm:p-6 lg:p-9 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl bg-white border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-1">
              <h1 className="text-2xl font-extrabold">{v.titulo}</h1>
              <span className="rounded-full bg-tealT px-3 py-1.5 text-base font-semibold text-teal2">
                {v.match_pct}% match
              </span>
            </div>
            <p className="text-gris mb-5">
              {[v.empresa, v.ubicacion, v.modalidad, v.salario].filter(Boolean).join(" · ")}
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-gris mb-2">Requisitos</p>
            <div className="grid grid-cols-2 gap-2 text-[14px]">
              {v.cumple.map((s) => (
                <div key={s} className="flex items-center gap-2"><i className="bx bx-check text-teal text-lg" /> {s}</div>
              ))}
              {v.faltantes.map((s) => (
                <div key={s} className="flex items-center gap-2"><i className="bx bx-x text-rojo text-lg" /> {s} (te falta)</div>
              ))}
            </div>
          </div>
          {v.faltantes.length > 0 && (
            <div className="rounded-2xl bg-tealT p-5 text-teal2 text-[15px] flex gap-2 items-center">
              <i className="bx bxs-bulb text-xl" />
              <span>Si cierras <b>{v.faltantes[0]}</b>, tu match sube y calificas a más vacantes.</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-rojoT p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-rojo mb-2">Qué te falta</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {v.faltantes.length > 0 ? v.faltantes.map((s) => (
                <span key={s} className="rounded-full bg-white px-3 py-1.5 text-[12.5px] font-semibold text-rojo">{s}</span>
              )) : <span className="text-sm text-teal2 flex items-center gap-1"><i className="bx bx-party" /> ¡Cumples todos los requisitos!</span>}
            </div>
          </div>
          <Button className="w-full">Postular con CV adaptado</Button>
          <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard/ruta")}>
            Ver ruta para cerrar brechas
          </Button>
        </div>
      </div>
    </div>
  );
}
