"use client";

import { useState } from "react";
import type { TerminosVigente } from "@/lib/eventos";
import type { DocumentoLegalAdmin } from "@/lib/admin/dal";
import { DocumentosLegalesAdmin } from "@/components/admin/DocumentosLegalesAdmin";

const TABS = [
  { id: "terminos", label: "Términos" },
  { id: "documentos", label: "Documentos" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Componente cliente de /admin/legal: arma las pestañas. La pestaña de
// documentos delega en DocumentosLegalesAdmin (sin cambios); la de
// términos es el mismo formulario simple que vivía en /admin/terminos,
// inline acá porque nunca tuvo estado propio de cliente.
export function LegalAdmin({
  tabInicial,
  terminos,
  actualizarTerminosAction,
  documentos,
  crearDocumentoAction,
  actualizarDocumentoAction,
  eliminarDocumentoAction,
}: {
  tabInicial: TabId;
  terminos: TerminosVigente;
  actualizarTerminosAction: (formData: FormData) => Promise<void>;
  documentos: DocumentoLegalAdmin[];
  crearDocumentoAction: (formData: FormData) => Promise<void>;
  actualizarDocumentoAction: (
    documentoId: string,
    formData: FormData
  ) => Promise<void>;
  eliminarDocumentoAction: (documentoId: string) => Promise<void>;
}) {
  const [tab, setTab] = useState<TabId>(tabInicial);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={
              tab === item.id
                ? "rounded-full bg-naranja px-5 py-2 font-display text-sm font-extrabold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
                : "rounded-full bg-white/10 px-5 py-2 font-display text-sm font-extrabold uppercase text-white/70"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={tab === "terminos" ? "flex flex-col gap-4" : "hidden"}>
        <p className="text-white/70">
          Este es el bloque institucional que ven todos los atletas al
          inscribirse a cualquier evento (reglamento general, seguridad,
          premiación, tratamiento de datos y exoneración de
          responsabilidad). Guardar un cambio crea una nueva versión — las
          inscripciones ya registradas conservan la versión que aceptaron
          en su momento.
        </p>

        {terminos ? (
          <p className="text-sm text-white/50">
            Versión vigente: {terminos.version} · desde{" "}
            {terminos.vigenteDesde.toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        ) : (
          <p className="text-sm text-white/50">
            Todavía no hay ninguna versión publicada.
          </p>
        )}

        <form
          action={actualizarTerminosAction}
          className="flex flex-col gap-4 rounded-[20px] bg-white p-6 shadow-[0_10px_30px_rgba(28,13,10,0.10)]"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
              Contenido
            </span>
            <textarea
              name="contenido"
              required
              rows={24}
              defaultValue={terminos?.contenido ?? ""}
              className="rounded-lg bg-casi-negro/[0.045] px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:bg-white focus:shadow-[0_0_0_2px_rgba(241,88,8,0.4)]"
            />
          </label>

          <button
            type="submit"
            className="w-fit rounded-full bg-naranja px-6 py-2.5 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
          >
            Guardar nueva versión
          </button>
        </form>
      </div>

      <div className={tab === "documentos" ? "flex flex-col gap-4" : "hidden"}>
        <p className="text-white/70">
          Esta lista alimenta la sección pública de Transparencia
          (/transparencia): estatutos, certificaciones, estados financieros
          y demás documentos institucionales, cada uno como un enlace a
          Google Drive. Se actualiza sin necesidad de un despliegue nuevo.
        </p>

        <DocumentosLegalesAdmin
          documentos={documentos}
          crearAction={crearDocumentoAction}
          actualizarAction={actualizarDocumentoAction}
          eliminarAction={eliminarDocumentoAction}
        />
      </div>
    </div>
  );
}
