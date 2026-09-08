"use client";

import { useEffect, useState } from "react";

// Notificación flotante de éxito (Fase 6): `mensaje` viene de un parámetro
// en la URL a la que redirige la Server Action tras guardar (ver
// app/admin/(panel)/eventos/actions.ts). El padre debe pasar un `key` con
// el `t` (timestamp) que la propia Server Action agrega a la URL — si no,
// guardar dos veces seguidas el mismo tipo de cambio no remontaría este
// componente porque `mensaje` sería idéntico al anterior, y el efecto no
// volvería a dispararse.
export function Toast({ mensaje }: { mensaje: string | null }) {
  const [visible, setVisible] = useState(Boolean(mensaje));

  useEffect(() => {
    if (!mensaje) return;

    // Limpia los parámetros de la URL para que un refresh no vuelva a
    // mostrar el mismo aviso.
    const url = new URL(window.location.href);
    url.searchParams.delete("guardado");
    url.searchParams.delete("t");
    window.history.replaceState(null, "", url);

    const temporizador = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(temporizador);
  }, [mensaje]);

  if (!mensaje || !visible) return null;

  return (
    <div className="fixed left-1/2 top-6 z-[70] -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full bg-verde px-5 py-3 font-display text-sm font-bold uppercase text-white shadow-[0_10px_30px_rgba(31,146,84,0.35)]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {mensaje}
      </div>
    </div>
  );
}
