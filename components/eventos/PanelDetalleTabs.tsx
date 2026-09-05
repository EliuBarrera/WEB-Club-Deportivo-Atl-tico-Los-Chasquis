"use client";

import { useState } from "react";
import type { EventoPublicado } from "@/lib/eventos";
import { formatFechaBadge } from "@/lib/format";

const TABS = [
  "Información",
  "Recorridos",
  "Premios",
  "Reglamento",
  "Logística",
  "Noticias",
  "Contacto",
] as const;

type Tab = (typeof TABS)[number];

// Contenido completo de cada tab (recorridos, premios, reglamento,
// logística, noticias, contacto) se conecta a la base de datos en la
// Fase 3. Por ahora solo "Información" muestra datos reales del evento.
export function PanelDetalleTabs({ evento }: { evento: EventoPublicado }) {
  const [tabActiva, setTabActiva] = useState<Tab>("Información");

  return (
    <div className="flex w-full flex-col rounded-2xl border-2 border-casi-negro bg-casi-negro/5 p-4 sm:p-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setTabActiva(tab)}
            className={`rounded-t-lg px-4 py-2 font-display text-lg font-bold ${
              tab === tabActiva
                ? "bg-crema text-casi-negro"
                : "bg-casi-negro/10 text-gris-oscuro"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[280px] rounded-b-2xl rounded-tr-2xl bg-crema p-5">
        {tabActiva === "Información" ? (
          <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-base font-bold uppercase text-gris-oscuro">
                  Fecha
                </dt>
                <dd className="text-xl">{formatFechaBadge(evento.fecha)}</dd>
              </div>
              {evento.horario ? (
                <div>
                  <dt className="text-base font-bold uppercase text-gris-oscuro">
                    Horario
                  </dt>
                  <dd className="text-xl">{evento.horario}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-base font-bold uppercase text-gris-oscuro">
                  Ubicación
                </dt>
                <dd className="text-xl">{evento.ubicacion}</dd>
              </div>
              {evento.cierreInscripciones ? (
                <div>
                  <dt className="text-base font-bold uppercase text-gris-oscuro">
                    Cierre inscripciones
                  </dt>
                  <dd className="text-xl">{evento.cierreInscripciones}</dd>
                </div>
              ) : null}
            </dl>

            {evento.descripcion ? (
              <div>
                <h4 className="mb-1 font-display text-xl font-bold uppercase">
                  Sobre el evento
                </h4>
                <p className="text-lg leading-relaxed">
                  {evento.descripcion}
                </p>
              </div>
            ) : null}

            {evento.aval ? (
              <div>
                <h4 className="mb-1 font-display text-xl font-bold uppercase">
                  Aval
                </h4>
                <p className="text-lg leading-relaxed">{evento.aval}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-lg italic text-gris-oscuro">
            Esta sección se completa en la Fase 3 (panel de detalle del
            evento).
          </p>
        )}
      </div>
    </div>
  );
}
