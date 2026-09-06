"use client";

import { useState } from "react";
import { MiniCalendario } from "./MiniCalendario";

const FLECHA_IZQUIERDA = (
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
);

const FLECHA_DERECHA = (
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
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// Carrusel de dos diapositivas: calendario (Fase 2) y mapa de ubicación
// embebido en un <iframe>, como exige la Google Maps Embed API (una URL
// de /maps/embed no se puede abrir directamente en el navegador).
export function CalendarioMapaCarrusel({
  titulo,
  fecha,
  horario,
  ubicacion,
  descripcion,
  mapUrl,
}: {
  titulo: string;
  fecha: Date;
  horario: string | null;
  ubicacion: string;
  descripcion: string | null;
  mapUrl: string | null;
}) {
  const [mostrarMapa, setMostrarMapa] = useState(false);

  if (!mapUrl) {
    return (
      <MiniCalendario
        titulo={titulo}
        fecha={fecha}
        horario={horario}
        ubicacion={ubicacion}
        descripcion={descripcion}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {mostrarMapa ? (
        <div className="overflow-hidden rounded-2xl border-2 border-casi-negro">
          <iframe
            src={mapUrl}
            title={`Mapa de ubicación: ${ubicacion}`}
            width="100%"
            height="220"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <MiniCalendario
          titulo={titulo}
          fecha={fecha}
          horario={horario}
          ubicacion={ubicacion}
          descripcion={descripcion}
        />
      )}

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Diapositiva anterior"
          onClick={() => setMostrarMapa((actual) => !actual)}
          className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-casi-negro bg-white text-casi-negro transition-colors hover:bg-casi-negro hover:text-white"
        >
          {FLECHA_IZQUIERDA}
        </button>

        <div className="flex gap-1.5" role="tablist" aria-label="Calendario o mapa">
          <button
            type="button"
            role="tab"
            aria-selected={!mostrarMapa}
            aria-label="Ver calendario"
            onClick={() => setMostrarMapa(false)}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              !mostrarMapa ? "bg-casi-negro" : "bg-casi-negro/25"
            }`}
          />
          <button
            type="button"
            role="tab"
            aria-selected={mostrarMapa}
            aria-label="Ver mapa"
            onClick={() => setMostrarMapa(true)}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              mostrarMapa ? "bg-casi-negro" : "bg-casi-negro/25"
            }`}
          />
        </div>

        <button
          type="button"
          aria-label="Diapositiva siguiente"
          onClick={() => setMostrarMapa((actual) => !actual)}
          className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-casi-negro bg-white text-casi-negro transition-colors hover:bg-casi-negro hover:text-white"
        >
          {FLECHA_DERECHA}
        </button>
      </div>
    </div>
  );
}
