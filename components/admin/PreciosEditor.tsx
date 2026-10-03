"use client";

import { useRef, useState } from "react";
import type { EventoCompleto } from "@/lib/admin/dal";
import { fechaCierreAInput, rondaVigente } from "@/lib/precios";
import { formatPrecio } from "@/lib/format";

const campoClase = "w-full min-w-0 rounded-lg bg-white px-3 py-2 text-base outline-none";
const labelClase = "text-xs font-bold uppercase tracking-wide text-gris-oscuro";

type RondaEdit = {
  id?: string;
  clave: string;
  nombre: string;
  fechaCierre: string;
  inscripciones: number;
};
type GrupoEdit = {
  id?: string;
  clave: string;
  nombre: string;
  derechos: string;
  inscripciones: number;
};

const celda = (ronda: string, grupo: string) => `${ronda}|${grupo}`;

// Pestaña Precios del editor de eventos (Fase 12.1): tabla grupos × rondas.
// Se guarda todo de una vez; el servidor revalida (lib/validation/precios.ts).
export function PreciosEditor({
  evento,
  guardarAction,
}: {
  evento: EventoCompleto;
  guardarAction: (formData: FormData) => Promise<void>;
}) {
  const contador = useRef(0);
  const claveNueva = (prefijo: string) => `${prefijo}-nueva-${++contador.current}`;

  const [rondas, setRondas] = useState<RondaEdit[]>(() =>
    evento.rondas.map((r) => ({
      id: r.id,
      clave: r.id,
      nombre: r.nombre,
      fechaCierre: fechaCierreAInput(r.fechaCierre),
      inscripciones: r._count.inscripciones,
    }))
  );
  const [grupos, setGrupos] = useState<GrupoEdit[]>(() =>
    evento.gruposTarifa.map((g) => ({
      id: g.id,
      clave: g.id,
      nombre: g.nombre,
      derechos: g.derechos.join(", "),
      inscripciones: g._count.inscripciones,
    }))
  );
  const [tarifas, setTarifas] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      evento.rondas.flatMap((r) =>
        r.tarifas.map((t) => [celda(r.id, t.grupoTarifaId), String(t.valor)])
      )
    )
  );

  function agregarRonda() {
    const anterior = rondas.at(-1)?.fechaCierre;
    // Por defecto, el día antes del evento a las 23:59 (hora de Colombia).
    const vispera = new Date(evento.fecha.getTime() - 86_400_000)
      .toISOString()
      .slice(0, 10);
    setRondas([
      ...rondas,
      {
        clave: claveNueva("r"),
        nombre: `Ronda ${rondas.length + 1}`,
        fechaCierre: anterior && anterior >= `${vispera}T23:59` ? "" : `${vispera}T23:59`,
        inscripciones: 0,
      },
    ]);
  }

  function agregarGrupo() {
    setGrupos([
      ...grupos,
      { clave: claveNueva("g"), nombre: "", derechos: "", inscripciones: 0 },
    ]);
  }

  const errores: string[] = [];
  if (rondas.some((r) => !r.nombre.trim())) errores.push("Toda ronda necesita nombre.");
  if (grupos.some((g) => !g.nombre.trim())) errores.push("Todo grupo necesita nombre.");
  if (rondas.some((r) => !r.fechaCierre)) errores.push("Toda ronda necesita fecha de cierre.");
  const repetido = (lista: string[]) =>
    new Set(lista.map((n) => n.trim().toLowerCase())).size !== lista.length;
  if (repetido(rondas.map((r) => r.nombre))) errores.push("Hay rondas con el mismo nombre.");
  if (repetido(grupos.map((g) => g.nombre))) errores.push("Hay grupos con el mismo nombre.");
  rondas.forEach((r, i) => {
    if (i > 0 && r.fechaCierre && r.fechaCierre <= rondas[i - 1].fechaCierre) {
      errores.push(`"${r.nombre}" debe cerrar después de "${rondas[i - 1].nombre}".`);
    }
  });
  const faltanTarifas = rondas.some((r) =>
    grupos.some((g) => !/^\d+$/.test(tarifas[celda(r.clave, g.clave)] ?? ""))
  );
  if (faltanTarifas) errores.push("Completa todas las tarifas (usa 0 para gratis).");

  const payload = JSON.stringify({
    rondas: rondas.map(({ id, clave, nombre, fechaCierre }) => ({
      id,
      clave,
      nombre: nombre.trim(),
      fechaCierre,
    })),
    grupos: grupos.map(({ id, clave, nombre, derechos }) => ({
      id,
      clave,
      nombre: nombre.trim(),
      derechos: derechos
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
    })),
    tarifas: rondas.flatMap((r) =>
      grupos.map((g) => ({
        ronda: r.clave,
        grupo: g.clave,
        valor: Number(tarifas[celda(r.clave, g.clave)] ?? ""),
      }))
    ),
  });

  // Avisos sobre lo YA GUARDADO (lo que hoy ve el público), no sobre el
  // borrador de la tabla.
  const avisos: string[] = [];
  const vigente = rondaVigente(evento.rondas);
  if (evento.rondas.length === 0) {
    avisos.push("El evento no tiene rondas: nadie puede inscribirse.");
  } else if (!vigente) {
    avisos.push("Ninguna ronda está vigente hoy: las inscripciones están cerradas aunque el evento esté ABIERTO.");
  }
  if (evento.gruposTarifa.length === 0) {
    avisos.push("El evento no tiene grupos de tarifa.");
  }
  const sinGrupo = evento.categorias.filter((c) => !c.grupoTarifaId);
  if (evento.categorias.length > 0 && sinGrupo.length > 0) {
    avisos.push(
      `Categorías sin grupo de tarifa (no admiten inscripciones): ${sinGrupo
        .map((c) => c.nombre)
        .join(", ")}. Asígnalo en la pestaña Categorías.`
    );
  }

  return (
    <form action={guardarAction} className="flex flex-col gap-5">
      <input type="hidden" name="precios" value={payload} />

      <p className="text-base text-gris-oscuro">
        El precio que se cobra es el de la primera ronda cuyo cierre no ha
        pasado, para el grupo de la categoría elegida. Los grupos agrupan
        categorías que pagan lo mismo (ej. &quot;adultos&quot;,
        &quot;menores&quot;); en eventos sin categorías, el atleta elige el
        grupo directamente. Una tarifa en <strong>0</strong> es inscripción
        gratuita (no pasa por Wompi).
      </p>

      {avisos.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-xl bg-amarillo/15 p-4 text-base font-semibold text-casi-negro">
          {avisos.map((a) => (
            <li key={a}>⚠ {a}</li>
          ))}
        </ul>
      )}
      {vigente && (
        <p className="text-base font-semibold text-verde">
          Vigente hoy: {vigente.nombre}
          {evento.gruposTarifa.length > 0 &&
            ` — ${evento.gruposTarifa
              .map((g) => {
                const v = vigente.tarifas.find((t) => t.grupoTarifaId === g.id)?.valor;
                return `${g.nombre}: ${v === undefined ? "—" : v === 0 ? "Gratis" : formatPrecio(v)}`;
              })
              .join(", ")}`}
        </p>
      )}

      <div className="overflow-x-auto rounded-[20px] bg-white shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
        <table className="w-full min-w-[640px] table-auto text-left">
          <thead>
            <tr className="border-b border-casi-negro/10 align-top">
              <th className="w-64 px-3 py-3">
                <span className={labelClase}>Grupo / lo que incluye</span>
              </th>
              {rondas.map((r, i) => (
                <th key={r.clave} className="min-w-44 px-3 py-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        aria-label="Nombre de la ronda"
                        value={r.nombre}
                        onChange={(e) =>
                          setRondas(rondas.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))
                        }
                        className={`${campoClase} font-bold`}
                      />
                      <button
                        type="button"
                        aria-label={`Quitar ${r.nombre}`}
                        disabled={r.inscripciones > 0}
                        title={r.inscripciones > 0 ? "Tiene inscripciones: no se puede quitar" : undefined}
                        onClick={() => setRondas(rondas.filter((_, j) => j !== i))}
                        className="h-8 w-8 shrink-0 rounded-full bg-rojo/10 font-bold text-rojo disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        ×
                      </button>
                    </div>
                    <label className="flex flex-col gap-0.5">
                      <span className={labelClase}>Cierra (hora Colombia)</span>
                      <input
                        type="datetime-local"
                        value={r.fechaCierre}
                        onChange={(e) =>
                          setRondas(rondas.map((x, j) => (j === i ? { ...x, fechaCierre: e.target.value } : x)))
                        }
                        className={campoClase}
                      />
                    </label>
                  </div>
                </th>
              ))}
              <th className="px-3 py-3">
                <button
                  type="button"
                  onClick={agregarRonda}
                  className="whitespace-nowrap rounded-full bg-casi-negro/[0.06] px-4 py-2 font-display text-sm font-bold uppercase"
                >
                  + Ronda
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((g, i) => (
              <tr key={g.clave} className="border-b border-casi-negro/[0.06] align-top last:border-none">
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        aria-label="Nombre del grupo"
                        placeholder="ej. adultos"
                        value={g.nombre}
                        onChange={(e) =>
                          setGrupos(grupos.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))
                        }
                        className={`${campoClase} font-bold`}
                      />
                      <button
                        type="button"
                        aria-label={`Quitar grupo ${g.nombre}`}
                        disabled={g.inscripciones > 0}
                        title={g.inscripciones > 0 ? "Tiene inscripciones: no se puede quitar" : undefined}
                        onClick={() => setGrupos(grupos.filter((_, j) => j !== i))}
                        className="h-8 w-8 shrink-0 rounded-full bg-rojo/10 font-bold text-rojo disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        ×
                      </button>
                    </div>
                    <input
                      aria-label="Lo que incluye"
                      placeholder="camiseta, chip, medalla"
                      value={g.derechos}
                      onChange={(e) =>
                        setGrupos(grupos.map((x, j) => (j === i ? { ...x, derechos: e.target.value } : x)))
                      }
                      className={campoClase}
                    />
                  </div>
                </td>
                {rondas.map((r) => {
                  const k = celda(r.clave, g.clave);
                  return (
                    <td key={k} className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-gris-oscuro">$</span>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          inputMode="numeric"
                          aria-label={`Tarifa ${g.nombre} en ${r.nombre}`}
                          value={tarifas[k] ?? ""}
                          onChange={(e) => setTarifas({ ...tarifas, [k]: e.target.value })}
                          className={campoClase}
                        />
                      </div>
                    </td>
                  );
                })}
                <td />
              </tr>
            ))}
            <tr>
              <td className="px-3 py-3" colSpan={rondas.length + 2}>
                <button
                  type="button"
                  onClick={agregarGrupo}
                  className="rounded-full bg-casi-negro/[0.06] px-4 py-2 font-display text-sm font-bold uppercase"
                >
                  + Grupo
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {errores.length > 0 && (
        <ul className="flex flex-col gap-1 text-base font-semibold text-rojo">
          {errores.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={errores.length > 0}
          className="rounded-full bg-naranja px-6 py-2.5 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Guardar precios
        </button>
      </div>
    </form>
  );
}
