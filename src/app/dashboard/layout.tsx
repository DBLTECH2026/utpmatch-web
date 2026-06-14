"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

const MENU = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/perfil", label: "Perfil 360" },
  { href: "/dashboard/ruta", label: "Ruta & Brechas" },
  { href: "/dashboard/cv", label: "CV Inteligente" },
  { href: "/dashboard/empleos", label: "Empleos" },
  { href: "/dashboard/asesores", label: "Asesores" },
  { href: "/dashboard/copiloto", label: "Copiloto" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Guard de ruta: si no hay sesión tras cargar, redirige a login.
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-gris">
        Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-[236px] shrink-0 bg-tinta text-white flex flex-col px-4 py-6">
        <div className="flex items-center gap-3 mb-9 px-1">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5">
            <Image
              src="/iso-utpmatch.svg"
              alt=""
              width={28}
              height={28}
            />
          </div>
          <span className="font-extrabold text-lg">
            UTP<span className="text-rojo">+</span>Match
          </span>
        </div>

        <nav className="space-y-1 flex-1">
          {MENU.map((m) => {
            const active = pathname === m.href;
            return (
              <button
                key={m.href}
                onClick={() => router.push(m.href)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-rojo text-white font-semibold"
                    : "text-white/55 hover:bg-white/10 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </nav>

        <div className="rounded-2xl bg-white/[.08] border border-white/10 p-4 mt-6">
          <p className="text-xs text-white/55 mb-1">Sesión</p>
          <p className="text-sm font-semibold truncate">{user.name}</p>
          <button
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            className="mt-3 text-xs text-rojo font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 bg-niebla">{children}</div>
    </div>
  );
}
