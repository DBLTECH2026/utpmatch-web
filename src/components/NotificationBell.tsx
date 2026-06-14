"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

/* ── Tipos ───────────────────────────────────────────────── */

interface StudentSession {
  id: number;
  asesor: string;
  especialidad: string | null;
  estado: "solicitada" | "confirmada" | "completada" | "cancelada";
  fecha: string | null;
  notas: string | null;
  zoom_link: string | null;
}

interface AsesorSession {
  id: number;
  usuario: string;
  carrera: string | null;
  estado: "solicitada" | "confirmada" | "completada" | "cancelada";
  fecha: string | null;
  notas: string | null;
}

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })
    + " · " + d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

const ESTADO_COLOR: Record<string, string> = {
  solicitada: "bg-amber-100 text-amber-700",
  confirmada: "bg-teal/15 text-teal",
  completada: "bg-gray-100 text-gris",
  cancelada:  "bg-red-50 text-red-400",
};
const ESTADO_LABEL: Record<string, string> = {
  solicitada: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada:  "Cancelada",
};

/* ── Props ───────────────────────────────────────────────── */

interface Props {
  /** true = fondo oscuro (topbar móvil), false = fondo blanco (header de página) */
  dark?: boolean;
  /** "asesor" = muestra reservas pendientes del asesor */
  mode?: "alumno" | "asesor";
}

/* ── Componente ──────────────────────────────────────────── */

export function NotificationBell({ dark = false, mode = "alumno" }: Props) {
  const [studentSessions, setStudentSessions] = useState<StudentSession[]>([]);
  const [asesorSessions,  setAsesorSessions]  = useState<AsesorSession[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "asesor") {
      api<{ data: AsesorSession[] }>("/advisor/reservas").then(r => setAsesorSessions(r.data)).catch(() => {});
    } else {
      api<{ data: StudentSession[] }>("/my-sessions").then(r => setStudentSessions(r.data)).catch(() => {});
    }
  }, [mode]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const badge = mode === "asesor"
    ? asesorSessions.filter(s => s.estado === "solicitada").length
    : studentSessions.filter(s => s.estado === "solicitada").length
      + studentSessions.filter(s => s.estado === "confirmada" && s.fecha && new Date(s.fecha) > new Date()).length;

  const total = mode === "asesor" ? asesorSessions.length : studentSessions.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative w-9 h-9 flex items-center justify-center rounded-full transition ${
          dark ? "hover:bg-white/10" : "hover:bg-gray-100"
        }`}
      >
        <i className={`bx bx-bell text-xl ${dark ? "text-white" : "text-tinta"}`} />
        {badge > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rojo text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden" style={{ width: 300 }}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-bold text-sm text-gray-900">
              {mode === "asesor" ? "Reservas" : "Mis asesorías"}
            </span>
            <span className="text-xs text-gris">{total} en total</span>
          </div>
          {mode === "asesor"
            ? <AsesorDropdown sessions={asesorSessions} />
            : <StudentDropdown sessions={studentSessions} />
          }
        </div>
      )}
    </div>
  );
}

/* ── Dropdowns ───────────────────────────────────────────── */

function StudentDropdown({ sessions }: { sessions: StudentSession[] }) {
  if (sessions.length === 0) {
    return <Empty text="Aún no tienes sesiones solicitadas" />;
  }
  return (
    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
      {sessions.map(s => (
        <div key={s.id} className="px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-semibold text-sm text-gray-900 truncate">{s.asesor}</p>
            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${ESTADO_COLOR[s.estado]}`}>
              {ESTADO_LABEL[s.estado]}
            </span>
          </div>
          {s.especialidad && <p className="text-xs text-gris">{s.especialidad}</p>}
          {s.fecha && s.estado === "confirmada" && (
            <p className="text-xs text-teal font-medium mt-1 flex items-center gap-1">
              <i className="bx bx-calendar-check" /> {formatFecha(s.fecha)}
            </p>
          )}
          {s.notas && (
            <p className="text-xs text-gris mt-1 bg-gray-50 rounded-lg px-2 py-1.5 line-clamp-2">{s.notas}</p>
          )}
          {s.zoom_link && s.estado === "confirmada" && (
            <a
              href={s.zoom_link} target="_blank" rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-teal hover:underline"
            >
              <i className="bx bx-video" /> Unirse a la reunión
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function AsesorDropdown({ sessions }: { sessions: AsesorSession[] }) {
  if (sessions.length === 0) {
    return <Empty text="Sin reservas por el momento" />;
  }
  const pending = sessions.filter(s => s.estado === "solicitada");
  const rest    = sessions.filter(s => s.estado !== "solicitada");
  const ordered = [...pending, ...rest];
  return (
    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
      {ordered.map(s => (
        <div key={s.id} className="px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <img src="/user.svg" alt="avatar" className="w-6 h-6 rounded-full shrink-0" />
              <p className="font-semibold text-sm text-gray-900 truncate">{s.usuario}</p>
            </div>
            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${ESTADO_COLOR[s.estado]}`}>
              {ESTADO_LABEL[s.estado]}
            </span>
          </div>
          {s.carrera && <p className="text-xs text-gris pl-8">{s.carrera}</p>}
          {s.fecha && s.estado === "confirmada" && (
            <p className="text-xs text-teal font-medium mt-1 pl-8 flex items-center gap-1">
              <i className="bx bx-calendar-check" /> {formatFecha(s.fecha)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="px-4 py-6 text-center text-sm text-gris">{text}</div>;
}
