"use client";

import { Confirm } from "notiflix/build/notiflix-confirm-aio";

/**
 * confirmAction → modal de confirmación (Notiflix) con tema de marca.
 * (Los toasts se importan directo de "sonner" en cada componente para
 *  compartir la misma instancia del store que el <Toaster>.)
 */

let initialized = false;

function initNotiflix() {
  if (initialized) return;
  Confirm.init({
    titleColor: "#16161A",
    okButtonBackground: "#E2231A",   // rojo de marca
    okButtonColor: "#FFFFFF",
    cancelButtonBackground: "#F4F4F7",
    cancelButtonColor: "#16161A",
    borderRadius: "16px",
    messageColor: "#6E6E78",
    titleFontSize: "18px",
    messageFontSize: "14px",
    fontFamily: "Inter, system-ui, sans-serif",
    backgroundColor: "#FFFFFF",
    plainText: false,
  });
  initialized = true;
}

/**
 * Muestra un modal de confirmación. Resuelve a true (confirmó) o false (canceló).
 */
export function confirmAction(opts: {
  title: string;
  message: string;
  okText?: string;
  cancelText?: string;
}): Promise<boolean> {
  initNotiflix();
  return new Promise((resolve) => {
    Confirm.show(
      opts.title,
      opts.message,
      opts.okText ?? "Confirmar",
      opts.cancelText ?? "Cancelar",
      () => resolve(true),
      () => resolve(false),
    );
  });
}
