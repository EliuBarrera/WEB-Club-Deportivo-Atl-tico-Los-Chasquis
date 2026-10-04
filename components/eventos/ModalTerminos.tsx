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
    // Fase 12.6: lo que incluye la inscripción depende del grupo de tarifa
    // (ej. adultos: camiseta y chip; menores: número y medalla), no del
    // evento. Con grupo elegido se muestra solo el suyo; sin elegir, todos.
    // `kit` (Logística) queda como respaldo para eventos sin derechos por
    // grupo.
    gruposTarifa?: { id: string; nombre: string; derechos: string[] }[];
    grupoTarifaId?: string | null;
    notasCategorias?: string[];
    premiosEfectivo: boolean;
    // Enlace propio del evento (Evento.terminosUrl), ej. un PDF con sus
    // términos completos; complementa el texto institucional.
    documentoUrl?: string | null;
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

  const gruposConDerechos = (evento?.gruposTarifa ?? []).filter(
    (g) => g.derechos.length > 0
  );
  const grupoElegido = evento?.gruposTarifa?.find(
    (g) => g.id === evento.grupoTarifaId
  );
  const gruposKit = grupoElegido
    ? gruposConDerechos.filter((g) => g.id === grupoElegido.id)
    : gruposConDerechos;
  const notasCategorias = evento?.notasCategorias ?? [];

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

        {gruposConDerechos.length > 0 ? (
          gruposKit.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-casi-negro/10 pt-4">
              <h3 className="font-display text-lg font-extrabold uppercase text-naranja">
                Entrega de kits
              </h3>
              {gruposKit.map((grupo) => (
                <div key={grupo.id} className="flex flex-col gap-1">
                  <p className="font-bold text-casi-negro">
                    {grupoElegido
                      ? `Tu inscripción (${grupo.nombre}) incluye:`
                      : `${grupo.nombre}:`}
                  </p>
                  <ul className="list-disc pl-5 text-base leading-relaxed text-gris-oscuro">
                    {grupo.derechos.map((derecho) => (
                      <li key={derecho}>{derecho}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null
        ) : evento?.kit && evento.kit.length > 0 ? (
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

        {notasCategorias.length > 0 ? (
          <div className="flex flex-col gap-2 border-t border-casi-negro/10 pt-4">
            <h3 className="font-display text-lg font-extrabold uppercase text-naranja">
              Notas de categoría
            </h3>
            <ul className="list-disc pl-5 text-base leading-relaxed text-gris-oscuro">
              {notasCategorias.map((nota, i) => (
                <li key={i}>{nota}</li>
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

        {evento?.documentoUrl ? (
          <div className="flex flex-col gap-2 border-t border-casi-negro/10 pt-4">
            <h3 className="font-display text-lg font-extrabold uppercase text-naranja">
              Términos del evento
            </h3>
            <a
              href={evento.documentoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-casi-negro/5 px-5 py-2 font-display font-bold uppercase shadow-[0_4px_12px_rgba(28,13,10,0.14)] transition-colors hover:bg-casi-negro hover:text-crema"
            >
              Ver documento completo
            </a>
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
