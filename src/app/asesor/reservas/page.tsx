"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { AdvisorSession } from "@/lib/types";
import { NotificationBell } from "@/components/NotificationBell";

type Filtro = "todas" | "solicitada" | "confirmada" | "completada" | "cancelada";

const ESTADO_LABEL: Record<string, string> = {
  solicitada:  "Pendiente",
  confirmada:  "Confirmada",
  completada:  "Completada",
  cancelada:   "Cancelada",
};
const ESTADO_COLOR: Record<string, string> = {
  solicitada:  "bg-amber-100 text-amber-700",
  confirmada:  "bg-teal/15 text-teal",
  completada:  "bg-gray-100 text-gris",
  cancelada:   "bg-red-50 text-red-500",
};

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })
    + " a las " + d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

export default function ReservasPage() {
  const [sessions, setSessions] = useState<AdvisorSession[]>([]);
  const [filtro, setFiltro]     = useState<Filtro>("todas");
  const [agendando, setAgendando] = useState<number | null>(null);
  const [fecha, setFecha]       = useState("");
  const [notas, setNotas]       = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api<{ data: AdvisorSession[] }>("/advisor/reservas");
      setSessions(r.data);
    } catch { /* noop */ }
  }

  async function agendar(id: number) {
    if (!fecha) { toast.error("Selecciona fecha y hora."); return; }
    setSaving(true);
    try {
      await api(`/advisor/sessions/${id}/schedule`, {
        method: "PUT",
        body: { fecha, notas: notas || null, zoom_link: zoomLink || null },
      });
      toast.success("Sesión agendada. El alumno será notificado.");
      setAgendando(null);
      setFecha(""); setNotas(""); setZoomLink("");
      await load();
    } catch {
      toast.error("Error al agendar.");
    } finally {
      setSaving(false);
    }
  }

  async function cambiarEstado(id: number, estado: string) {
    try {
      await api(`/advisor/sessions/${id}/status`, {
        method: "PUT",
        body: { estado },
      });
      toast.success("Estado actualizado.");
      await load();
    } catch {
      toast.error("Error al actualizar.");
    }
  }

  const lista = filtro === "todas" ? sessions : sessions.filter(s => s.estado === filtro);
  const filtros: { key: Filtro; label: string }[] = [
    { key: "todas",      label: "Todas" },
    { key: "solicitada", label: "Pendientes" },
    { key: "confirmada", label: "Confirmadas" },
    { key: "completada", label: "Completadas" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-5 sm:px-9 py-5 bg-white border-b border-gray-100">
        <div>
          <h1 className="text-xl font-extrabold">Reservas</h1>
          <p className="text-sm text-gris mt-0.5">{sessions.length} solicitudes en total</p>
        </div>
        <div className="hidden lg:flex"><NotificationBell mode="asesor" /></div>
      </header>

      <div className="flex-1 p-5 sm:p-9">
        {/* Filtros */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {filtros.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                filtro === f.key ? "bg-tinta text-white" : "bg-white border border-gray-200 text-gris hover:border-tinta"
              }`}
            >
              {f.label}
              {f.key !== "todas" && (
                <span className="ml-1 opacity-60">
                  ({sessions.filter(s => s.estado === f.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {lista.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center text-gris text-sm">
            Sin reservas en esta categoría
          </div>
        ) : (
          <div className="space-y-3">
            {lista.map(s => (
              <div key={s.id} className="rounded-2xl bg-white border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img src="/user.svg" alt="avatar" className="w-10 h-10 rounded-full shrink-0" />
                    <div>
                      <p className="font-semibold">{s.usuario}</p>
                      <p className="text-xs text-gris">{[s.carrera, s.ciclo ? `Ciclo ${s.ciclo}` : null].filter(Boolean).join(" · ")}</p>
                      <p className="text-xs text-gris mt-0.5">{s.email}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${ESTADO_COLOR[s.estado]}`}>
                    {ESTADO_LABEL[s.estado]}
                  </span>
                </div>

                {s.fecha && (
                  <p className="mt-3 text-sm text-teal font-medium flex items-center gap-1.5">
                    <i className="bx bx-calendar-check" /> {formatFecha(s.fecha)}
                  </p>
                )}
                {s.notas && (
                  <p className="mt-2 text-sm text-gris bg-gray-50 rounded-xl px-3 py-2">{s.notas}</p>
                )}

                {/* Acciones */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.estado === "solicitada" && (
                    <button
                      onClick={() => { setAgendando(agendando === s.id ? null : s.id); setFecha(""); setNotas(""); setZoomLink(""); }}
                      className="px-4 py-1.5 rounded-lg bg-teal text-white text-xs font-semibold hover:bg-teal/90 transition"
                    >
                      <i className="bx bx-calendar mr-1" /> Agendar
                    </button>
                  )}
                  {s.estado === "confirmada" && s.zoom_link && (
                    <a
                      href={s.zoom_link} target="_blank" rel="noopener noreferrer"
                      className="px-4 py-1.5 rounded-lg bg-teal text-white text-xs font-semibold hover:bg-teal/90 transition flex items-center gap-1"
                    >
                      <i className="bx bx-video" /> Unirse a reunión
                    </a>
                  )}
                  {s.estado === "confirmada" && (
                    <button
                      onClick={() => cambiarEstado(s.id, "completada")}
                      className="px-4 py-1.5 rounded-lg bg-gray-100 text-gris text-xs font-semibold hover:bg-gray-200 transition"
                    >
                      <i className="bx bx-check mr-1" /> Marcar completada
                    </button>
                  )}
                  {(s.estado === "solicitada" || s.estado === "confirmada") && (
                    <button
                      onClick={() => cambiarEstado(s.id, "cancelada")}
                      className="px-4 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                {/* Formulario de agendamiento inline */}
                {agendando === s.id && (
                  <div className="mt-4 p-4 rounded-xl bg-teal/5 border border-teal/20 space-y-3">
                    <p className="text-sm font-semibold text-teal">Confirmar sesión</p>
                    <input
                      type="datetime-local"
                      value={fecha}
                      onChange={e => setFecha(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                    />
                    <div className="relative">
                      <i className="bx bx-video absolute left-3 top-1/2 -translate-y-1/2 text-teal text-base" />
                      <input
                        type="url"
                        value={zoomLink}
                        onChange={e => setZoomLink(e.target.value)}
                        placeholder="Link de reunión (Zoom, Google Meet, Teams…)"
                        className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                      />
                    </div>
                    <textarea
                      value={notas}
                      onChange={e => setNotas(e.target.value)}
                      placeholder="Notas para el alumno (opcional)…"
                      rows={2}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal/40"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => agendar(s.id)}
                        disabled={saving}
                        className="flex-1 py-2 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition"
                      >
                        {saving ? "Agendando…" : "Confirmar"}
                      </button>
                      <button
                        onClick={() => setAgendando(null)}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gris text-sm font-semibold hover:bg-gray-200 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
