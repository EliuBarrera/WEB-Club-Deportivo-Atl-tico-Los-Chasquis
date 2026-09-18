"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

// Botón de purga de /admin/inscripciones: mismo patrón que
// EliminarEventoButton (popup de confirmación antes de dejar pasar el
// submit hacia la Server Action), pero acá la descripción incluye el
// conteo ya calculado en el servidor (getConteoInscripcionesPurgables),
// para que el admin sepa exactamente cuántas inscripciones va a borrar
// antes de confirmar — no dispara la acción a ciegas.
export function PurgarInscripcionesButton({
  conteo,
  purgarAction,
}: {
  conteo: number;
  purgarAction: () => Promise<void>;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (conteo === 0) {
    return (
      <p className="text-sm text-white/60">
        No hay inscripciones fallidas de eventos pasados por purgar.
      </p>
    );
  }

  return (
    <>
      <form ref={formRef} action={purgarAction}>
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-sm font-bold uppercase text-rojo shadow-[0_4px_12px_rgba(28,13,10,0.14)]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
          Purgar {conteo} inscripcion{conteo === 1 ? "" : "es"} fallida
          {conteo === 1 ? "" : "s"}
        </button>
      </form>

      <ConfirmDialog
        abierto={confirmando}
        titulo="Purgar inscripciones fallidas"
        descripcion={`¿Borrar ${conteo} inscripcion${conteo === 1 ? "" : "es"} con estado ERROR, RECHAZADO o DECLINADO de eventos que ya pasaron? Esta acción no se puede deshacer.`}
        textoConfirmar="Purgar"
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => {
          setConfirmando(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
