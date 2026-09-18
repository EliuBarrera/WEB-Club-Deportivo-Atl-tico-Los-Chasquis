import { getDocumentosLegalesAdmin, verifySession } from "@/lib/admin/dal";
import { getTerminosVigente } from "@/lib/eventos";
import { Toast } from "@/components/admin/Toast";
import { LegalAdmin } from "@/components/admin/LegalAdmin";
import {
  actualizarTerminos,
  crearDocumento,
  actualizarDocumento,
  eliminarDocumento,
} from "./actions";

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

const MENSAJES: Record<string, string> = {
  terminos: "Términos y condiciones actualizados",
  "documento-creado": "Documento agregado",
  "documento-actualizado": "Documento actualizado",
};

// Une /admin/terminos y /admin/documentos en una sola pantalla con
// pestañas: ambos son el contenido institucional/legal del club y no
// ameritaban 2 items separados en el Dock.
export default async function LegalPage({
  searchParams,
}: PageProps<"/admin/legal">) {
  await verifySession();

  const params = await searchParams;
  const guardado = primerValor(params.guardado);
  const guardadoTs = primerValor(params.t);
  const tabParam = primerValor(params.tab);
  const tabInicial = tabParam === "documentos" ? "documentos" : "terminos";

  const [terminos, documentos] = await Promise.all([
    getTerminosVigente(),
    getDocumentosLegalesAdmin(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Toast
        key={guardadoTs}
        mensaje={guardado ? (MENSAJES[guardado] ?? null) : null}
      />

      <h1 className="font-display text-4xl font-extrabold uppercase text-white">
        Legal y transparencia
      </h1>

      <p className="text-white/70">
        Términos y condiciones y documentos legales: el contenido
        institucional del club, agrupado acá.
      </p>

      <LegalAdmin
        tabInicial={tabInicial}
        terminos={terminos}
        actualizarTerminosAction={actualizarTerminos}
        documentos={documentos}
        crearDocumentoAction={crearDocumento}
        actualizarDocumentoAction={actualizarDocumento}
        eliminarDocumentoAction={eliminarDocumento}
      />
    </div>
  );
}
