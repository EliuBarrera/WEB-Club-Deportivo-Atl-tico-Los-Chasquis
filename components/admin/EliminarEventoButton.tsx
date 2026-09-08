"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

// Único componente cliente de la lista de eventos: abre un popup de
// confirmación con la estética del panel (ConfirmDialog) antes de dejar
// pasar el submit hacia la Server Action, para que un clic accidental no
// borre el evento sin aviso. El borrado real igual queda protegido en
// servidor por la restricción de la FK.
export function EliminarEventoButton({
  eventoId,
  eventoTitulo,
  eliminarEventoAction,
  claseBoton,
}: {
  eventoId: string;
  eventoTitulo: string;
  eliminarEventoAction: (eventoId: string) => Promise<void>;
  claseBoton: string;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} action={eliminarEventoAction.bind(null, eventoId)}>
        <button
          type="button"
          aria-label="Eliminar evento"
          className={claseBoton}
          onClick={() => setConfirmando(true)}
        >
          <svg
            width="14"
            height="14"
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
        </button>
      </form>

      <ConfirmDialog
        abierto={confirmando}
        titulo="Eliminar evento"
        descripcion={`¿Eliminar "${eventoTitulo}"? Esta acción no se puede deshacer.`}
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => {
          setConfirmando(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
