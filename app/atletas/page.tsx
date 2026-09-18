import Image from "next/image";
import type { Metadata } from "next";
import type { EstadoPago } from "@prisma/client";
import { PublicDock } from "@/components/PublicDock";
import { Footer } from "@/components/Footer";
import { FormularioBusqueda } from "@/components/atletas/FormularioBusqueda";
import { AccionesInscripcion } from "@/components/atletas/AccionesInscripcion";
import { CalendarioProximosEventos } from "@/components/atletas/CalendarioProximosEventos";
import { getInscripcionesAtleta } from "@/lib/atletas/dal";
import { cerrarSesionAtletaAction } from "./actions";
import { getTerminosVigente } from "@/lib/eventos";
import { formatFechaBadge, formatPrecio } from "@/lib/format";
import { ESTADO_PAGO_BADGE } from "@/lib/estadoPagoBadge";

export const metadata: Metadata = {
  title: "Mis inscripciones · Club Los Chasquis",
};

// Orden de los grupos en /atletas: lo más tranquilizador primero
// (aprobadas), luego lo que requiere seguimiento. Es un orden propio de
// esta vista, distinto del que usa el filtro del admin
// (`ESTADOS_PAGO` en lib/estadoPagoBadge.ts), así que no se reutiliza esa
// constante acá.
const ORDEN_GRUPOS: EstadoPago[] = [
  "APROBADO",
  "PENDIENTE",
  "RECHAZADO",
  "DECLINADO",
  "ERROR",
];

// La sesión de atleta vive en una cookie (lib/atletas/sesion.ts), así que
// esta página no se puede pre-renderizar como contenido estático — mismo
// criterio que el resto de páginas públicas que dependen de datos
// dinámicos (app/eventos/page.tsx, app/page.tsx).
export const dynamic = "force-dynamic";

export default async function AtletasPage() {
  const [inscripciones, terminos] = await Promise.all([
    getInscripcionesAtleta(),
    getTerminosVigente(),
  ]);

  // Para el calendario de la derecha: solo eventos que todavía no pasan,
  // ordenados por fecha (no por createdAt como el resto de la vista) para
  // que el mes inicial del calendario sea el del próximo evento.
  const inicioHoy = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
    ),
  );
  const proximosEventos = (inscripciones ?? [])
    .filter((i) => i.evento.fecha >= inicioHoy)
    .sort((a, b) => a.evento.fecha.getTime() - b.evento.fecha.getTime());

  return (
    <>
      <main
        className={
          inscripciones === null
            ? "mx-auto flex w-full flex-1 flex-col px-4 py-16 sm:w-[80%] sm:px-0"
            : "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-16 sm:px-8"
        }
      >
        {inscripciones === null ? (
          // Mismas formas que app/admin/login/page.tsx (tarjeta con recorte
          // diagonal sobre un fondo a página completa), con la variante
          // clara del banner (Banner_login.png) — pero, a diferencia del
          // login admin, acá se mantienen el Dock y el Footer públicos, así
          // que no ocupa min-h-screen sino una franja alta dentro de <main>.
          <div className="relative flex w-full flex-1 overflow-hidden rounded-[28px] bg-crema shadow-[0_10px_30px_rgba(28,13,10,0.14)] md:min-h-[560px]">
            <Image
              src="/Banner_login.png"
              alt=""
              fill
              priority
              className="object-cover"
            />
            <div className="relative z-10 flex w-full flex-1 items-center bg-white px-6 py-12 sm:px-10 md:w-[45%] md:flex-none md:[clip-path:polygon(0_0,76%_0,100%_23%,84%_90%,0_100%)] lg:w-[42%]">
              <FormularioBusqueda />
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-6">
            <h1 className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Mis inscripciones
            </h1>

            {inscripciones.length === 0 ? (
              <p className="text-gris-oscuro">
                No encontramos inscripciones asociadas a estos datos.
              </p>
            ) : (
              // Calendario a la derecha (lg+): solo próximos eventos, con
              // detalle al presionar cada uno — ver
              // CalendarioProximosEventos.tsx. En pantallas angostas queda
              // debajo del listado (el grid colapsa a una columna).
              <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
                <div className="flex flex-col gap-4">
                  {ORDEN_GRUPOS.map((estado) => {
                    const grupo = inscripciones.filter(
                      (i) => i.estadoPago === estado,
                    );
                    if (grupo.length === 0) return null;

                    return (
                      <details
                        key={estado}
                        open
                        className="group rounded-[20px] bg-white shadow-[0_10px_30px_rgba(28,13,10,0.10)]"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
                          <span
                            className={
                              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-display text-sm font-bold uppercase " +
                              ESTADO_PAGO_BADGE[estado]
                            }
                          >
                            {estado}
                            <span className="rounded-full bg-white/40 px-2 text-xs">
                              {grupo.length}
                            </span>
                          </span>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="shrink-0 text-casi-negro transition-transform group-open:rotate-180"
                            aria-hidden
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </summary>

                        <ul className="flex flex-col gap-3 px-5 pb-5">
                          {grupo.map((inscripcion) => (
                            <li
                              key={inscripcion.id}
                              className="flex flex-col gap-3 rounded-[16px] bg-crema p-4 sm:flex-row sm:items-center sm:gap-5"
                            >
                              {inscripcion.evento.imagenUrl ? (
                                <Image
                                  src={inscripcion.evento.imagenUrl}
                                  alt=""
                                  width={96}
                                  height={96}
                                  className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                                />
                              ) : null}

                              <div className="flex flex-1 flex-col gap-1">
                                <p className="font-display text-lg font-extrabold uppercase">
                                  {inscripcion.evento.titulo}
                                </p>
                                <p className="text-sm text-gris-oscuro">
                                  {formatFechaBadge(inscripcion.evento.fecha)}
                                  {" · "}
                                  {inscripcion.categoria?.nombre ??
                                    inscripcion.costo?.tipo ??
                                    "—"}
                                  {inscripcion.pruebasIds.length > 0
                                    ? ` · ${inscripcion.pruebasIds.join(", ")}`
                                    : ""}
                                </p>
                                <p className="text-xs text-gris-oscuro/70">
                                  Inscrito el{" "}
                                  {formatFechaBadge(inscripcion.createdAt)}
                                </p>
                              </div>

                              <div className="flex flex-col items-start gap-2 sm:items-end">
                                <span className="font-display text-lg font-extrabold">
                                  {formatPrecio(inscripcion.totalPago)}
                                </span>
                                <AccionesInscripcion
                                  inscripcionId={inscripcion.id}
                                  estadoPago={inscripcion.estadoPago}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </details>
                    );
                  })}
                </div>

                {proximosEventos.length > 0 ? (
                  <CalendarioProximosEventos inscripciones={proximosEventos} />
                ) : (
                  <div className="flex flex-col gap-2 rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
                    <h2 className="font-display text-lg font-extrabold uppercase">
                      Próximos eventos
                    </h2>
                    <p className="italic text-gris-oscuro">
                      No tienes eventos próximos inscritos.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer terminos={terminos} />
      <PublicDock
        cerrarSesionAction={
          inscripciones !== null ? cerrarSesionAtletaAction : undefined
        }
      />
    </>
  );
}
