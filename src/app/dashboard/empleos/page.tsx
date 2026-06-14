"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { VacancyItem } from "@/lib/types";

/** Empleos — búsqueda conversacional + vacantes con % match. */
export default function EmpleosPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<VacancyItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function buscar(q = "") {
    setLoading(true);
    try {
      const r = await api<{ data: VacancyItem[] }>("/match/search", {
        method: "POST",
        body: { query: q || null },
      });
      setItems(r.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscar().catch(() => {});
  }, []);

  const chipColor = (pct: number) =>
    pct >= 70 ? "bg-tealT text-teal2" : pct >= 55 ? "bg-tealT/70 text-teal2" : "bg-niebla text-gris";

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-6 px-5 sm:px-9 py-5 bg-white border-b border-gray-100">
        <h1 className="text-xl font-extrabold whitespace-nowrap">Empleos · Match</h1>
        <form
          onSubmit={(e) => { e.preventDefault(); buscar(query); }}
          className="flex-1 max-w-[440px] flex items-center gap-2 bg-niebla rounded-xl px-4 py-2.5"
        >
          <i className="bx bx-search text-gris" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. práctica de frontend en Lima, remoto"
            className="flex-1 bg-transparent text-[13px] outline-none"
          />
        </form>
      </header>

      <div className="p-4 sm:p-6 lg:p-9">
        {loading ? (
          <p className="text-gris">Buscando…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((v) => (
              <button
                key={v.id}
                onClick={() => router.push(`/dashboard/empleos/${v.id}`)}
                className="text-left rounded-2xl bg-white border border-gray-100 p-5 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{v.titulo}</p>
                    <p className="text-xs text-gris">
                      {[v.empresa, v.ubicacion, v.modalidad].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${chipColor(v.match_pct)}`}>
                    {v.match_pct}%
                  </span>
                </div>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 bg-teal rounded-full" style={{ width: `${v.match_pct}%` }} />
                </div>
                {v.faltantes.length > 0 && (
                  <p className="text-xs text-gris mt-3">
                    Te falta: <span className="text-rojo font-semibold">{v.faltantes.join(", ")}</span>
                  </p>
                )}
              </button>
            ))}
            {items.length === 0 && <p className="text-gris">Sin resultados para esa búsqueda.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
