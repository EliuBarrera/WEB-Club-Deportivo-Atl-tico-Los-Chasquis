import {
  getEventoCompleto,
  getEventosParaAdmin,
  getPruebasCatalogo,
  verifySession,
} from "@/lib/admin/dal";
import { getAtletasUnicos } from "@/lib/admin/atletas";
import { EventosLista } from "@/components/admin/EventosLista";
import { EventoEditor } from "@/components/admin/EventoEditor";
import { Toast } from "@/components/admin/Toast";
import {
  actualizarCategoria,
  actualizarEvento,
  actualizarNoticia,
  crearCategoria,
  crearEvento,
  crearEventoDesdeJson,
  crearNoticia,
  eliminarCategoria,
  eliminarEvento,
  eliminarNoticia,
  enviarResumenEvento,
  guardarLogistica,
  guardarPremios,
  guardarReglamento,
  publicarResultados,
} from "./actions";

// La Server Action enviarResumenEvento (difusión masiva, Fase 11) hereda
// este límite: un loop con concurrencia acotada a varios cientos de
// destinatarios reales termina en segundos, pero se sube el límite por
// defecto de la función serverless de todos modos.
export const maxDuration = 300;

const MENSAJES_ERROR: Record<string, string> = {
  "tiene-inscripciones":
    "No se puede eliminar: este evento ya tiene inscripciones registradas.",
  "categoria-tiene-inscripciones":
    "No se puede eliminar: esta categoría ya tiene inscripciones registradas.",
  "imagen-formato": "Formato de imagen no permitido (solo JPEG, PNG o WEBP).",
  "imagen-tamano": "La imagen supera el tamaño máximo de 5 MB.",
  "json-vacio": "Selecciona un archivo JSON para crear el evento.",
  "json-tamano": "El archivo JSON supera el tamaño máximo de 200 KB.",
  "json-invalido":
    "El archivo no es un JSON válido o no tiene los campos esperados — revisa la plantilla de ejemplo.",
  "no-autorizado": "Solo un administrador puede enviar difusiones.",
};

const MENSAJES_GUARDADO: Record<string, string> = {
  evento: "Cambios del evento guardados",
  "evento-creado": "Evento creado",
  "evento-creado-json":
    "Evento creado desde JSON — completa las demás pestañas",
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

export default async function EventosPage({
  searchParams,
}: PageProps<"/admin/eventos">) {
  const session = await verifySession();
  const esAdmin = session.user.rol === "ADMIN";

  const params = await searchParams;
  // Igual que en inscripciones/page.tsx: no dependen entre sí, se piden en
  // paralelo en vez de sumar round-trips secuenciales a Neon. `atletas`
  // solo se necesita para los botones de difusión (ADMIN, ver más abajo,
  // junto al evento seleccionado); una sesión EDITOR no los ve, así que no
  // vale la pena traerla.
  const [eventos, pruebasCatalogo, atletas] = await Promise.all([
    getEventosParaAdmin(),
    getPruebasCatalogo(),
    esAdmin ? getAtletasUnicos() : Promise.resolve([]),
  ]);

  const eventoId = primerValor(params.eventoId) ?? eventos[0]?.id;
  const error = primerValor(params.error);
  const guardado = primerValor(params.guardado);
  const guardadoTs = primerValor(params.t);
  const evento = eventoId ? await getEventoCompleto(eventoId) : null;

  const difusionCanal = primerValor(params.difusionCanal);
  const difusionExitosos = primerValor(params.difusionExitosos);
  const difusionFallidos = primerValor(params.difusionFallidos);
  const difusionTotal = primerValor(params.difusionTotal);
  const canalEtiqueta = difusionCanal === "WHATSAPP" ? "WhatsApp" : "correo";
  const mensajeDifusionExito =
    difusionCanal && difusionFallidos === "0"
      ? `Enviado por ${canalEtiqueta} a los ${difusionTotal} atletas`
      : null;
  const mensajeDifusionParcial =
    difusionCanal && difusionFallidos && difusionFallidos !== "0"
      ? `Enviado por ${canalEtiqueta} a ${difusionExitosos} de ${difusionTotal} (${difusionFallidos} fallaron)`
      : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Toast
        key={guardadoTs}
        mensaje={
          mensajeDifusionExito ??
          (guardado ? (MENSAJES_GUARDADO[guardado] ?? null) : null)
        }
        paramsALimpiar={
          mensajeDifusionExito
            ? [
                "difusionCanal",
                "difusionExitosos",
                "difusionFallidos",
                "difusionTotal",
                "t",
              ]
            : ["guardado", "t"]
        }
      />

      <h1 className="font-display text-4xl font-extrabold uppercase text-white">
        Eventos
      </h1>

      {error && MENSAJES_ERROR[error] && (
        <p className="rounded-lg bg-rojo/10 px-4 py-2 font-bold text-rojo">
          {MENSAJES_ERROR[error]}
        </p>
      )}

      {mensajeDifusionParcial && (
        <p className="rounded-lg bg-naranja/10 px-4 py-2 font-bold text-naranja">
          {mensajeDifusionParcial}
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[320px_minmax(0,1fr)]">
        <EventosLista
          eventos={eventos}
          eventoIdActivo={eventoId}
          esAdmin={esAdmin}
          totalAtletas={atletas.length}
          crearEventoAction={crearEvento}
          crearEventoDesdeJsonAction={crearEventoDesdeJson}
          eliminarEventoAction={eliminarEvento}
          enviarResumenAction={enviarResumenEvento}
        />

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
