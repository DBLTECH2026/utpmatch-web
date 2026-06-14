"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { AdvisorSession } from "@/lib/types";
import { NotificationBell } from "@/components/NotificationBell";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function pad2(n: number) { return n.toString().padStart(2, "0"); }

function isoDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

export default function CalendarioPage() {
  const [sessions, setSessions] = useState<AdvisorSession[]>([]);
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string>(isoDate(today));

  useEffect(() => {
    api<{ data: AdvisorSession[] }>("/advisor/reservas")
      .then(r => setSessions(r.data))
      .catch(() => {});
  }, []);

  // Mapa: "YYYY-MM-DD" → sesiones confirmadas ese día
  const sessionsByDay = useMemo(() => {
    const map: Record<string, AdvisorSession[]> = {};
    sessions.forEach(s => {
      if (!s.fecha || s.estado !== "confirmada") return;
      const key = isoDate(new Date(s.fecha));
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [sessions]);

  // Días del mes
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const selectedSessions = sessionsByDay[selected] ?? [];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-5 sm:px-9 py-5 bg-white border-b border-gray-100">
        <div>
          <h1 className="text-xl font-extrabold">Calendario</h1>
          <p className="text-sm text-gris mt-0.5">Sesiones confirmadas</p>
        </div>
        <div className="hidden lg:flex"><NotificationBell mode="asesor" /></div>
      </header>

      <div className="flex-1 p-5 sm:p-9 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Calendario */}
        <div className="rounded-2xl bg-white border border-gray-100 p-5">
          {/* Nav mes */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prev} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
              <i className="bx bx-chevron-left text-xl" />
            </button>
            <span className="font-extrabold text-base">{MESES[month]} {year}</span>
            <button onClick={next} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
              <i className="bx bx-chevron-right text-xl" />
            </button>
          </div>

          {/* Cabeceras días */}
          <div className="grid grid-cols-7 mb-2">
            {DIAS.map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-gris py-1">{d}</div>
            ))}
          </div>

          {/* Celdas */}
          <div className="grid grid-cols-7 gap-y-1">
            {/* Espacios vacíos al inicio */}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day  = i + 1;
              const key  = `${year}-${pad2(month + 1)}-${pad2(day)}`;
              const hasSessions = !!sessionsByDay[key]?.length;
              const isToday     = key === isoDate(today);
              const isSel       = key === selected;

              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition
                    ${isSel   ? "bg-tinta text-white" :
                      isToday ? "bg-teal/15 text-teal font-bold" :
                                "hover:bg-gray-100 text-gray-700"}
                  `}
                >
                  {day}
                  {hasSessions && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSel ? "bg-teal" : "bg-teal"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel lateral: sesiones del día seleccionado */}
        <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-3">
          <h2 className="font-bold text-[15px]">
            {new Date(selected + "T12:00:00").toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
          </h2>

          {selectedSessions.length === 0 ? (
            <p className="text-sm text-gris py-4 text-center">Sin sesiones este día</p>
          ) : (
            selectedSessions.map(s => (
              <div key={s.id} className="p-3 rounded-xl bg-teal/5 border border-teal/20">
                <div className="flex items-center gap-2 mb-1">
                  <i className="bx bx-time text-teal text-sm" />
                  <span className="text-sm font-bold text-teal">{formatHora(s.fecha!)}</span>
                </div>
                <p className="font-semibold text-sm">{s.usuario}</p>
                <p className="text-xs text-gris">{[s.carrera, s.ciclo ? `Ciclo ${s.ciclo}` : null].filter(Boolean).join(" · ")}</p>
                {s.notas && <p className="text-xs text-gris mt-1.5 bg-white rounded-lg p-2">{s.notas}</p>}
              </div>
            ))
          )}

          {/* Resumen del mes */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gris font-semibold uppercase tracking-wide mb-2">Este mes</p>
            <p className="text-sm">
              <span className="font-bold text-teal">{Object.values(sessionsByDay).flat().length}</span>
              {" "}sesiones confirmadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
