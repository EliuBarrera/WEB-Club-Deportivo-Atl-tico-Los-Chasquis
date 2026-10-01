"use client";

import { useEffect, useState } from "react";

export type ErrorJsonDetalle = { campo: string; mensaje: string };

// Modal con el detalle de por qué falló "Crear desde JSON" (EventosLista.tsx):
// la Server Action (crearEventoDesdeJson, app/admin/(panel)/eventos/actions.ts)
// ya no se queda en el aviso genérico "revisa la plantilla" — manda un error
// por cada campo que Zod rechazó (lib/validation/evento.ts,
// traducirErroresEventoJson), codificado en la URL de redirect, para que el
// admin corrija su archivo sin adivinar. Mismo patrón que Toast.tsx para
// limpiar los parámetros de la URL al cerrar y no reabrirse con un refresh;
// el padre debe pasar un `key` con el `t` de la URL para que dos intentos
// fallidos seguidos sí remonten el modal aunque el primer campo roto sea
// el mismo.
export function ErroresJsonModal({
  errores,
  paramsALimpiar = ["error", "jsonDetalle", "t"],
}: {
  errores: ErrorJsonDetalle[] | null;
  paramsALimpiar?: string[];
}) {
  const [visible, setVisible] = useState(Boolean(errores?.length));

  useEffect(() => {
    if (!errores?.length) return;

    // Limpia los parámetros de la URL para que un refresh no vuelva a
    // mostrar el mismo error.
    const url = new URL(window.location.href);
    for (const param of paramsALimpiar) {
      url.searchParams.delete(param);
    }
    window.history.replaceState(null, "", url);

    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
    // paramsALimpiar cambia de referencia en cada render del padre; el
    // componente se remonta por completo vía `key` cuando `errores` cambia
    // (ver comentario de arriba), así que solo `errores` debe disparar el
    // efecto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errores]);

  if (!errores?.length || !visible) return null;

  function cerrar() {
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="errores-json-titulo"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-casi-negro/50 p-6"
      onClick={cerrar}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-[24px] bg-white p-6 shadow-[0_20px_50px_rgba(28,13,10,0.35)]"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="errores-json-titulo"
              className="font-display text-xl font-extrabold uppercase text-rojo"
            >
              El JSON no se pudo cargar
            </h2>
            <p className="mt-1 text-sm text-gris-oscuro">
              Corrige estos campos en tu archivo y vuelve a seleccionarlo.
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={cerrar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-casi-negro/5 text-casi-negro"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          {errores.map((error, indice) => (
            <li
              key={`${error.campo}-${indice}`}
              className="rounded-xl bg-rojo/10 px-4 py-2.5"
            >
              <span className="block text-xs font-bold uppercase tracking-wide text-rojo">
                {error.campo}
              </span>
              <span className="text-sm text-casi-negro">{error.mensaje}</span>
            </li>
          ))}
        </ul>

        <a
          href="/plantillas/evento-ejemplo.json"
          download
          className="text-center text-xs font-semibold text-naranja underline"
        >
          Descargar plantilla de ejemplo
        </a>
      </div>
    </div>
  );
}
