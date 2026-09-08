"use client";

import { useRef } from "react";
import Image from "next/image";
import type { SocioPublico } from "@/lib/socios";

// 5 columnas x 2 filas por página (desktop) — si hay más socios que eso,
// el resto se ve deslizando el carrusel, no agregando más filas sueltas.
const POR_PAGINA = 10;

function agrupar<T>(items: T[], tamano: number): T[][] {
  const grupos: T[][] = [];
  for (let i = 0; i < items.length; i += tamano) {
    grupos.push(items.slice(i, i + tamano));
  }
  return grupos;
}

// Fase 9, sección "Aval institucional": grid de logos reales de socios y
// aliados, a color sobre tarjetas blancas, con el nombre siempre visible
// debajo de cada uno. Mismo patrón de carrusel deslizable que
// CarruselEventos.tsx (Fase 2) — acá cada "tarjeta" es una página completa
// de hasta 10 logos (5x2) en vez de un evento individual.
export function RespaldoInstitucional({ socios }: { socios: SocioPublico[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (socios.length === 0) return null;

  const paginas = agrupar(socios, POR_PAGINA);

  function desplazar(direccion: 1 | -1) {
    const contenedor = scrollRef.current;
    if (!contenedor) return;
    contenedor.scrollBy({
      left: direccion * contenedor.clientWidth,
      behavior: "smooth",
    });
  }

  return (
    <section id="respaldo" className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
          Respaldo institucional
        </h2>
        <p className="max-w-xl text-lg text-gris-oscuro">
          Entidades y aliados que respaldan nuestros eventos.
        </p>
      </div>

      <div className="flex w-full items-center gap-2 sm:gap-4">
        {paginas.length > 1 ? (
          <button
            type="button"
            aria-label="Ver socios anteriores"
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
        ) : null}

        <div
          ref={scrollRef}
          className="flex flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {paginas.map((pagina, indice) => (
            <div
              key={indice}
              className="grid w-full shrink-0 snap-start grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-5"
            >
              {pagina.map((socio) => (
                <div key={socio.id} className="flex flex-col items-center gap-2">
                  <div className="flex h-24 w-full items-center justify-center rounded-2xl border border-casi-negro/10 bg-white p-4 shadow-[0_10px_30px_rgba(28,13,10,0.08)]">
                    <div className="relative h-full w-full">
                      <Image
                        src={socio.logoUrl}
                        alt={socio.nombre}
                        fill
                        unoptimized
                        sizes="(min-width: 768px) 150px, 40vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <span className="text-center text-sm font-semibold text-gris-oscuro">
                    {socio.nombre}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {paginas.length > 1 ? (
          <button
            type="button"
            aria-label="Ver más socios"
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
        ) : null}
      </div>
    </section>
  );
}
