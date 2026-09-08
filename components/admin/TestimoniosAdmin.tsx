"use client";

import { useState } from "react";
import type { TestimonioAdmin } from "@/lib/admin/dal";
import { TestimonioModal } from "@/components/admin/TestimonioModal";

// Único componente cliente de /admin/testimonios — mismo patrón que
// DocumentosLegalesAdmin.tsx / CifrasConfianzaAdmin.tsx.
export function TestimoniosAdmin({
  testimonios,
  crearAction,
  actualizarAction,
  eliminarAction,
}: {
  testimonios: TestimonioAdmin[];
  crearAction: (formData: FormData) => Promise<void>;
  actualizarAction: (
    testimonioId: string,
    formData: FormData
  ) => Promise<void>;
  eliminarAction: (testimonioId: string) => Promise<void>;
}) {
  const [modal, setModal] = useState<"nuevo" | string | null>(null);

  const testimonioEnEdicion =
    modal && modal !== "nuevo"
      ? testimonios.find((t) => t.id === modal)
      : undefined;

  return (
    <div className="flex flex-col gap-4">
      {testimonios.length === 0 ? (
        <p className="italic text-white/70">
          Todavía no hay testimonios cargados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[20px] bg-white shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-casi-negro/10 text-sm uppercase tracking-wide text-gris-oscuro">
                <th className="px-4 py-3">Cita</th>
                <th className="px-4 py-3">Nombre / rol</th>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {testimonios.map((testimonio) => (
                <tr
                  key={testimonio.id}
                  className="border-b border-casi-negro/[0.06] last:border-none"
                >
                  <td className="max-w-xs px-4 py-3 font-bold">
                    “{testimonio.cita}”
                  </td>
                  <td className="px-4 py-3 text-sm text-gris-oscuro">
                    {testimonio.nombre ?? "Anónimo"}
                    {testimonio.rol ? ` · ${testimonio.rol}` : ""}
                  </td>
                  <td className="px-4 py-3">{testimonio.orden}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        aria-label="Editar testimonio"
                        onClick={() => setModal(testimonio.id)}
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
        onClick={() => setModal("nuevo")}
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
        Agregar testimonio
      </button>

      <TestimonioModal
        abierto={modal !== null}
        testimonio={testimonioEnEdicion}
        guardarAction={
          testimonioEnEdicion
            ? actualizarAction.bind(null, testimonioEnEdicion.id)
            : crearAction
        }
        eliminarAction={
          testimonioEnEdicion
            ? eliminarAction.bind(null, testimonioEnEdicion.id)
            : undefined
        }
        onCerrar={() => setModal(null)}
      />
    </div>
  );
}
