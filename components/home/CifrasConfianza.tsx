import type { CifraConfianzaPublica } from "@/lib/cifras";

// Fase 9, sección "Barra de cifras de confianza": franja angosta con
// números grandes en Space Mono. Cifras reales entregadas por el club
// (editables desde /admin/cifras) — no se inventan ni se recalculan acá.
export function CifrasConfianza({
  cifras,
}: {
  cifras: CifraConfianzaPublica[];
}) {
  if (cifras.length === 0) return null;

  return (
    <section className="grid grid-cols-2 gap-6 rounded-[28px] bg-casi-negro px-6 py-10 text-center shadow-[0_10px_30px_rgba(28,13,10,0.15)] sm:grid-cols-4 sm:px-10">
      {cifras.map((cifra) => (
        <div key={cifra.id} className="flex flex-col gap-1">
          <span className="font-mono text-4xl font-bold text-naranja sm:text-5xl">
            {cifra.valor}
          </span>
          <span className="font-display text-sm font-bold uppercase tracking-wide text-crema sm:text-base">
            {cifra.etiqueta}
          </span>
        </div>
      ))}
    </section>
  );
}
