"use client";

import { useMemo, useState } from "react";
import type { EstadoPago } from "@prisma/client";
import type { InscripcionAtleta } from "@/lib/atletas/dal";
import { formatFechaBadge, formatPrecio } from "@/lib/format";
import { ESTADO_PAGO_BADGE } from "@/lib/estadoPagoBadge";
import { DatosCarrera } from "@/components/eventos/DatosCarrera";

// Lo que incluye el kit de la inscripción: los derechos de su grupo de
// tarifa (Fase 12.6) o, si el evento no los usa, el kit de Logística.
function kitDeInscripcion(inscripcion: InscripcionAtleta): string[] {
  const grupo =
    inscripcion.grupoTarifa ?? inscripcion.categoria?.grupoTarifa ?? null;
  if (grupo && grupo.derechos.length > 0) return grupo.derechos;
  return inscripcion.evento.logistica?.kit.map((k) => k.texto) ?? [];
}

const DIAS_SEMANA = ["D", "L", "M", "M", "J", "V", "S"];
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Punto de color por día en la grilla — mismo criterio de colores que
// ESTADO_PAGO_BADGE (lib/estadoPagoBadge.ts), pero solo el fondo: en una
// celda de ~32px no cabe el texto del badge.
const ESTADO_PUNTO: Record<EstadoPago, string> = {
  APROBADO: "bg-verde",
  PENDIENTE: "bg-amarillo",
  ERROR: "bg-rojo",
  RECHAZADO: "bg-casi-negro/30",
  DECLINADO: "bg-casi-negro/30",
};

function inicioDeMes(fecha: Date): Date {
  return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), 1));
}

