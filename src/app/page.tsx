"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/** Raíz: enruta según haya sesión o no. */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!user.profile?.rol_objetivo) router.replace("/dashboard/inicio");
    else router.replace("/dashboard");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen grid place-items-center text-gris">
      Cargando UTP+Match…
    </div>
  );
}
