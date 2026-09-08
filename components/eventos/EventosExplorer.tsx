"use client";

import { useState } from "react";
import type { EventoPublicado, TerminosVigente } from "@/lib/eventos";
import { CarruselEventos } from "./CarruselEventos";
import { VistaInscripcion } from "./VistaInscripcion";

export function EventosExplorer({
  eventos,
  terminos,
}: {
  eventos: EventoPublicado[];
  terminos: TerminosVigente;
}) {
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<
    string | null
  >(null);

  const eventoSeleccionado = eventos.find(
    (e) => e.id === eventoSeleccionadoId
  );

  if (eventoSeleccionado) {
    return (
      <VistaInscripcion
        evento={eventoSeleccionado}
        terminos={terminos}
        onVolver={() => setEventoSeleccionadoId(null)}
      />
    );
  }

  return (
    <CarruselEventos
      eventos={eventos}
      onInscribirte={(eventoId) => setEventoSeleccionadoId(eventoId)}
    />
  );
}
