"use client";

import { useState, useSyncExternalStore } from "react";

// Enlace de voluntarios de la entrega de kits (Fase 13.2): copiar o
// mandar por WhatsApp. Es client component solo para armar la URL
// completa con el dominio desde el que se abrió el panel.
export function EnlaceEntregaKits({ token }: { token: string }) {
  const origen = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const [copiado, setCopiado] = useState(false);
  const url = `${origen}/kits/${token}`;
  const guia = `${origen}/kits/guia`;
  const mensaje = `Enlace para la entrega de kits (ábrelo con señal antes de empezar): ${url}\n\nGuía rápida para voluntarios: ${guia}`;

  return (
    <div className="flex flex-col gap-2">
      <code className="break-all rounded-lg bg-casi-negro/[0.045] px-3 py-2 text-sm">
        {url}
      </code>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopiado(true);
            } catch {
              setCopiado(false);
            }
          }}
          className="rounded-full bg-casi-negro px-4 py-2 font-display text-sm font-bold uppercase text-crema"
        >
          {copiado ? "Copiado" : "Copiar"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-green-600 px-4 py-2 font-display text-sm font-bold uppercase text-white"
        >
          Enviar por WhatsApp
        </a>
      </div>
    </div>
  );
}
