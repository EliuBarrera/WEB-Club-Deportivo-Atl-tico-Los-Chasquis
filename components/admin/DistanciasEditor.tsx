"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FormularioCargando } from "@/components/FormularioCargando";
import type { EventoCompleto } from "@/lib/admin/dal";

type DistanciaExistente = EventoCompleto["distancias"][number];

// Distancias del evento (ej. "10 km", "800 m"), arriba de la tabla de
// categorías: se crean aquí y luego cada categoría elige la suya en
// CategoriaModal. Se muestran ordenadas de la más corta a la más larga.
export function DistanciasEditor({
  distancias,
  crearAction,
  eliminarAction,
}: {
  distancias: DistanciaExistente[];
  crearAction: (formData: FormData) => Promise<void>;
  eliminarAction: (distanciaId: string) => Promise<void>;
}) {
  const [porEliminar, setPorEliminar] = useState<DistanciaExistente | null>(
    null,
  );
  const formEliminarRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-3 rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
      <div className="flex flex-col gap-0.5">
        <span className="font-display text-lg font-extrabold uppercase">
          Distancias
        </span>
        <span className="text-sm text-gris-oscuro">
          Crea las distancias del evento y asígnalas a cada categoría al
          editarla. Se muestran en &quot;Categorías y pruebas&quot; del sitio.
        </span>
      </div>

      {distancias.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {distancias.map((distancia) => (
            <span
              key={distancia.id}
              className="flex items-center gap-2 rounded-full bg-naranja/10 py-1 pl-3 pr-1 text-sm font-bold text-naranja"
            >
              {distancia.nombre}
              <span className="font-semibold text-casi-negro/50">
                {distancia._count.categorias === 1
                  ? "1 categoría"
                  : `${distancia._count.categorias} categorías`}
              </span>
              <button
                type="button"
                aria-label={`Eliminar distancia ${distancia.nombre}`}
                onClick={() => setPorEliminar(distancia)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-rojo"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm italic text-gris-oscuro">
          Este evento aún no tiene distancias.
        </p>
      )}

      <form action={crearAction} className="flex flex-wrap gap-2">
        <FormularioCargando mensaje="Guardando distancia…" />
        <input
          type="text"
          name="nombre"
          required
          maxLength={50}
          placeholder="ej. 10 km, 800 m"
          aria-label="Nueva distancia"
          className="w-48 rounded-lg bg-crema px-3 py-2 text-lg outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-naranja px-5 py-2 font-display text-sm font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
        >
          Agregar distancia
        </button>
      </form>

      <form
        ref={formEliminarRef}
        action={porEliminar ? eliminarAction.bind(null, porEliminar.id) : undefined}
      >
        <FormularioCargando mensaje="Eliminando distancia…" />
      </form>
      <ConfirmDialog
        abierto={porEliminar !== null}
        titulo="Eliminar distancia"
        descripcion={
          porEliminar && porEliminar._count.categorias > 0
            ? `¿Eliminar "${porEliminar.nombre}"? ${
                porEliminar._count.categorias === 1
                  ? "La categoría que la usa quedará"
                  : `Las ${porEliminar._count.categorias} categorías que la usan quedarán`
              } sin distancia.`
            : `¿Eliminar "${porEliminar?.nombre}"?`
        }
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          formEliminarRef.current?.requestSubmit();
          setPorEliminar(null);
        }}
      />
    </div>
  );
}
