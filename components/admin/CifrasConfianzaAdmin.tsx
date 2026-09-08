"use client";

import { useState } from "react";
import type { CifraConfianzaAdmin } from "@/lib/admin/dal";
import { CifraConfianzaModal } from "@/components/admin/CifraConfianzaModal";

// Único componente cliente de /admin/cifras — mismo patrón que
// DocumentosLegalesAdmin.tsx.
export function CifrasConfianzaAdmin({
  cifras,
  crearAction,
  actualizarAction,
  eliminarAction,
}: {
  cifras: CifraConfianzaAdmin[];
  crearAction: (formData: FormData) => Promise<void>;
  actualizarAction: (cifraId: string, formData: FormData) => Promise<void>;
  eliminarAction: (cifraId: string) => Promise<void>;
}) {
  const [modal, setModal] = useState<"nueva" | string | null>(null);

  const cifraEnEdicion =
    modal && modal !== "nueva"
      ? cifras.find((c) => c.id === modal)
      : undefined;

  return (
    <div className="flex flex-col gap-4">
      {cifras.length === 0 ? (
        <p className="italic text-white/70">Todavía no hay cifras cargadas.</p>
      ) : (
        <div className="overflow-x-auto rounded-[20px] bg-white shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="border-b border-casi-negro/10 text-sm uppercase tracking-wide text-gris-oscuro">
                <th className="px-4 py-3">Etiqueta</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {cifras.map((cifra) => (
                <tr
                  key={cifra.id}
                  className="border-b border-casi-negro/[0.06] last:border-none"
                >
                  <td className="px-4 py-3 font-bold">{cifra.etiqueta}</td>
                  <td className="px-4 py-3 font-mono">{cifra.valor}</td>
                  <td className="px-4 py-3">{cifra.orden}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        aria-label="Editar cifra"
                        onClick={() => setModal(cifra.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-casi-negro/[0.06] text-casi-negro"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={() => setModal("nueva")}
        className="flex w-fit items-center gap-2 rounded-full bg-naranja px-5 py-2.5 font-display text-sm font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Agregar cifra
      </button>

      <CifraConfianzaModal
        abierto={modal !== null}
        cifra={cifraEnEdicion}
        guardarAction={
          cifraEnEdicion
            ? actualizarAction.bind(null, cifraEnEdicion.id)
            : crearAction
        }
        eliminarAction={
          cifraEnEdicion
            ? eliminarAction.bind(null, cifraEnEdicion.id)
            : undefined
        }
        onCerrar={() => setModal(null)}
      />
    </div>
  );
}
