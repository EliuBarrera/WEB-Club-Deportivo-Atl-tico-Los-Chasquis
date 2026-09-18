import Image from "next/image";
import type { HitoHistoricoPublico } from "@/lib/historia";

// Fase 9, sección "Nuestra historia / línea de tiempo": recorrido
// cronológico por la historia del club, editable desde /admin/contenido
// (pestaña Historia).
// Hoy es un BORRADOR a propósito (ver PLAN_DESARROLLO.md) — solo tiene los
// dos hitos entregados por el club (fundación en 1980 y Personería
// Jurídica No. 086), a la espera de que el club entregue más hitos (fotos
// de ediciones anteriores con año y dato destacado). Las fotos vienen de
// public/Historia/: son recientes, no archivo histórico por año, así que
// se usan como acompañamiento visual del relato mientras se recopilan
// fotos de archivo reales — el texto de cada hito es el único contenido
// que se presenta como dato histórico.
export function NuestraHistoria({
  hitos,
}: {
  hitos: HitoHistoricoPublico[];
}) {
  if (hitos.length === 0) return null;

  return (
    <section id="historia" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
          Nuestra historia
        </h2>
        <p className="text-lg font-semibold text-naranja">
          Más de cuatro décadas impulsando el atletismo en Boyacá.
        </p>
        <p className="max-w-xl text-sm italic text-gris-oscuro/70">
          Versión preliminar: iremos ampliando esta línea de tiempo con más
          hitos, años y fotos de archivo a medida que el club los confirme.
        </p>
      </div>

      <ol className="relative flex flex-col gap-10 border-l-4 border-naranja/25 pl-8 sm:pl-10">
        {hitos.map((hito) => (
          <li key={hito.id} className="relative">
            <span className="absolute -left-[42px] top-1 h-6 w-6 rounded-full border-4 border-crema bg-naranja sm:-left-[50px]" />

            <div className="flex flex-col gap-4 overflow-hidden rounded-[20px] bg-white shadow-[0_10px_30px_rgba(28,13,10,0.10)] sm:flex-row">
              {hito.imagenUrl ? (
                <div className="relative aspect-[16/9] w-full shrink-0 bg-gris-oscuro sm:aspect-auto sm:w-64">
                  <Image
                    src={hito.imagenUrl}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 256px, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-2 p-5">
                {hito.anio ? (
                  <span className="w-fit rounded-full bg-naranja/10 px-3 py-1 font-mono text-sm font-bold text-naranja">
                    {hito.anio}
                  </span>
                ) : null}
                <h3 className="font-display text-xl font-extrabold uppercase text-casi-negro">
                  {hito.titulo}
                </h3>
                <p className="text-gris-oscuro">{hito.descripcion}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
