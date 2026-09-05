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
    <div className="relative left-1/2 w-[80vw] -translate-x-1/2">
      <div className="flex items-center gap-2 px-4 sm:gap-4 sm:px-8">
        <button
          type="button"
          aria-label="Evento anterior"
          onClick={() => desplazar(-1)}
          className="hidden shrink-0 items-center justify-center rounded-full border-[3px] border-casi-negro bg-white text-casi-negro transition-colors hover:bg-casi-negro hover:text-white sm:flex sm:h-14 sm:w-14"
        >
          <svg
            width="26"
            height="26"
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
                mostrarLema={false}
                onInscribirte={() => onInscribirte(evento.id)}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Evento siguiente"
          onClick={() => desplazar(1)}
          className="hidden shrink-0 items-center justify-center rounded-full border-[3px] border-casi-negro bg-white text-casi-negro transition-colors hover:bg-casi-negro hover:text-white sm:flex sm:h-14 sm:w-14"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
