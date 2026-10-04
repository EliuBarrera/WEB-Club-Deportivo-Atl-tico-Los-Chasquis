import type { EventoPublicado } from "@/lib/eventos";

type CategoriaPublicada = EventoPublicado["categorias"][number];

// Distancia/vueltas/hora/sitios de una categoría de carrera de calle
// (Fase 12.3). Compartido con el formulario de inscripción.
export function DatosCarrera({ categoria }: { categoria: CategoriaPublicada }) {
  const filas = [
    [
      "Distancia",
      categoria.distancia
        ? `${categoria.distancia.nombre}${categoria.vueltas && categoria.vueltas > 1 ? ` (${categoria.vueltas} vueltas)` : ""}`
        : null,
    ],
    ["Salida", categoria.horaSalida],
    [
      "Lugar",
      categoria.sitioSalida && categoria.sitioLlegada && categoria.sitioLlegada !== categoria.sitioSalida
        ? `${categoria.sitioSalida} → ${categoria.sitioLlegada}`
        : categoria.sitioSalida,
    ],
  ].filter((par): par is [string, string] => Boolean(par[1]));

  if (filas.length === 0) {
    return <span className="text-sm text-gris-oscuro">Distancia por confirmar</span>;
  }
  return (
    <dl className="flex flex-col gap-1">
      {filas.map(([etiqueta, valor]) => (
        <div key={etiqueta} className="flex flex-col">
          <dt className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
            {etiqueta}
          </dt>
          <dd className="text-sm">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
