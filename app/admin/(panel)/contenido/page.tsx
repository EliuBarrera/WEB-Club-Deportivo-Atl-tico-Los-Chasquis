import {
  getCifrasConfianzaAdmin,
  getHitosHistoricosAdmin,
  getTestimoniosAdmin,
  verifySession,
} from "@/lib/admin/dal";
import { Toast } from "@/components/admin/Toast";
import { ContenidoHomeAdmin } from "@/components/admin/ContenidoHomeAdmin";
import {
  crearCifra,
  actualizarCifra,
  eliminarCifra,
  crearHito,
  actualizarHito,
  eliminarHito,
  crearTestimonio,
  actualizarTestimonio,
  eliminarTestimonio,
} from "./actions";

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

const MENSAJES: Record<string, string> = {
  "cifra-creada": "Cifra agregada",
  "cifra-actualizada": "Cifra actualizada",
  "hito-creado": "Hito agregado",
  "hito-actualizado": "Hito actualizado",
  "testimonio-creado": "Testimonio agregado",
  "testimonio-actualizado": "Testimonio actualizado",
};

// Une /admin/cifras, /admin/historia y /admin/testimonios en una sola
// pantalla con pestañas: las tres son CRUDs simples que alimentan bloques
// de la home y compartían el mismo patrón de página, sin justificar 3
// items separados en el Dock.
export default async function ContenidoPage({
  searchParams,
}: PageProps<"/admin/contenido">) {
  await verifySession();

  const params = await searchParams;
  const guardado = primerValor(params.guardado);
  const guardadoTs = primerValor(params.t);
  const tabParam = primerValor(params.tab);
  const tabInicial =
    tabParam === "historia" || tabParam === "testimonios"
      ? tabParam
      : "cifras";

  const [cifras, hitos, testimonios] = await Promise.all([
    getCifrasConfianzaAdmin(),
    getHitosHistoricosAdmin(),
    getTestimoniosAdmin(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Toast
        key={guardadoTs}
        mensaje={guardado ? (MENSAJES[guardado] ?? null) : null}
      />

      <h1 className="font-display text-4xl font-extrabold uppercase text-white">
        Contenido de la home
      </h1>

      <p className="text-white/70">
        Cifras de confianza, línea de tiempo de la historia y testimonios:
        los tres bloques de la home que se editan como listas simples,
        agrupados acá.
      </p>

      <ContenidoHomeAdmin
        tabInicial={tabInicial}
        cifras={cifras}
        crearCifraAction={crearCifra}
        actualizarCifraAction={actualizarCifra}
        eliminarCifraAction={eliminarCifra}
        hitos={hitos}
        crearHitoAction={crearHito}
        actualizarHitoAction={actualizarHito}
        eliminarHitoAction={eliminarHito}
        testimonios={testimonios}
        crearTestimonioAction={crearTestimonio}
        actualizarTestimonioAction={actualizarTestimonio}
        eliminarTestimonioAction={eliminarTestimonio}
      />
    </div>
  );
}
