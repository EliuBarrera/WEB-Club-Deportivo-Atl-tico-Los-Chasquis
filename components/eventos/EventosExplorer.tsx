"use client";

import { useState } from "react";
import type { EventoPublicado, TerminosVigente } from "@/lib/eventos";
import { CarruselEventos } from "./CarruselEventos";
import { TarjetaEvento } from "./TarjetaEvento";
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
  const [mostrarPasados, setMostrarPasados] = useState(false);

  const eventoSeleccionado = eventos.find((e) => e.id === eventoSeleccionadoId);

  if (eventoSeleccionado) {
    return (
      <VistaInscripcion
        evento={eventoSeleccionado}
        terminos={terminos}
        onVolver={() => setEventoSeleccionadoId(null)}
      />
    );
  }

  const eventosAbiertos = eventos.filter((e) => e.estado === "ABIERTO");
  const eventosCerrados = eventos.filter((e) => e.estado === "CERRADO");

  return (
    <div className="flex flex-col gap-10">
      <CarruselEventos
        eventos={eventosAbiertos}
        onInscribirte={(eventoId) => setEventoSeleccionadoId(eventoId)}
        mensajeVacio="No hay eventos abiertos por el momento."
      />

      {eventosCerrados.length > 0 ? (
        <div className="flex flex-col items-center gap-8">
          <button
            type="button"
            onClick={() => setMostrarPasados((v) => !v)}
            className="rounded-full border-[3px] border-casi-negro bg-white px-8 py-3 font-display text-lg font-bold uppercase tracking-wide text-casi-negro transition-colors hover:bg-casi-negro hover:text-white"
          >
            {mostrarPasados ? "Ocultar eventos pasados" : "Ver eventos pasados"}
          </button>

          {mostrarPasados ? (
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventosCerrados.map((evento) => (
                <TarjetaEvento key={evento.id} evento={evento} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
