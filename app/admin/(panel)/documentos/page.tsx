import { getDocumentosLegalesAdmin, verifySession } from "@/lib/admin/dal";
import { Toast } from "@/components/admin/Toast";
import { DocumentosLegalesAdmin } from "@/components/admin/DocumentosLegalesAdmin";
import { crearDocumento, actualizarDocumento, eliminarDocumento } from "./actions";

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

const MENSAJES: Record<string, string> = {
  creado: "Documento agregado",
  actualizado: "Documento actualizado",
};

export default async function DocumentosPage({
  searchParams,
}: PageProps<"/admin/documentos">) {
  await verifySession();

  const params = await searchParams;
  const guardado = primerValor(params.guardado);
  const guardadoTs = primerValor(params.t);

  const documentos = await getDocumentosLegalesAdmin();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Toast
        key={guardadoTs}
        mensaje={guardado ? (MENSAJES[guardado] ?? null) : null}
      />

      <h1 className="font-display text-4xl font-extrabold uppercase text-white">
        Documentos legales
      </h1>

      <p className="text-white/70">
        Esta lista alimenta la sección pública de Transparencia
        (/transparencia): estatutos, certificaciones, estados financieros y
        demás documentos institucionales, cada uno como un enlace a Google
        Drive. Se actualiza sin necesidad de un despliegue nuevo.
      </p>

      <DocumentosLegalesAdmin
        documentos={documentos}
        crearAction={crearDocumento}
        actualizarAction={actualizarDocumento}
        eliminarAction={eliminarDocumento}
      />
    </div>
  );
}
