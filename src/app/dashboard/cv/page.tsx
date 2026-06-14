"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { NotificationBell } from "@/components/NotificationBell";
import type { CvData } from "@/lib/types";
import { Button } from "@/components/ui";

/** CV Inteligente — genera CV sobre plantilla + score ATS + talleres. */
export default function CvPage() {
  const [cv, setCv] = useState<CvData | null>(null);
  const [loading, setLoading] = useState(false);

  async function generar() {
    setLoading(true);
    const t = toast.loading("Generando tu CV…");
    try {
      const r = await api<{ data: CvData }>("/cv", { method: "POST", body: {} });
      setCv(r.data);
      toast.success(`CV generado · ATS ${r.data.ats_score}`, { id: t });
    } catch {
      toast.error("No se pudo generar el CV.", { id: t });
    } finally {
      setLoading(false);
    }
  }

  const data = cv?.json_data as
    | { encabezado?: { nombre?: string; rol_objetivo?: string }; resumen?: string; skills?: { tecnicas?: string[]; blandas?: string[] } }
    | undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-5 sm:px-9 py-5 bg-white border-b border-gray-100">
        <h1 className="text-xl font-extrabold">CV Inteligente</h1>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex"><NotificationBell /></div>
          <Button onClick={generar} disabled={loading} className="px-4 !py-2.5 text-sm">
            {loading ? "Generando…" : cv ? "Regenerar CV" : "Generar CV"}
          </Button>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-9">
        {!cv ? (
          <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center">
            <p className="text-gris">Genera tu CV optimizado para ATS sobre la plantilla estándar.</p>
            <Button onClick={generar} disabled={loading} className="mt-5 px-6 mx-auto">
              {loading ? "Generando…" : "Generar mi CV"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Preview */}
            <div className="lg:col-span-3 rounded-2xl bg-white border border-gray-100 p-6 text-[12px] leading-relaxed">
              <p className="font-bold text-[17px]">{data?.encabezado?.nombre}</p>
              <p className="text-gris">{data?.encabezado?.rol_objetivo}</p>
              <div className="h-px bg-gray-100 my-3" />
              <p className="font-semibold text-[13px] mb-1">Resumen</p>
              <p className="text-gris mb-3">{data?.resumen}</p>
              <p className="font-semibold text-[13px] mb-1">Skills</p>
              <p className="text-gris">
                {[...(data?.skills?.tecnicas ?? []), ...(data?.skills?.blandas ?? [])].join(" · ")}
              </p>
            </div>

            {/* ATS + talleres */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-white border border-gray-100 p-5 flex items-center gap-4">
                <div className="relative w-[82px] h-[82px] shrink-0">
                  <svg className="w-[82px] h-[82px]" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="41" cy="41" r="34" stroke="#EEE" strokeWidth="8" fill="none" />
                    <circle cx="41" cy="41" r="34" stroke="#13A07C" strokeWidth="8" fill="none" strokeLinecap="round"
                      strokeDasharray={214} strokeDashoffset={214 - (214 * cv.ats_score) / 100} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[24px] font-extrabold">{cv.ats_score}</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold">Score ATS</p>
                  <p className="text-xs text-gris">Optimizado para reclutadores</p>
                </div>
              </div>

              {cv.sugerencias && cv.sugerencias.length > 0 && (
                <div className="rounded-2xl bg-white border border-gray-100 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-rojo mb-3">
                    Puntos débiles → Talleres UTP
                  </p>
                  <div className="space-y-2">
                    {cv.sugerencias.map((s, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-rojoT/60 px-3 py-2.5 text-[13px]">
                        <span>{s.punto}</span>
                        <span className="text-rojo font-semibold flex items-center gap-1">{s.taller} <i className="bx bx-right-arrow-alt" /></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
