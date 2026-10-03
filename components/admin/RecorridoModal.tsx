"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FormularioCargando } from "@/components/FormularioCargando";
import type { EventoCompleto } from "@/lib/admin/dal";

const campoClase = "w-full min-w-0 rounded-lg bg-white px-3 py-2 text-lg outline-none";
const labelClase = "text-sm font-bold uppercase tracking-wide text-gris-oscuro";

type RecorridoExistente = EventoCompleto["recorridos"][number];

const CAMPOS = [
  { name: "distancia", label: "Distancia", placeholder: "ej. 10 km" },
  { name: "desnivel", label: "Desnivel", placeholder: "ej. +250 m" },
  { name: "salida", label: "Salida", placeholder: "ej. Plaza de Bolívar" },
  { name: "meta", label: "Meta", placeholder: "ej. Plaza de Bolívar" },
  { name: "modalidad", label: "Modalidad", placeholder: "ej. Carrera de calle" },
  { name: "terreno", label: "Terreno", placeholder: "ej. Pavimento" },
] as const;

// Modal de creación/edición de un recorrido del evento (Fase 12.3) — mismo
// patrón que NoticiaModal/CategoriaModal. El croquis se sube a Cloudinary;
// si no se elige archivo, se conserva el anterior.
export function RecorridoModal({
  abierto,
  recorrido,
  guardarAction,
  eliminarAction,
  onCerrar,
}: {
  abierto: boolean;
  recorrido?: RecorridoExistente;
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

  const categoriasAsignadas = recorrido?._count.categorias ?? 0;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[60] flex items-center justify-center bg-casi-negro/50 p-6"
        onClick={onCerrar}
      >
        <div
          className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-5 overflow-y-auto rounded-[24px] bg-white p-6 shadow-[0_20px_50px_rgba(28,13,10,0.35)]"
          onClick={(evento) => evento.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold uppercase">
              {recorrido ? "Editar recorrido" : "Nuevo recorrido"}
            </h2>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onCerrar}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-casi-negro/5 text-casi-negro"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form action={guardarAction} className="flex flex-col gap-5">
            <FormularioCargando mensaje="Guardando recorrido…" />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_80px]">
              <label className="flex min-w-0 flex-col gap-1">
                <span className={labelClase}>Nombre</span>
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="ej. Recorrido 10K"
                  defaultValue={recorrido?.nombre ?? ""}
                  className={campoClase}
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1">
                <span className={labelClase}>Orden</span>
                <input
                  type="number"
                  name="orden"
                  min={0}
                  defaultValue={recorrido?.orden ?? 0}
                  className={campoClase}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CAMPOS.map((campo) => (
                <label key={campo.name} className="flex min-w-0 flex-col gap-1">
                  <span className={labelClase}>{campo.label}</span>
                  <input
                    type="text"
                    name={campo.name}
                    placeholder={campo.placeholder}
                    defaultValue={recorrido?.[campo.name] ?? ""}
                    className={campoClase}
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-casi-negro/[0.06] text-xs text-gris-oscuro">
                {recorrido?.mapaUrl ? (
                  <Image
                    src={recorrido.mapaUrl}
                    alt=""
                    width={112}
                    height={80}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  "Sin croquis"
                )}
              </div>
              <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className={labelClase}>Croquis (JPEG, PNG o WEBP, máx. 5 MB)</span>
                <input
                  type="file"
                  name="mapa"
                  accept="image/jpeg,image/png,image/webp"
                  className="text-base"
                />
              </label>
            </div>

            <p className="text-sm text-gris-oscuro">
              Las categorías que corren este recorrido (con su distancia, hora y
              sitio de salida) se asignan en la pestaña Categorías.
            </p>

            <div className="flex items-center justify-between">
              {eliminarAction ? (
                <button
                  type="button"
                  onClick={() => setConfirmandoEliminar(true)}
                  className="rounded-full bg-rojo/10 px-4 py-2 font-display text-sm font-bold uppercase text-rojo"
                >
                  Eliminar recorrido
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
                  Guardar recorrido
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {eliminarAction && (
        <>
          <form ref={formEliminarRef} action={eliminarAction}>
            <FormularioCargando mensaje="Eliminando recorrido…" />
          </form>
          <ConfirmDialog
            abierto={confirmandoEliminar}
            titulo="Eliminar recorrido"
            descripcion={
              categoriasAsignadas > 0
                ? `¿Eliminar "${recorrido?.nombre ?? "este recorrido"}"? ${categoriasAsignadas} categoría(s) quedarán sin recorrido asignado.`
                : `¿Eliminar "${recorrido?.nombre ?? "este recorrido"}"? Esta acción no se puede deshacer.`
            }
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
