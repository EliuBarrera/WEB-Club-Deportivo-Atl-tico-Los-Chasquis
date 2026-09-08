"use client";

import { useRef, useState } from "react";

const campoClase = "flex-1 rounded-lg bg-white px-3 py-2 text-lg outline-none";
const labelClase =
  "text-sm font-bold uppercase tracking-wide text-gris-oscuro";

const botonIconoClase =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-casi-negro/5 text-casi-negro disabled:opacity-30";

// Lista editable de texto plano para Premios/Reglamento/Logística (Fase 6):
// condiciones, reglas, servicios, etc. son todas `{ id, texto, orden }` en
// el schema. En vez de un campo numérico "orden" por fila, todas comparten
// el mismo `name` — el orden en que llegan al hacer
// `formData.getAll(nombreCampo)` en el servidor ES el orden a guardar, así
// que reordenar acá es mover filas con los botones ↑/↓, no editar números.
export function ListaTextoEditable({
  nombreCampo,
  etiqueta,
  valoresIniciales,
  placeholder,
}: {
  nombreCampo: string;
  etiqueta: string;
  valoresIniciales: string[];
  placeholder?: string;
}) {
  const [items, setItems] = useState(() =>
    valoresIniciales.map((texto, key) => ({ key, texto }))
  );
  // Contador para las `key` de filas nuevas — vive en un ref y solo se
  // incrementa dentro de manejadores de eventos, nunca durante el render,
  // para no depender de una función impura (crypto.randomUUID(), Date.now())
  // en el cuerpo del componente.
  const siguienteKey = useRef(valoresIniciales.length);

  function agregar() {
    setItems((prev) => [...prev, { key: siguienteKey.current++, texto: "" }]);
  }

  function eliminar(key: number) {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  function mover(key: number, direccion: -1 | 1) {
    setItems((prev) => {
      const indice = prev.findIndex((item) => item.key === key);
      const destino = indice + direccion;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  }

  function actualizarTexto(key: number, texto: string) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, texto } : item))
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={labelClase}>{etiqueta}</span>
      {items.map((item, indice) => (
        <div key={item.key} className="flex items-center gap-2">
          <input
            type="text"
            name={nombreCampo}
            value={item.texto}
            placeholder={placeholder}
            onChange={(evento) => actualizarTexto(item.key, evento.target.value)}
            className={campoClase}
          />
          <button
            type="button"
            aria-label="Mover arriba"
            disabled={indice === 0}
            onClick={() => mover(item.key, -1)}
            className={botonIconoClase}
          >
            ↑
          </button>
          <button
            type="button"
            aria-label="Mover abajo"
            disabled={indice === items.length - 1}
            onClick={() => mover(item.key, 1)}
            className={botonIconoClase}
          >
            ↓
          </button>
          <button
            type="button"
            aria-label="Eliminar fila"
            onClick={() => eliminar(item.key)}
            className={botonIconoClase + " bg-rojo/10 text-rojo"}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={agregar}
        className="w-fit rounded-full bg-casi-negro/5 px-4 py-1.5 font-display text-xs font-bold uppercase text-casi-negro"
      >
        + Agregar
      </button>
    </div>
  );
}
