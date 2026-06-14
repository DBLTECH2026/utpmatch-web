"use client";

import Image from "next/image";
import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

/** Logo UTP+Match (proporción preservada). */
export function Logo({ size = 64 }: { size?: number }) {
  // ratio real del SVG: 952 x 1101
  const width = Math.round((size * 952) / 1101);
  return (
    <Image
      src="/logo-utpmatch.svg"
      alt="UTP+Match"
      width={width}
      height={size}
      priority
    />
  );
}

/** Botón con variantes del sistema visual. */
export function Button({
  variant = "rojo",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "rojo" | "teal" | "ghost";
}) {
  const styles = {
    rojo: "bg-rojo text-white hover:bg-rojo2",
    teal: "bg-teal text-white hover:bg-teal2",
    ghost: "border border-gray-200 text-tinta hover:bg-niebla",
  }[variant];

  return (
    <button
      {...props}
      className={`flex items-center justify-center gap-2 font-semibold rounded-[14px] py-4 transition disabled:opacity-60 disabled:cursor-not-allowed ${styles} ${className}`}
    />
  );
}

/** Campo de formulario con label y error. */
export function Field({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-tinta">{label}</span>
      <input
        {...props}
        className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition focus:ring-2 ${
          error
            ? "border-rojo focus:ring-rojo/30"
            : "border-gray-200 focus:ring-teal/30"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-rojo">{error}</span>}
    </label>
  );
}
