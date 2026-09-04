"use client";

import { useRef } from "react";
import type { EventoPublicado } from "@/lib/eventos";
import { TarjetaEvento } from "./TarjetaEvento";

export function CarruselEventos({
  eventos,
  onInscribirte,
}: {
  eventos: EventoPublicado[];
  onInscribirte: (eventoId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function desplazar(direccion: 1 | -1) {
    const contenedor = scrollRef.current;
    if (!contenedor) return;
    const tarjeta = contenedor.querySelector<HTMLElement>("[data-tarjeta]");
    const ancho = tarjeta ? tarjeta.offsetWidth + 24 : contenedor.clientWidth;
    contenedor.scrollBy({ left: direccion * ancho, behavior: "smooth" });
  }

  if (eventos.length === 0) {
    return (
      <p className="text-center text-lg text-gris-oscuro">
        No hay eventos publicados por el momento.
      </p>
    );
  }

  return (
    <div className="relative flex items-center gap-2 sm:gap-4">
      <button
        type="button"
        aria-label="Evento anterior"
        onClick={() => desplazar(-1)}
        className="hidden shrink-0 font-display text-3xl font-black text-casi-negro sm:block"
      >
        &lt;
      </button>

      <div
        ref={scrollRef}
        className="flex flex-1 snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
      >
        {eventos.map((evento) => (
          <div
            key={evento.id}
            data-tarjeta
            className="w-[85vw] shrink-0 snap-start sm:w-[340px]"
          >
            <TarjetaEvento
              evento={evento}
              onInscribirte={() => onInscribirte(evento.id)}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Evento siguiente"
        onClick={() => desplazar(1)}
        className="hidden shrink-0 font-display text-3xl font-black text-casi-negro sm:block"
      >
        &gt;
      </button>
    </div>
  );
}
