import type { SocioPublico } from "@/lib/socios";

// Logo recoloreado a naranja de marca vía CSS mask-image: el PNG/SVG del
// logo (debe tener fondo transparente) actúa como máscara sobre un
// div relleno en `bg-naranja`, en vez de mostrarse a color — mismo
// tratamiento para ambas filas, solo cambia el tamaño del contenedor.
//
// Rótulo con el nombre SIEMPRE visible debajo del logo (no solo
// `sr-only`): varios de los 18 logos reales del club son insignias
// circulares casi totalmente opacas (sin espacio negativo interno —
// medido con ImageMagick, ej. "Comisión Departamental de Juzgamiento" al
// ~79% de opacidad promedio, "Panadería mi Soffi" al ~66%), así que la
// máscara los colapsa a una mancha sólida irreconocible; uno ("SQ") ni
// siquiera tiene transparencia (100% opaco). Sin el rótulo, esas
// entidades quedarían identificables solo para lectores de pantalla y no
// para un visitante vidente. El contenedor mantiene `role="img"` +
// `aria-label` (el div de la máscara en sí es decorativo y queda
// `aria-hidden`), así que el nombre visible no duplica el anuncio en
// lectores de pantalla — lo reemplaza.
function LogoMascara({
  nombre,
  logoUrl,
  tamanoClase,
  etiquetaClase,
}: {
  nombre: string;
  logoUrl: string;
  tamanoClase: string;
  etiquetaClase: string;
}) {
  return (
    <div role="img" aria-label={nombre} className="flex flex-col items-center gap-2">
      {/* `w-full` necesita un ancho definido en el padre para resolver:
          por eso esta caja va directo en el flujo del flex-col (que sí
          hereda el ancho completo de la celda del grid) en vez de
          quedar centrada con `items-center`, que la habría encogido a
          0 — bug real que se vio en la primera pasada (logos
          invisibles). */}
      <div className={`relative w-full ${tamanoClase}`}>
        <div
          aria-hidden
          className="absolute inset-0 bg-naranja"
          style={{
            maskImage: `url(${logoUrl})`,
            WebkitMaskImage: `url(${logoUrl})`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        />
      </div>
      <span
        aria-hidden
        className={`text-center leading-tight ${etiquetaClase}`}
      >
        {nombre}
      </span>
    </div>
  );
}

// Fase 9, sección "Aval institucional": dos niveles de jerarquía visual
// sobre el mismo fondo casi-negro — avales (entidades de gobernanza/
// sanción deportiva: Liga de Atletismo, alcaldías, Indeportes...) en fila
// superior con logos más grandes, y socios/aliados de apoyo (negocios,
// logística, seguridad) en fila inferior, más densa y con logos más
// chicos. La clasificación viene de `Socio.nivel`, editable desde
// /admin/socios — ver prisma/seed.ts para el criterio usado con los 18
// socios reales ya cargados.
export function RespaldoInstitucional({ socios }: { socios: SocioPublico[] }) {
  const avales = socios.filter((socio) => socio.nivel === "AVAL");
  const aliados = socios.filter((socio) => socio.nivel === "SOCIO");

  if (avales.length === 0 && aliados.length === 0) return null;

  return (
    <section
      id="respaldo"
      className="flex flex-col items-center gap-10 rounded-[28px] bg-casi-negro px-6 py-12 sm:px-10 sm:py-14"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-crema sm:text-4xl">
          Respaldo institucional
        </h2>
        <p className="max-w-xl text-lg text-crema/70">
          Entidades y aliados que respaldan nuestros eventos.
        </p>
      </div>

      {avales.length > 0 ? (
        <div className="flex w-full flex-col items-center gap-6">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-naranja">
            Aval institucional
          </span>
          <div className="grid w-full max-w-3xl grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            {avales.map((socio) => (
              <LogoMascara
                key={socio.id}
                nombre={socio.nombre}
                logoUrl={socio.logoUrl}
                tamanoClase="h-20 sm:h-28"
                etiquetaClase="font-display text-sm font-bold uppercase tracking-tight text-crema sm:text-base"
              />
            ))}
          </div>
        </div>
      ) : null}

      {avales.length > 0 && aliados.length > 0 ? (
        <div className="h-px w-full max-w-sm bg-naranja/30" />
      ) : null}

      {aliados.length > 0 ? (
        <div className="flex w-full flex-col items-center gap-6">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-crema/50">
            Nuestros aliados
          </span>
          <div className="grid w-full grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
            {aliados.map((socio) => (
              <LogoMascara
                key={socio.id}
                nombre={socio.nombre}
                logoUrl={socio.logoUrl}
                tamanoClase="h-10 sm:h-14"
                etiquetaClase="font-mono text-[10px] uppercase tracking-wide text-crema/60 sm:text-xs"
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
