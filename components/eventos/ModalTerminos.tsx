"use client";

import { useEffect } from "react";

// Modal reutilizable de Términos y Condiciones (Fase 4): un único
// componente para todos los eventos. El contenido institucional
// (`contenido`) es siempre el mismo (viene de TerminosBase); las secciones
// de abajo son condicionales y se arman con datos que ya existen en el
// evento — nunca se duplica información en TerminosBase.
export function ModalTerminos({
  abierto,
  onCerrar,
  contenido,
  version,
  evento,
}: {
  abierto: boolean;
  onCerrar: () => void;
  contenido: string | null;
  version: number | null;
  evento?: {
    kit: { id: string; texto: string }[];
    premiosEfectivo: boolean;
  };
}) {
  useEffect(() => {
    if (!abierto) return;
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Términos y condiciones"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-casi-negro/60 p-4 sm:p-6"
      onClick={onCerrar}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-5 overflow-y-auto rounded-[24px] bg-white p-6 shadow-[0_20px_50px_rgba(28,13,10,0.35)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-extrabold uppercase">
            Términos y condiciones
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-casi-negro/5 text-casi-negro"
          >
            ✕
          </button>
        </div>

        {contenido ? (
          <p className="whitespace-pre-line text-base leading-relaxed text-gris-oscuro">
            {contenido}
          </p>
        ) : (
          <p className="italic text-gris-oscuro">
            No hay un texto de términos y condiciones publicado todavía.
          </p>
        )}

        {evento?.kit && evento.kit.length > 0 ? (
          <div className="flex flex-col gap-2 border-t border-casi-negro/10 pt-4">
            <h3 className="font-display text-lg font-extrabold uppercase text-naranja">
              Entrega de kits
            </h3>
            <ul className="list-disc pl-5 text-base leading-relaxed text-gris-oscuro">
              {evento.kit.map((item) => (
                <li key={item.id}>{item.texto}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {evento?.premiosEfectivo ? (
          <div className="flex flex-col gap-2 border-t border-casi-negro/10 pt-4">
            <h3 className="font-display text-lg font-extrabold uppercase text-naranja">
              Premiación en efectivo
            </h3>
            <p className="text-base leading-relaxed text-gris-oscuro">
              Este evento entrega premiación en efectivo según la tabla
              publicada en la pestaña &quot;Premios&quot; del evento.
            </p>
          </div>
        ) : null}

        {version ? (
          <p className="font-mono text-xs text-gris-oscuro/70">
            Versión {version}
          </p>
        ) : null}
      </div>
    </div>
  );
}
