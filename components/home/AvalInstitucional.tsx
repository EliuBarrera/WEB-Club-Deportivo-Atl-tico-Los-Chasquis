// Fase 9, sección "Aval institucional": en vez de logos nuevos (no hay
// ninguno recopilado todavía, ver PLAN_DESARROLLO.md), lista las entidades
// reales que ya están registradas en `Evento.aval` para eventos existentes
// (ver deriveAvalesInstitucionales en lib/format.ts) — datos reales, no
// inventados, y se actualiza solo con lo que el admin ya carga por evento.
export function AvalInstitucional({ entidades }: { entidades: string[] }) {
  if (entidades.length === 0) return null;

  return (
    <section id="respaldo" className="flex flex-col items-center gap-6 text-center">
      <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
        Respaldo institucional
      </h2>
      <p className="max-w-xl text-lg text-gris-oscuro">
        Nuestros eventos cuentan con el aval de estas entidades:
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {entidades.map((entidad) => (
          <span
            key={entidad}
            className="rounded-full bg-white px-5 py-2.5 font-display text-base font-bold uppercase tracking-tight text-casi-negro shadow-[0_10px_30px_rgba(28,13,10,0.08)]"
          >
            {entidad}
          </span>
        ))}
      </div>
    </section>
  );
}
