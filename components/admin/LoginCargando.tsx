"use client";

import { useFormStatus } from "react-dom";

// Overlay de carga mientras se procesa el login (Fase 6): `useFormStatus`
// solo funciona en un componente hijo del <form>, por eso vive aparte de
// app/admin/login/page.tsx en vez de calcular el estado ahí mismo.
export function LoginCargando() {
  const { pending } = useFormStatus();

  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-casi-negro/70">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/25 border-t-white" />
      <span className="font-display text-lg font-bold uppercase text-white">
        Iniciando sesión…
      </span>
    </div>
  );
}
