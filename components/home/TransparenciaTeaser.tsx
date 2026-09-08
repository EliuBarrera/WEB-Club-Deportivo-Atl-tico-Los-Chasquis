import Link from "next/link";

// Fase 9, sección "Documentos legales y transparencia": la sección completa
// vive en /transparencia (Fase 9, decisión ya tomada — ver
// PLAN_DESARROLLO.md), esto es solo la invitación desde el home.
export function TransparenciaTeaser() {
  return (
    <section className="flex flex-col items-center gap-4 rounded-[28px] bg-casi-negro px-6 py-12 text-center shadow-[0_10px_30px_rgba(28,13,10,0.15)] sm:px-12">
      <span className="w-fit rounded-full border border-naranja px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-naranja">
        Transparencia
      </span>
      <h2 className="max-w-lg font-display text-3xl font-extrabold uppercase leading-tight text-crema sm:text-4xl">
        Estatutos, actas y estados financieros a la vista de todos
      </h2>
      <p className="max-w-md text-crema/80">
        Como club deportivo, ponemos a disposición pública nuestros
        documentos institucionales.
      </p>
      <Link
        href="/transparencia"
        className="mt-2 rounded-full bg-naranja px-8 py-3.5 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
      >
        Ver documentos
      </Link>
    </section>
  );
}
