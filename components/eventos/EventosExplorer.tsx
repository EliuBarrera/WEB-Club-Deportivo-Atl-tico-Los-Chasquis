"use client";

import { useState } from "react";
import type { EventoPublicado, TerminosVigente } from "@/lib/eventos";
import { CarruselEventos } from "./CarruselEventos";
import { VistaInscripcion } from "./VistaInscripcion";

export function EventosExplorer({
  eventos,
  terminos,
  eventoInicialId = null,
}: {
  eventos: EventoPublicado[];
  terminos: TerminosVigente;
  // Deep link desde la home (Fase 9): /eventos?evento=<id> abre directo la
  // inscripción de ese evento en vez del carrusel completo.
  eventoInicialId?: string | null;
}) {
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<
    string | null
  >(eventoInicialId);

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