// Calendario interactivo de /atletas (a diferencia de MiniCalendario.tsx,
// que solo resalta el día de UN evento sin selección ni navegación): acá
// puede haber varias inscripciones repartidas en varios meses, así que
// hace falta navegar entre meses y poder tocar un día para ver el detalle
// de esa inscripción. Solo recibe inscripciones de eventos futuros — el
// filtro por fecha vive en app/atletas/page.tsx.
export function CalendarioProximosEventos({
  inscripciones,
}: {
  inscripciones: InscripcionAtleta[];
}) {
  const primeraFechaFutura = inscripciones[0]?.evento.fecha ?? new Date();
  const [mesActual, setMesActual] = useState(() =>
    inicioDeMes(primeraFechaFutura),
  );
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(
    inscripciones[0]?.id ?? null,
  );

  const anio = mesActual.getUTCFullYear();
  const mes = mesActual.getUTCMonth();

  const porDia = useMemo(() => {
    const mapa = new Map<number, InscripcionAtleta[]>();
    for (const inscripcion of inscripciones) {
      const fecha = inscripcion.evento.fecha;
      if (fecha.getUTCFullYear() !== anio || fecha.getUTCMonth() !== mes) {
        continue;
      }
      const dia = fecha.getUTCDate();
      const lista = mapa.get(dia) ?? [];
      lista.push(inscripcion);
      mapa.set(dia, lista);
    }
    return mapa;
  }, [inscripciones, anio, mes]);

  const primerDiaSemana = new Date(Date.UTC(anio, mes, 1)).getUTCDay();
  const diasEnMes = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
  const celdas: (number | null)[] = [
    ...Array(primerDiaSemana).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];

  const seleccionada = inscripciones.find((i) => i.id === seleccionadaId);

  function irAMes(delta: number) {
    setMesActual(new Date(Date.UTC(anio, mes + delta, 1)));
  }

  return (
    <div className="flex flex-col gap-5 rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
      <h2 className="font-display text-lg font-extrabold uppercase">
        Próximos eventos
      </h2>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => irAMes(-1)}
          aria-label="Mes anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-casi-negro/[0.06] text-casi-negro"
        >
          ‹
        </button>
        <span className="font-display text-sm font-bold uppercase tracking-wide">
          {MESES[mes]} {anio}
        </span>
        <button
          type="button"
          onClick={() => irAMes(1)}
          aria-label="Mes siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-casi-negro/[0.06] text-casi-negro"
        >
          ›
        </button>
      </div>

      <table className="w-full table-fixed border-collapse text-center">
        <thead>
          <tr>
            {DIAS_SEMANA.map((d, i) => (
              <th
                key={i}
                className="pb-1 text-xs font-bold text-gris-oscuro"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(celdas.length / 7) }, (_, fila) => (
            <tr key={fila}>
              {celdas.slice(fila * 7, fila * 7 + 7).map((dia, i) => {
                const inscripcionesDia = dia ? porDia.get(dia) : undefined;
                const primera = inscripcionesDia?.[0];

                return (
                  <td key={i} className="py-1">
                    {dia === null ? null : primera ? (
                      <button
                        type="button"
                        onClick={() => setSeleccionadaId(primera.id)}
                        aria-label={`${dia} de ${MESES[mes]}: ${primera.evento.titulo}`}
                        className={
                          "relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white " +
                          ESTADO_PUNTO[primera.estadoPago] +
                          (seleccionadaId === primera.id
                            ? " ring-2 ring-naranja ring-offset-1"
                            : "")
                        }
                      >
                        {dia}
                        {inscripcionesDia && inscripcionesDia.length > 1 ? (
                          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-naranja text-[9px] leading-none">
                            {inscripcionesDia.length}
                          </span>
                        ) : null}
                      </button>
                    ) : (
                      <span className="text-sm text-gris-oscuro">{dia}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gris-oscuro">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-verde" /> Aprobado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amarillo" /> Pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rojo" /> Error
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-casi-negro/30" />{" "}
          Rechazado/declinado
        </span>
      </div>

      {seleccionada ? (
        <div className="flex flex-col gap-2 rounded-2xl bg-crema p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-base font-extrabold uppercase leading-tight">
              {seleccionada.evento.titulo}
            </p>
            <button
              type="button"
              onClick={() => setSeleccionadaId(null)}
              aria-label="Cerrar detalle"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-casi-negro/[0.08] text-xs text-casi-negro"
            >
              ×
            </button>
          </div>

          <span
            className={
              "w-fit rounded-full px-3 py-1 text-xs font-bold uppercase " +
              ESTADO_PAGO_BADGE[seleccionada.estadoPago]
            }
          >
            {seleccionada.estadoPago}
          </span>

          <p className="text-sm text-gris-oscuro">
            {formatFechaBadge(seleccionada.evento.fecha)}
            {" · "}
            {seleccionada.categoria?.nombre ?? seleccionada.grupoTarifa?.nombre ?? "—"}
            {seleccionada.pruebasIds.length > 0
              ? ` · ${seleccionada.pruebasIds.join(", ")}`
              : ""}
          </p>

          <p className="font-display text-lg font-extrabold">
            {seleccionada.totalPago === 0 ? "Gratis" : formatPrecio(seleccionada.totalPago)}
          </p>

          <p className="text-xs text-gris-oscuro/70">
            Inscrito el {formatFechaBadge(seleccionada.createdAt)}
          </p>

          <RecordatorioLogistica inscripcion={seleccionada} />
        </div>
      ) : null}
    </div>
  );
}

// Recordatorio de logística (Fase 10): lo que el atleta necesita a mano
// el día de la carrera, con datos que ya existen en el evento y en su
// categoría. Cada bloque se omite si el club aún no lo ha cargado.
function RecordatorioLogistica({
  inscripcion,
}: {
  inscripcion: InscripcionAtleta;
}) {
  const { evento, categoria } = inscripcion;
  const kit = kitDeInscripcion(inscripcion);
  const tieneDatosCarrera = Boolean(
    categoria &&
      (categoria.distancia || categoria.horaSalida || categoria.sitioSalida),
  );

  if (!evento.horario && !evento.ubicacion && !tieneDatosCarrera && kit.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-col gap-3 border-t border-casi-negro/10 pt-3">
      <p className="font-display text-sm font-extrabold uppercase text-naranja">
        Para el día de la carrera
      </p>

      {evento.horario || evento.ubicacion ? (
        <dl className="flex flex-col gap-1">
          {evento.horario ? (
            <div className="flex flex-col">
              <dt className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
                Horario
              </dt>
              <dd className="text-sm">{evento.horario}</dd>
            </div>
          ) : null}
          {evento.ubicacion ? (
            <div className="flex flex-col">
              <dt className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
                Ubicación
              </dt>
              <dd className="text-sm">{evento.ubicacion}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {categoria && tieneDatosCarrera ? (
        <DatosCarrera categoria={categoria} />
      ) : null}

      {kit.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
            Tu kit incluye
          </p>
          <ul className="list-disc pl-5 text-sm">
            {kit.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
