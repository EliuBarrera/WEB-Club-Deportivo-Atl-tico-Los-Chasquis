"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

// Botón de difusión masiva (Fase 11), calcado de EliminarEventoButton.tsx:
// mismo patrón de confirmación antes de dejar pasar el submit hacia la
// Server Action — acá porque se envía a cientos de personas reales de un
// clic, no porque sea destructivo como un borrado.
export function EnviarResumenBoton({
  canal,
  etiqueta,
  totalDestinatarios,
  enviarAction,
  claseBoton,
}: {
  canal: "WHATSAPP" | "EMAIL";
  etiqueta: string;
  totalDestinatarios: number;
  enviarAction: (formData: FormData) => Promise<void>;
  claseBoton: string;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      {/* claseBoton suele traer "flex-1" para repartir el ancho con un
          botón hermano — eso no hace nada si se aplica solo al <button>,
          porque su padre directo es este <form> (una caja de bloque, no un
          contenedor flex). El <form> es el que necesita flex-1; el botón
          simplemente ocupa todo el ancho que el form termine ocupando. */}
      <form ref={formRef} action={enviarAction} className="flex-1">
        <button
          type="button"
          aria-label={`Enviar resumen por ${etiqueta}`}
          data-canal={canal}
          className={`w-full ${claseBoton}`}
          onClick={() => setConfirmando(true)}
          disabled={totalDestinatarios === 0}
        >
          {etiqueta}
        </button>
      </form>

      <ConfirmDialog
        abierto={confirmando}
        titulo={`Enviar por ${etiqueta}`}
        descripcion={`Se enviará a los ${totalDestinatarios} atletas únicos del club (todos los eventos). Esta acción no se puede deshacer.`}
        textoConfirmar="Enviar"
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => {
          setConfirmando(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
