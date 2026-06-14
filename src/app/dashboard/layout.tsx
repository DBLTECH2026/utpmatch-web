"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { confirmAction } from "@/lib/ui-feedback";
import { toast } from "sonner";

const MENU = [
  { href: "/dashboard/inicio", label: "Inicio", icon: "bx-home-alt" },
  { href: "/dashboard", label: "Dashboard", icon: "bx-grid-alt" },
  { href: "/dashboard/perfil", label: "Perfil 360", icon: "bx-user" },
  { href: "/dashboard/ruta", label: "Ruta & Brechas", icon: "bx-git-branch" },
  { href: "/dashboard/cv", label: "CV Inteligente", icon: "bx-file" },
  { href: "/dashboard/empleos", label: "Empleos", icon: "bx-briefcase" },
  { href: "/dashboard/asesores", label: "Asesores", icon: "bx-group" },
  { href: "/dashboard/copiloto", label: "Copiloto", icon: "bx-bot" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);

  // Guard de ruta.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (!user.profile?.rol_objetivo && pathname !== "/dashboard/inicio") {
      router.replace("/dashboard/inicio");
    }
  }, [loading, user, router, pathname]);

  // Cerrar drawer al cambiar de ruta.
  useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  async function handleLogout() {
    const ok = await confirmAction({
      title: "Cerrar sesión",
      message: "¿Seguro que quieres salir de UTP+Match?",
      okText: "Sí, salir",
      cancelText: "Cancelar",
    });
    if (!ok) return;
    await logout();
    toast.success("Sesión cerrada");
    router.replace("/login");
  }

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-gris">Cargando…</div>;
  }

  // Contenido del sidebar (reutilizado en desktop fijo y en drawer móvil).
  const SidebarContent = (
    <>
      <div className="flex items-center gap-3 mb-8 px-1">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5">
          <Image src="/iso-utpmatch.svg" alt="" width={28} height={28} />
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
                  ? "bg-rojo text-white font-semibold shadow-[0_8px_20px_-6px_rgba(226,35,26,0.6)]"
                  : "text-white/55 hover:bg-white/10 hover:text-white"
              }`}
            >
              <i className={`bx ${m.icon} text-lg`} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="rounded-2xl bg-white/[.06] border border-white/10 p-3 mt-6">
        <div className="flex items-center gap-3">
          {/* Avatar / foto de perfil */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rojo to-teal flex items-center justify-center font-bold text-white text-sm ring-2 ring-white/15">
              {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
            {/* indicador en línea */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal border-2 border-tinta" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">{user.name}</p>
            <p className="text-[11px] text-white/45 truncate">{user.codigo_utp ?? user.email}</p>
          </div>
        </div>

        {/* Carrera + ciclo */}
        <div className="mt-3 space-y-1.5">
          <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1.5 text-[11px] font-medium text-white/75">
            <i className="bx bx-book-bookmark text-rojo shrink-0" />
            <span className="truncate">{user.carrera ?? "—"}</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1.5 text-[11px] font-medium text-white/75">
            <i className="bx bx-calendar text-teal shrink-0" /> Ciclo {user.ciclo ?? "—"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-white/[.06] hover:bg-rojo/20 border border-white/10 py-2 text-xs text-rojo font-semibold transition"
        >
          <i className="bx bx-log-out" /> Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar fijo (desktop) */}
      <aside className="hidden lg:flex w-[236px] shrink-0 bg-tinta text-white flex-col px-4 py-6 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Topbar móvil con hamburguesa */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-tinta text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1">
            <Image src="/iso-utpmatch.svg" alt="" width={22} height={22} />
          </div>
          <span className="font-extrabold">
            UTP<span className="text-rojo">+</span>Match
          </span>
        </div>
        <button onClick={() => setDrawer(true)} className="p-2 -mr-2" aria-label="Menú">
          <i className="bx bx-menu text-2xl" />
        </button>
      </div>

      {/* Drawer móvil */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[270px] bg-tinta text-white flex flex-col px-4 py-6 overflow-y-auto"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenido con transición animada por ruta */}
      <div className="flex-1 min-w-0 bg-niebla overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
