import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
import { ProximosEventosHome } from "@/components/home/ProximosEventosHome";
import { AvalInstitucional } from "@/components/home/AvalInstitucional";
import { GaleriaMomentos } from "@/components/home/GaleriaMomentos";
import { TransparenciaTeaser } from "@/components/home/TransparenciaTeaser";
import { CtaFinal } from "@/components/home/CtaFinal";
import { getEventosPublicados, getTerminosVigente } from "@/lib/eventos";
import { deriveAvalesInstitucionales } from "@/lib/format";

export const metadata: Metadata = {
  title: "Club Atlético Los Chasquis",
  description:
    "Club Deportivo Atlético Los Chasquis (Tunja, Boyacá): festivales atléticos y carreras de calle. Consulta el calendario de eventos e inscríbete en línea.",
};

// La home depende de los eventos del admin (próximos eventos, portada del
// hero, avales), así que no se puede pre-renderizar como contenido
// estático — mismo criterio que /eventos y /transparencia.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // No dependen entre sí — se piden en paralelo, mismo criterio que
  // app/eventos/page.tsx.
  const [eventos, terminos] = await Promise.all([
    getEventosPublicados(),
    getTerminosVigente(),
  ]);

  const eventosAbiertos = eventos.filter(
    (evento) => evento.estado === "ABIERTO"
  );

  // Portada real del próximo evento abierto (Hero.tsx cae al banner del
  // club si no hay ninguna) — nunca la de un evento ya cerrado, para no
  // insinuar que una carrera pasada sigue vigente.
  const heroImagenUrl =
    eventosAbiertos.find((evento) => evento.imagenUrl)?.imagenUrl ?? null;

  const avales = deriveAvalesInstitucionales(
    eventos.map((evento) => evento.aval)
  );

  const momentos = eventos
    .filter(
      (evento): evento is typeof evento & { imagenUrl: string } =>
        Boolean(evento.imagenUrl)
    )
    .slice(-8)
    .reverse()
    .map((evento) => ({
      id: evento.id,
      titulo: evento.titulo,
      imagenUrl: evento.imagenUrl,
    }));

  return (
    <>
      <Header />
      <Hero imagenUrl={heroImagenUrl} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-4 py-16 sm:px-8">
        <section className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
              Próximos eventos
            </h2>
            <p className="text-lg font-semibold text-naranja">
              Inscríbete y sé parte de la próxima carrera.
            </p>
          </div>
          <ProximosEventosHome eventos={eventosAbiertos} />
        </section>

        <AvalInstitucional entidades={avales} />

        <GaleriaMomentos momentos={momentos} />

        <TransparenciaTeaser />

        <CtaFinal />
      </main>

      <Footer terminos={terminos} />
    </>
  );
}
