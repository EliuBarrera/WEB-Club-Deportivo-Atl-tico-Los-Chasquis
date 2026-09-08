import Image from "next/image";
import {
  getEventoCompleto,
  getEventosParaAdmin,
  getPruebasCatalogo,
  verifySession,
} from "@/lib/admin/dal";
import { cloudinaryThumb } from "@/lib/cloudinary";
import { formatFechaBadge } from "@/lib/format";
import { EliminarEventoButton } from "@/components/admin/EliminarEventoButton";
import { EventoEditor } from "@/components/admin/EventoEditor";
import { Toast } from "@/components/admin/Toast";
import {
  actualizarCategoria,
  actualizarEvento,
  actualizarNoticia,
  crearCategoria,
  crearEvento,
  crearNoticia,
  eliminarCategoria,
  eliminarEvento,
  eliminarNoticia,
  guardarLogistica,
  guardarPremios,
  guardarReglamento,
  publicarResultados,
} from "./actions";

const MENSAJES_ERROR: Record<string, string> = {
  "tiene-inscripciones":
    "No se puede eliminar: este evento ya tiene inscripciones registradas.",
  "categoria-tiene-inscripciones":
    "No se puede eliminar: esta categoría ya tiene inscripciones registradas.",
  "imagen-formato": "Formato de imagen no permitido (solo JPEG, PNG o WEBP).",
  "imagen-tamano": "La imagen supera el tamaño máximo de 5 MB.",
};

const MENSAJES_GUARDADO: Record<string, string> = {
  evento: "Cambios del evento guardados",
  "evento-creado": "Evento creado",
  categoria: "Categoría actualizada",
  "categoria-creada": "Categoría creada",
  premios: "Premios guardados",
  reglamento: "Reglamento guardado",
  logistica: "Logística guardada",
  noticia: "Noticia actualizada",
  "noticia-creada": "Noticia creada",
};

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

const ESTADO_ETIQUETA: Record<string, string> = {
  BORRADOR: "Borrador",
  ABIERTO: "Abierto",
  CERRADO: "Cerrado",
};

export default async function EventosPage({
  searchParams,
}: PageProps<"/admin/eventos">) {
  await verifySession();

  const params = await searchParams;
  // Igual que en inscripciones/page.tsx: estas dos no dependen entre sí, se
  // piden en paralelo en vez de sumar dos round-trips secuenciales a Neon.
  const [eventos, pruebasCatalogo] = await Promise.all([
    getEventosParaAdmin(),
    getPruebasCatalogo(),
  ]);

  const eventoId = primerValor(params.eventoId) ?? eventos[0]?.id;
  const error = primerValor(params.error);
  const guardado = primerValor(params.guardado);
  const guardadoTs = primerValor(params.t);
  const evento = eventoId ? await getEventoCompleto(eventoId) : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Toast
        key={guardadoTs}
        mensaje={guardado ? (MENSAJES_GUARDADO[guardado] ?? null) : null}
      />

      <h1 className="font-display text-4xl font-extrabold uppercase text-white">
        Eventos
      </h1>

      {error && MENSAJES_ERROR[error] && (
        <p className="rounded-lg bg-rojo/10 px-4 py-2 font-bold text-rojo">
          {MENSAJES_ERROR[error]}
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex flex-col gap-2.5">
          {eventos.map((item) => {
            const activo = item.id === eventoId;
            return (
              <div
                key={item.id}
                className={
                  activo
                    ? "flex flex-col gap-2 rounded-2xl bg-naranja p-3 shadow-[0_8px_20px_rgba(241,88,8,0.35)]"
                    : "flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-[0_6px_16px_rgba(28,13,10,0.08)]"
                }
              >
                <div className="flex items-center gap-2.5">
                  <a
                    href={`/admin/eventos?eventoId=${item.id}`}
                    className="flex flex-1 items-center gap-2.5 overflow-hidden"
                  >
                    <div
                      className={
                        "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] " +
                        (activo ? "bg-white/20" : "bg-casi-negro/[0.06]")
                      }
                    >
                      {item.imagenUrl ? (
                        <Image
                          src={cloudinaryThumb(item.imagenUrl, "c_fill,w_96,h_96")}
                          alt=""
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={activo ? "#ffffff" : "#1c0d0a"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>
                    <div
                      className={
                        "flex min-w-0 flex-1 flex-col gap-0.5 " +
                        (activo ? "text-white" : "text-casi-negro")
                      }
                    >
                      <span className="truncate font-display text-[15px] font-extrabold uppercase">
                        {item.titulo}
                      </span>
                      <span
                        className={
                          "text-xs font-semibold uppercase tracking-wide " +
                          (activo ? "text-white" : "text-gris-oscuro")
                        }
                      >
                        {formatFechaBadge(item.fecha)} ·{" "}
                        {ESTADO_ETIQUETA[item.estado]}
                      </span>
                    </div>
                  </a>
                  <EliminarEventoButton
                    eventoId={item.id}
                    eventoTitulo={item.titulo}
                    eliminarEventoAction={eliminarEvento}
                    claseBoton={
                      "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full " +
                      (activo
                        ? "bg-white/20 text-white"
                        : "bg-casi-negro/[0.06] text-casi-negro")
                    }
                  />
                </div>
              </div>
            );
          })}

          <form action={crearEvento}>
            <button
              type="submit"
              className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-full bg-naranja py-3 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Agregar evento
            </button>
          </form>
        </div>

        {evento ? (
          <EventoEditor
            evento={evento}
            pruebasCatalogo={pruebasCatalogo}
            actualizarEventoAction={actualizarEvento.bind(null, evento.id)}
            publicarResultadosAction={publicarResultados.bind(null, evento.id)}
            crearCategoriaAction={crearCategoria}
            actualizarCategoriaAction={actualizarCategoria}
            eliminarCategoriaAction={eliminarCategoria}
            guardarPremiosAction={guardarPremios}
            guardarReglamentoAction={guardarReglamento}
            guardarLogisticaAction={guardarLogistica}
            crearNoticiaAction={crearNoticia}
            actualizarNoticiaAction={actualizarNoticia}
            eliminarNoticiaAction={eliminarNoticia}
          />
        ) : (
          <div className="rounded-[20px] bg-white p-7 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
            <p className="italic text-gris-oscuro">
              No hay eventos todavía — usa &quot;Agregar evento&quot; para crear
              el primero.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
