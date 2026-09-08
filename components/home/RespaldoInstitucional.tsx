import Image from "next/image";
import type { SocioPublico } from "@/lib/socios";

// Fase 9, sección "Aval institucional": antes listaba texto derivado de
// Evento.aval (no había logos en el proyecto); el club entregó después los
// logos reales de sus socios/aliados (public/Socios/), editables desde
// /admin/socios — se reemplaza el texto por el grid de logos reales.
export function RespaldoInstitucional({ socios }: { socios: SocioPublico[] }) {
  if (socios.length === 0) return null;

  return (
    <section id="respaldo" className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
          Respaldo institucional
        </h2>
        <p className="max-w-xl text-lg text-gris-oscuro">
          Entidades y aliados que respaldan nuestros eventos.
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {socios.map((socio) => (
          <div
            key={socio.id}
            className="flex h-24 items-center justify-center rounded-2xl border border-casi-negro/10 bg-white p-4 shadow-[0_10px_30px_rgba(28,13,10,0.08)]"
          >
            <div className="relative h-full w-full">
              <Image
                src={socio.logoUrl}
                alt={socio.nombre}
                fill
                unoptimized
                sizes="(min-width: 768px) 150px, 40vw"
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
