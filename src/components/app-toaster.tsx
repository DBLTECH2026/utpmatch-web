"use client";

import { Toaster } from "sonner";

/** Wrapper client del Toaster de Sonner (asegura hidratación en App Router). */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      toastOptions={{ style: { fontFamily: "var(--font-inter)" } }}
    />
  );
}
