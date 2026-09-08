"use client";

import { useEffect } from "react";

// Popup de confirmación genérico del panel admin, con la estética del resto
// del sitio (tarjeta redondeada, tipografía display), en vez del
// `window.confirm()` nativo del navegador.
export function ConfirmDialog({
  abierto,
  titulo,
  descripcion,
  textoConfirmar = "Eliminar",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  useEffect(() => {
    if (!abierto) return;
    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onCancelar();
    };
    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [abierto, onCancelar]);

  if (!abierto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-casi-negro/50 p-6"
      onClick={onCancelar}
    >
      <div
        className="flex w-full max-w-sm flex-col gap-4 rounded-[24px] bg-white p-6 shadow-[0_20px_50px_rgba(28,13,10,0.35)]"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 className="font-display text-xl font-extrabold uppercase">
          {titulo}
        </h2>
        <p className="text-gris-oscuro">{descripcion}</p>
        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-full bg-casi-negro/5 px-5 py-2.5 font-display font-bold uppercase text-casi-negro"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="rounded-full bg-rojo px-5 py-2.5 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(209,39,59,0.35)]"
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
