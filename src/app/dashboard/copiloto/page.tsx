"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { NotificationBell } from "@/components/NotificationBell";

interface Msg {
  from: "ia" | "yo";
  text: string;
}

/** Copiloto — chat conversacional con la IA (proactivo). */
export default function CopilotoPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "ia",
      text: "Hola, te falta 1 curso para calificar a 3 vacantes nuevas de Frontend. ¿Te armo la ruta?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = input.trim();
    if (!texto) return;
    setMsgs((m) => [...m, { from: "yo", text: texto }]);
    setInput("");
    setSending(true);
    try {
      const r = await api<{ data: { respuesta: string } }>("/copilot/chat", {
        method: "POST",
        body: { mensaje: texto },
      });
      setMsgs((m) => [...m, { from: "ia", text: r.data.respuesta }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center gap-3 px-5 sm:px-9 py-5 bg-white border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-rojo flex items-center justify-center text-white text-sm font-bold">IA</div>
        <div>
          <h1 className="font-extrabold leading-none">Copiloto</h1>
          <p className="text-xs text-teal mt-1">● en línea · proactivo</p>
        </div>
        <div className="hidden lg:flex ml-auto"><NotificationBell /></div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-9 space-y-4">
        {msgs.map((m, i) =>
          m.from === "ia" ? (
            <div key={i} className="max-w-[85%] sm:max-w-[55%] rounded-2xl rounded-tl-md bg-rojoT p-4 text-[14px]">
              {m.text}
            </div>
          ) : (
            <div key={i} className="max-w-[80%] sm:max-w-[45%] ml-auto rounded-2xl rounded-tr-md bg-tinta text-white p-4 text-[14px]">
              {m.text}
            </div>
          )
        )}
        {sending && <div className="max-w-[70%] sm:max-w-[40%] rounded-2xl rounded-tl-md bg-rojoT/60 p-4 text-[14px] text-gris">Escribiendo…</div>}
      </div>

      <form onSubmit={enviar} className="p-4 sm:p-6 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3 bg-niebla rounded-2xl px-5 py-3.5 w-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntale al copiloto sobre tu ruta, CV o empleos…"
            className="flex-1 bg-transparent text-[14px] outline-none"
          />
          <button type="submit" className="w-9 h-9 rounded-xl bg-rojo text-white flex items-center justify-center"><i className="bx bx-up-arrow-alt" /></button>
        </div>
      </form>
    </div>
  );
}
