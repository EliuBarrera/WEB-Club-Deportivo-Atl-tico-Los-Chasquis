"use client";

import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { TestimonioAdmin } from "@/lib/admin/dal";

const campoClase = "rounded-lg bg-white px-3 py-2 text-lg outline-none";
const labelClase =
  "text-sm font-bold uppercase tracking-wide text-gris-oscuro";

// Modal de creación/edición de un testimonio (Fase 9) — mismo patrón que
// DocumentoLegalModal.tsx / CifraConfianzaModal.tsx. `nombre` y `rol`
// quedan vacíos para testimonios anónimos (el campo es opcional a
// propósito, no hay que inventar un nombre).
export function TestimonioModal({
  abierto,
  testimonio,
  guardarAction,
  eliminarAction,
  onCerrar,
}: {
  abierto: boolean;
  testimonio?: TestimonioAdmin;
  guardarAction: (formData: FormData) => Promise<void>;
  eliminarAction?: (formData: FormData) => Promise<void>;
  onCerrar: () => void;
}) {
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const formEliminarRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape" && !confirmandoEliminar) onCerrar();
    };
    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [abierto, confirmandoEliminar, onCerrar]);

  if (!abierto) return null;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[60] flex items-center justify-center bg-casi-negro/50 p-6"
        onClick={onCerrar}
      >
        <div
          className="flex max-h-[85vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-[24px] bg-white p-6 shadow-[0_20px_50px_rgba(28,13,10,0.35)]"
          onClick={(evento) => evento.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold uppercase">
              {testimonio ? "Editar testimonio" : "Nuevo testimonio"}
            </h2>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onCerrar}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-casi-negro/5 text-casi-negro"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form action={guardarAction} className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className={labelClase}>Cita</span>
              <textarea
                name="cita"
                required
                rows={3}
                defaultValue={testimonio?.cita ?? ""}
                className={campoClase}
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Nombre (opcional)</span>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Dejar vacío si es anónimo"
                  defaultValue={testimonio?.nombre ?? ""}
                  className={campoClase}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Rol (opcional)</span>
                <input
                  type="text"
                  name="rol"
                  placeholder="Ej: Atleta participante"
                  defaultValue={testimonio?.rol ?? ""}
                  className={campoClase}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className={labelClase}>URL de la foto (opcional)</span>
              <input
                type="text"
                name="fotoUrl"
                placeholder="/Testimonio1.jpg o https://..."
                defaultValue={testimonio?.fotoUrl ?? ""}
                className={campoClase}
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Orden</span>
                <input
                  type="number"
                  name="orden"
                  min={0}
                  defaultValue={testimonio?.orden ?? 0}
                  className={`${campoClase} max-w-[120px]`}
                />
              </label>
              <label className="flex items-center gap-2 pb-2 sm:self-end">
                <input
                  type="checkbox"
                  name="destacado"
                  defaultChecked={testimonio?.destacado ?? false}
                  className="h-5 w-5"
                />
                <span className={labelClase}>Destacado</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              {eliminarAction ? (
                <button
                  type="button"
                  onClick={() => setConfirmandoEliminar(true)}
                  className="rounded-full bg-rojo/10 px-4 py-2 font-display text-sm font-bold uppercase text-rojo"
                >
                  Eliminar testimonio
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCerrar}
                  className="rounded-full bg-casi-negro/5 px-5 py-2 font-display text-sm font-bold uppercase text-casi-negro"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-naranja px-5 py-2 font-display text-sm font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
                >
                  Guardar testimonio
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {eliminarAction && (
        <>
          <form ref={formEliminarRef} action={eliminarAction} />
          <ConfirmDialog
            abierto={confirmandoEliminar}
            titulo="Eliminar testimonio"
            descripcion="¿Eliminar este testimonio? Esta acción no se puede deshacer."
            onCancelar={() => setConfirmandoEliminar(false)}
            onConfirmar={() => {
              setConfirmandoEliminar(false);
              formEliminarRef.current?.requestSubmit();
            }}
          />
        </>
      )}
    </>
  );
}
