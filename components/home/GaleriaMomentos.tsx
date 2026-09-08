import Image from "next/image";

// Fase 9, sección "Galería de momentos": todavía no hay un banco de fotos
// de ediciones pasadas ni el widget de Instagram/Elfsight mencionado en el
// plan (no existe en el sitio actual, se verificó). Mientras se recopila
// ese contenido, reutiliza las portadas reales que ya existen por evento
// (`Evento.imagenUrl`, las mismas que se ven en sus tarjetas) — no son
// fotos nuevas, pero sí son reales y ya están en la base de datos.
export function GaleriaMomentos({
  momentos,
}: {
  momentos: { id: string; titulo: string; imagenUrl: string }[];
}) {
  if (momentos.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-center font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
        Momentos de nuestros eventos
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {momentos.map((momento) => (
          <div
            key={momento.id}
            className="relative aspect-square overflow-hidden rounded-[20px] shadow-[0_10px_30px_rgba(28,13,10,0.10)]"
          >
            <Image
              src={momento.imagenUrl}
              alt={momento.titulo}
              fill
              unoptimized
              sizes="(min-width: 640px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
