"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdvisorItem } from "@/lib/types";
import { Button } from "@/components/ui";

/** Asesores — mentores externos + agendar sesión. */
export default function AsesoresPage() {
  const [advisors, setAdvisors] = useState<AdvisorItem[]>([]);
  const [agendado, setAgendado] = useState<number | null>(null);

  useEffect(() => {
    api<{ data: AdvisorItem[] }>("/advisors").then((r) => setAdvisors(r.data)).catch(() => {});
  }, []);

  async function agendar(id: number) {
    await api("/advisor-sessions", { method: "POST", body: { advisor_id: id } });
    setAgendado(id);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-9 py-5 bg-white border-b border-gray-100">
        <h1 className="text-xl font-extrabold">Asesores externos</h1>
      </header>

      <div className="p-9">
        <p className="text-gris mb-6 max-w-[620px]">
          Conéctate con mentores y coaches para preparar tu entrevista y tus primeros pasos en la industria.
        </p>
        <div className="grid grid-cols-3 gap-5">
          {advisors.map((a) => (
            <div key={a.id} className="rounded-2xl bg-white border border-gray-100 p-6">
              <div className="w-14 h-14 rounded-full bg-tealT flex items-center justify-center font-bold text-teal2 text-lg mb-3">
                {a.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <p className="font-semibold text-[16px]">{a.nombre}</p>
              <p className="text-sm text-gris">{[a.especialidad, a.empresa].filter(Boolean).join(" · ")}</p>
              <p className="text-xs text-teal2 font-semibold mt-2 mb-4">★ {a.rating}</p>
              <Button
                variant="teal"
                className="w-full !py-2.5 text-sm"
                onClick={() => agendar(a.id)}
                disabled={agendado === a.id}
              >
                {agendado === a.id ? "Sesión solicitada ✓" : "Agendar"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
