"use client";

import { useState } from "react";
import type { EventoPublicado } from "@/lib/eventos";
import { CalendarioMapaCarrusel } from "./CalendarioMapaCarrusel";
import { FormularioInscripcion } from "./FormularioInscripcion";
import { PanelDetalleTabs } from "./PanelDetalleTabs";
import { TarjetaEvento } from "./TarjetaEvento";

export function VistaInscripcion({
  evento,
  onVolver,
}: {
  evento: EventoPublicado;
  onVolver: () => void;
}) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onVolver}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2 font-display font-bold uppercase text-casi-negro shadow-[0_4px_12px_rgba(28,13,10,0.14)] transition-colors hover:bg-casi-negro hover:text-white"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver al listado
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <TarjetaEvento
            evento={evento}
            compacta
            onInscribirte={() => setMostrarFormulario(true)}
          />
          <CalendarioMapaCarrusel
            titulo={evento.titulo}
            fecha={evento.fecha}
            horario={evento.horario}
            ubicacion={evento.ubicacion}
            descripcion={evento.descripcion}
            mapUrl={evento.mapUrl}
          />
        </div>

        {mostrarFormulario ? (
          <FormularioInscripcion
            evento={evento}
            onCancelar={() => setMostrarFormulario(false)}
          />
        ) : (
          <PanelDetalleTabs evento={evento} />
        )}
      </div>
    </div>
  );
}
