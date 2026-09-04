"use client";

import { useState } from "react";
import type { EventoPublicado } from "@/lib/eventos";
import { CarruselEventos } from "./CarruselEventos";
import { VistaInscripcion } from "./VistaInscripcion";

export function EventosExplorer({ eventos }: { eventos: EventoPublicado[] }) {
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<
    string | null
  >(null);
  const [avisoFormulario, setAvisoFormulario] = useState(false);

  const eventoSeleccionado = eventos.find(
    (e) => e.id === eventoSeleccionadoId
  );

  if (eventoSeleccionado) {
    return (
      <div className="flex flex-col gap-4">
        <VistaInscripcion
          evento={eventoSeleccionado}
          onVolver={() => {
            setEventoSeleccionadoId(null);
            setAvisoFormulario(false);
          }}
          onInscribirte={() => setAvisoFormulario(true)}
        />
        {avisoFormulario ? (
          <p className="rounded-xl border-2 border-dashed border-gris-oscuro p-4 text-sm text-gris-oscuro">
            El formulario de inscripción se implementa en la Fase 4 del
            plan de desarrollo.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <CarruselEventos
      eventos={eventos}
      onInscribirte={(eventoId) => setEventoSeleccionadoId(eventoId)}
    />
  );
}
