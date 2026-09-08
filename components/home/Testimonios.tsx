import Image from "next/image";
import type { TestimonioPublico } from "@/lib/testimonios";

// Fase 9, sección "Testimonios": citas reales, autorizadas por las
// personas (algunas anónimas a pedido de ellas — no se inventa un nombre
// cuando no lo hay, el pie de foto simplemente omite esa línea).
export function Testimonios({
  testimonios,
}: {
  testimonios: TestimonioPublico[];
}) {
  if (testimonios.length === 0) return null;

  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-center font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
        Voces de nuestros atletas
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {testimonios.map((testimonio) => {
          const etiqueta = [testimonio.nombre, testimonio.rol]
            .filter(Boolean)
            .join(" · ");

          return (
            <figure
              key={testimonio.id}
              className="flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_10px_30px_rgba(28,13,10,0.10)]"
            >
              {testimonio.fotoUrl ? (
                <div className="relative aspect-[4/5] w-full bg-gris-oscuro">
                  <Image
                    src={testimonio.fotoUrl}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 33vw, 90vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <figcaption className="flex flex-col gap-2 p-5">
                <blockquote className="font-display text-lg font-bold leading-snug text-casi-negro">
                  &quot;{testimonio.cita}&quot;
                </blockquote>
                {etiqueta ? (
                  <p className="text-sm font-semibold uppercase tracking-wide text-naranja">
                    {etiqueta}
                  </p>
                ) : null}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
