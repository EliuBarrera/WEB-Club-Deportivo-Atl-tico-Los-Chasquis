import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DocumentosLegales } from "@/components/DocumentosLegales";
import { getDocumentosLegales } from "@/lib/documentosLegales";
import { getTerminosVigente } from "@/lib/eventos";

export const metadata: Metadata = {
  title: "Transparencia y documentos legales · Club Los Chasquis",
};

// Los documentos los administra el panel de admin (Fase 9), así que esta
// página no se puede pre-renderizar como contenido estático.
export const dynamic = "force-dynamic";

export default async function TransparenciaPage() {
  // No dependen entre sí — se piden en paralelo, mismo criterio que
  // app/eventos/page.tsx.
  const [documentos, terminos] = await Promise.all([
    getDocumentosLegales(),
    getTerminosVigente(),
  ]);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Transparencia
          </h1>
          <p className="text-xl font-semibold text-naranja">
            Documentos institucionales del Club Deportivo Atlético Los
            Chasquis, disponibles para consulta pública.
          </p>
        </header>

        <DocumentosLegales documentos={documentos} />
      </main>
      <Footer terminos={terminos} />
    </>
  );
}
