"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";
import { confirmAction } from "@/lib/ui-feedback";
import { NotificationBell } from "@/components/NotificationBell";
import { toast } from "sonner";
import type { AdvisorItem } from "@/lib/types";
import { Button } from "@/components/ui";

const ESTADO_BTN: Record<string, { label: string; style: string }> = {
  solicitada: { label: "Solicitado",  style: "!bg-amber-50 !text-amber-600 border border-amber-200 cursor-default" },
  confirmada: { label: "Confirmado",  style: "!bg-teal/10 !text-teal border border-teal/30 cursor-default" },
  completada: { label: "Completado",  style: "!bg-gray-100 !text-gris cursor-default" },
};

export default function AsesoresPage() {
  const [advisors,    setAdvisors]    = useState<AdvisorItem[]>([]);
  const [solicitados, setSolicitados] = useState<Record<number, string>>({});
  const [perfil,      setPerfil]      = useState<AdvisorItem | null>(null);

  useEffect(() => {
    api<{ data: AdvisorItem[] }>("/advisors").then(r => setAdvisors(r.data)).catch(() => {});
    api<{ data: { advisor_id: number; estado: string }[] }>("/my-sessions")
      .then(r => {
        const map: Record<number, string> = {};
        r.data.forEach(s => { if (s.estado !== "cancelada") map[s.advisor_id] = s.estado; });
        setSolicitados(map);
      }).catch(() => {});
  }, []);

  async function agendar(advisor: AdvisorItem) {
    const ok = await confirmAction({
      title:   "Agendar sesión",
      message: `¿Solicitar una sesión con ${advisor.nombre}?`,
      okText:  "Sí, agendar",
    });
    if (!ok) return;
    try {
      await api("/advisor-sessions", { method: "POST", body: { advisor_id: advisor.id } });
      setSolicitados(prev => ({ ...prev, [advisor.id]: "solicitada" }));
      toast.success("Sesión solicitada", { description: `${advisor.nombre} te contactará pronto.` });
      setPerfil(null);
    } catch {
      toast.error("No se pudo agendar. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-5 sm:px-9 py-5 bg-white border-b border-gray-100">
        <h1 className="text-xl font-extrabold">Asesores externos</h1>
        <div className="hidden lg:flex"><NotificationBell /></div>
      </header>

      <div className="p-4 sm:p-6 lg:p-9">
        <p className="text-gris mb-6 max-w-[620px]">
          Conéctate con mentores y coaches para preparar tu entrevista y tus primeros pasos en la industria.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {advisors.map((a) => {
            const estado = solicitados[a.id];
            const btn    = estado ? ESTADO_BTN[estado] : null;

            return (
              <div key={a.id} className="rounded-2xl bg-white border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                <img src="/user.svg" alt="avatar" className="w-14 h-14 rounded-full mb-3" />
                <p className="font-semibold text-[16px]">{a.nombre}</p>
                <p className="text-sm text-gris mt-0.5">{[a.especialidad, a.empresa].filter(Boolean).join(" · ")}</p>
                <p className="text-xs text-teal2 font-semibold mt-2 mb-4 flex items-center gap-1">
                  <i className="bx bxs-star" /> {a.rating}
                </p>

                <div className="mt-auto flex flex-col gap-2">
                  {/* Botón ver perfil */}
                  {a.bio && (
                    <button
                      onClick={() => setPerfil(a)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-tinta hover:bg-niebla hover:border-tinta/30 transition"
                    >
                      <i className="bx bx-user-circle text-lg text-teal" />
                      Ver perfil
                    </button>
                  )}

                  {/* Botón agendar / estado */}
                  {btn ? (
                    <div className={`w-full py-2.5 text-sm font-semibold rounded-xl text-center ${btn.style}`}>
                      <i className="bx bx-check mr-1" /> {btn.label}
                    </div>
                  ) : (
                    <Button variant="teal" className="w-full !py-2.5 text-sm" onClick={() => agendar(a)}>
                      Agendar sesión
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal perfil */}
      <AnimatePresence>
        {perfil && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPerfil(null)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Barra superior */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img src="/user.svg" alt="avatar" className="w-11 h-11 rounded-full" />
                    <div>
                      <p className="font-extrabold text-[15px] leading-tight">{perfil.nombre}</p>
                      <p className="text-xs text-gris mt-0.5">{perfil.empresa}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPerfil(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gris"
                  >
                    <i className="bx bx-x text-xl" />
                  </button>
                </div>

                {/* Cuerpo */}
                <div className="px-6 py-5 space-y-5">

                  {/* Fila de datos */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-semibold text-gris uppercase tracking-wider mb-1">Especialidad</p>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-tinta font-medium">
                        {perfil.especialidad ?? "—"}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gris uppercase tracking-wider mb-1">Empresa</p>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-tinta font-medium">
                        {perfil.empresa ?? "—"}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gris uppercase tracking-wider mb-1">Calificación</p>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm font-semibold text-teal2 flex items-center gap-1">
                        <i className="bx bxs-star text-base" /> {perfil.rating} / 5.0
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gris uppercase tracking-wider mb-1">Estado</p>
                      <div className="bg-teal/8 border border-teal/20 rounded-lg px-3 py-2 text-sm font-semibold text-teal flex items-center gap-1">
                        <i className="bx bx-check-shield text-base" /> Verificado
                      </div>
                    </div>
                  </div>

                  {/* Divisor con título */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gris">Perfil profesional</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <p className="text-[13.5px] text-gray-700 leading-relaxed">{perfil.bio}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => setPerfil(null)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gris hover:bg-gray-100 transition"
                  >
                    Cerrar
                  </button>

                  <div className="flex items-center gap-2">
                    {perfil.linkedin_url && (
                      <a
                        href={perfil.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0A66C2] text-sm font-semibold text-white hover:bg-[#0A66C2]/90 transition"
                      >
                        <i className="bx bxl-linkedin text-base" />
                        LinkedIn
                      </a>
                    )}

                    {solicitados[perfil.id] ? (
                      <div className={`px-5 py-2.5 text-sm font-semibold rounded-xl ${ESTADO_BTN[solicitados[perfil.id]]?.style}`}>
                        <i className="bx bx-check mr-1" /> {ESTADO_BTN[solicitados[perfil.id]]?.label}
                      </div>
                    ) : (
                      <Button variant="teal" className="!py-2.5 !px-5 text-sm" onClick={() => agendar(perfil)}>
                        <i className="bx bx-calendar-check mr-1.5" /> Agendar sesión
                      </Button>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
