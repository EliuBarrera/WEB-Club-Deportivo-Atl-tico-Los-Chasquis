import Link from "next/link";

// Fase 9, sección "CTA final": última invitación a inscribirse antes del
// footer.
export function CtaFinal() {
  return (
    <section className="flex flex-col items-center gap-5 py-6 text-center">
      <h2 className="max-w-2xl font-display text-3xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
        Tu próxima carrera empieza aquí
      </h2>
      <Link
        href="/eventos"
        className="rounded-full bg-naranja px-10 py-4 font-display text-xl font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
      >
        Ver próximos eventos
      </Link>
    </section>
  );
}
