import Image from "next/image";
import type { DocumentoLegalPublico } from "@/lib/documentosLegales";

// Reconstruye Documentation/reglamento-legal-section.html (aprobado
// visualmente por el club) como componente de Next.js, pero con el
// lenguaje visual actual del sitio: sombras suaves difuminadas en vez de
// los bordes gruesos + sombra dura tipo "cutout" del HTML original (ver
// PLAN_DESARROLLO.md, nota de Fase 6 sobre el cambio de dirección de
// diseño). El fondo del panel de título usa el banner corporativo real del
// club (public/admin-banner.jpg, ya reutilizado en el panel admin) en vez
// de un color plano con una figura decorativa inventada.
export function DocumentosLegales({
  documentos,
}: {
  documentos: DocumentoLegalPublico[];
}) {
  return (
    <section className="grid overflow-hidden rounded-[28px] bg-white shadow-[0_10px_30px_rgba(28,13,10,0.12)] md:grid-cols-[1.1fr_0.9fr]">
      <div className="order-2 flex flex-col md:order-1">
        {documentos.length === 0 ? (
          <p className="p-6 text-lg italic text-gris-oscuro">
            Próximamente.
          </p>
        ) : (
          documentos.map((documento) => (
            <a
              key={documento.id}
              href={documento.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 border-b border-casi-negro/10 px-6 py-4 transition-colors last:border-none hover:bg-naranja/10"
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-naranja text-white transition-colors group-hover:bg-casi-negro">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 20h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-9l-2-2H3a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1Z" />
                </svg>
              </span>
              <span className="font-display text-lg font-bold uppercase leading-tight tracking-tight text-casi-negro transition-colors group-hover:text-naranja">
                {documento.nombre}
              </span>
            </a>
          ))
        )}
      </div>

      <div className="relative order-1 flex min-h-[260px] items-center overflow-hidden bg-casi-negro px-8 py-10 md:order-2">
        <Image
          src="/admin-banner.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-casi-negro via-casi-negro/70 to-casi-negro/20" />

        <div className="relative z-10 flex flex-col gap-4">
          <span className="w-fit rounded-full border border-naranja px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-naranja">
            Club Atlético Los Chasquis
          </span>
          <h2 className="font-display text-4xl font-black uppercase leading-[0.95] text-crema sm:text-5xl">
            Reglamento interno y{" "}
            <span className="text-naranja">disposiciones legales</span>
          </h2>
        </div>
      </div>
    </section>
  );
}
