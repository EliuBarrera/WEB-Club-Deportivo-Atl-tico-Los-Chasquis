import Image from "next/image";
import Link from "next/link";

// Fondo: la portada real del próximo evento ABIERTO (misma imagen que ya
// se usa en su tarjeta) cuando existe, para no depender de una foto de
// carrera nueva que todavía no se ha recopilado (ver PLAN_DESARROLLO.md,
// Fase 9, "Contenido real que falta recopilar"). Si no hay ningún evento
// abierto con imagen, cae al banner corporativo del club (mismo criterio
// que components/DocumentosLegales.tsx) en vez de dejar el hero vacío.
export function Hero({ imagenUrl }: { imagenUrl: string | null }) {
  return (
    <section className="relative flex min-h-[620px] items-end overflow-hidden sm:min-h-[720px]">
      {imagenUrl ? (
        // ibb.co responde demasiado lento para el optimizador de Next.js
        // (ver nota de Fase 3 en PLAN_DESARROLLO.md) — mismo `unoptimized`
        // que usa TarjetaEvento.tsx para esta misma imagen.
        <Image
          src={imagenUrl}
          alt=""
          fill
          unoptimized
          priority
          className="object-cover"
        />
      ) : (
        <Image src="/admin-banner.jpg" alt="" fill priority className="object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-casi-negro via-casi-negro/70 to-casi-negro/20" />

      <div className="relative z-10 flex w-full flex-col gap-5 px-4 pb-14 pt-24 sm:px-8 sm:pb-20">
        <span className="w-fit rounded-full border border-naranja px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-naranja">
          Club Atlético Los Chasquis
        </span>
        <h1 className="max-w-3xl font-display text-5xl font-black uppercase leading-[0.95] text-crema sm:text-7xl">
          Festivales atléticos y carreras de calle en Boyacá
        </h1>
        <p className="max-w-xl text-lg font-semibold text-crema/90 sm:text-xl">
          Organizamos carreras de calle y pruebas de pista y campo en Tunja y
          la región, con el respaldo de las entidades que impulsan el
          atletismo en Boyacá.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Link
            href="/eventos"
            className="rounded-full bg-naranja px-8 py-4 font-display text-lg font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
          >
            Ver próximos eventos
          </Link>
          <a
            href="#respaldo"
            className="rounded-full border border-crema px-8 py-4 font-display text-lg font-bold uppercase text-crema"
          >
            Conoce nuestro respaldo
          </a>
        </div>
      </div>
    </section>
  );
}
