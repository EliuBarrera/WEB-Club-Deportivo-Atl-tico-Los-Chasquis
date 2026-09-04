import { EventosExplorer } from "@/components/eventos/EventosExplorer";
import { getEventosPublicados } from "@/lib/eventos";

// Los eventos los administra el panel de admin (Fase 6), así que esta
// página no se puede pre-renderizar como contenido estático.
export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const eventos = await getEventosPublicados();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
          Calendario de eventos
        </h1>
        <p className="text-gris-oscuro">
          Carreras de calle y pruebas de pista y campo del Club Atlético Los
          Chasquis.
        </p>
      </header>

      <EventosExplorer eventos={eventos} />
    </main>
  );
}
