"use client";

import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { agruparPruebas } from "@/lib/admin/pruebas";
import type { EventoCompleto, PruebaCatalogoAdmin } from "@/lib/admin/dal";

const campoClase =
  "w-full min-w-0 rounded-lg bg-white px-3 py-2 text-lg outline-none";
const labelClase =
  "text-sm font-bold uppercase tracking-wide text-gris-oscuro";

type CategoriaExistente = EventoCompleto["categorias"][number];

// Modal de creación/edición de una categoría del evento (Fase 6): el
// listado en EventoEditor solo muestra una tabla compacta, todo el
// formulario (datos + pruebas del catálogo agrupadas por tipo) vive acá
// para no saturar la pestaña con una tarjeta grande por categoría.
export function CategoriaModal({
  abierto,
  categoria,
  pruebasCatalogo,
  guardarAction,
  eliminarAction,
  onCerrar,
}: {
  abierto: boolean;
  categoria?: CategoriaExistente;
  pruebasCatalogo: PruebaCatalogoAdmin[];
  guardarAction: (formData: FormData) => Promise<void>;
  eliminarAction?: (formData: FormData) => Promise<void>;
  onCerrar: () => void;
}) {
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const formEliminarRef = useRef<HTMLFormElement>(null);

  const pruebasSeleccionadas = new Set(
    categoria?.pruebas.map((p) => p.pruebaId) ?? []
  );
  const grupos = agruparPruebas(pruebasCatalogo);

  useEffect(() => {
    if (!abierto) return;
    const alPresionarTecla = (evento: KeyboardEvent) => {
      // Si el popup de "eliminar" está abierto, el Escape lo cierra a él
      // primero (ver ConfirmDialog) — este listener no debe cerrar también
      // el modal completo en el mismo golpe de tecla.
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
        className="flex max-h-[85vh] w-full max-w-5xl flex-col gap-5 overflow-y-auto rounded-[24px] bg-white p-6 shadow-[0_20px_50px_rgba(28,13,10,0.35)]"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold uppercase">
            {categoria ? "Editar categoría" : "Nueva categoría"}
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)_80px]">
            <label className="flex min-w-0 flex-col gap-1">
              <span className={labelClase}>Nombre</span>
              <input
                type="text"
                name="nombre"
                required
                defaultValue={categoria?.nombre ?? ""}
                className={campoClase}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className={labelClase}>Edad</span>
              <input
                type="text"
                name="edad"
                required
                defaultValue={categoria?.edad ?? ""}
                className={campoClase}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className={labelClase}>Nacimiento</span>
              <input
                type="text"
                name="nacimiento"
                required
                defaultValue={categoria?.nacimiento ?? ""}
                className={campoClase}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className={labelClase}>Rama</span>
              <input
                type="text"
                name="rama"
                required
                defaultValue={categoria?.rama ?? "MASCULINA Y FEMENINA"}
                className={campoClase}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className={labelClase}>Orden</span>
              <input
                type="number"
                name="orden"
                min={0}
                defaultValue={categoria?.orden ?? 0}
                className={campoClase}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <span className={labelClase}>Pruebas habilitadas</span>
            {grupos.map(({ grupo, pruebas }) => (
              <div key={grupo} className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-casi-negro/50">
                  {grupo}
                </span>
                <div className="flex flex-wrap gap-2">
                  {pruebas.map((prueba) => (
                    <label key={prueba.id} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="pruebasIds"
                        value={prueba.id}
                        defaultChecked={pruebasSeleccionadas.has(prueba.id)}
                        className="peer sr-only"
                      />
                      <span className="flex items-center gap-1.5 rounded-full bg-casi-negro/5 px-3 py-1.5 text-sm font-semibold text-casi-negro peer-checked:bg-naranja peer-checked:text-white peer-checked:shadow-[0_4px_10px_rgba(241,88,8,0.4)]">
                        {prueba.icon} {prueba.nombre}
                        {prueba.genero && (
                          <span className="opacity-70">
                            ({prueba.genero === "MASCULINO" ? "M" : "F"})
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            {eliminarAction ? (
              <button
                type="button"
                onClick={() => setConfirmandoEliminar(true)}
                className="rounded-full bg-rojo/10 px-4 py-2 font-display text-sm font-bold uppercase text-rojo"
              >
                Eliminar categoría
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
                Guardar categoría
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    {/* Fuera del backdrop de arriba a propósito: su overlay no hace
        stopPropagation en el fondo, así que si quedara anidado, un clic en
        el fondo de este ConfirmDialog también cerraría el modal completo. */}
    {eliminarAction && (
      <>
        <form ref={formEliminarRef} action={eliminarAction} />
        <ConfirmDialog
          abierto={confirmandoEliminar}
          titulo="Eliminar categoría"
          descripcion={`¿Eliminar "${categoria?.nombre}"? Esta acción no se puede deshacer.`}
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
