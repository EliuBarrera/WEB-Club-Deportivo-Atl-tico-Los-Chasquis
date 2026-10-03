// Regla única de precio (Fase 12.1). Funciones puras, sin acceso a base de
// datos: el route handler de inscripción las usa para cobrar (con datos
// recién leídos de la base) y la UI pública para mostrar el precio. El
// monto nunca se acepta del cliente.

type Ronda = {
  id: string;
  orden: number;
  nombre: string;
  fechaCierre: Date;
  tarifas: { grupoTarifaId: string; valor: number }[];
};

type Grupo = {
  id: string;
  nombre: string;
  derechos: string[];
  orden: number;
};

// Primera ronda (por `orden`) cuya fecha de cierre no ha pasado. `null` =
// inscripciones cerradas por fecha.
export function rondaVigente<R extends Ronda>(
  rondas: R[],
  ahora: Date = new Date()
): R | null {
  return (
    [...rondas]
      .sort((a, b) => a.orden - b.orden)
      .find((r) => ahora <= r.fechaCierre) ?? null
  );
}

// `null` si no hay ronda vigente o el grupo no tiene tarifa en ella.
export function resolverTarifa(
  rondas: Ronda[],
  grupoTarifaId: string,
  ahora: Date = new Date()
): { rondaId: string; valor: number } | null {
  const ronda = rondaVigente(rondas, ahora);
  const tarifa = ronda?.tarifas.find((t) => t.grupoTarifaId === grupoTarifaId);
  if (!ronda || !tarifa) return null;
  return { rondaId: ronda.id, valor: tarifa.valor };
}

export type PreciosEvento = {
  // Ronda cuyo precio se muestra; `vigente: false` = ya cerraron todas y se
  // muestra la última solo como referencia.
  ronda: { nombre: string; fechaCierre: Date; vigente: boolean } | null;
  totalRondas: number;
  grupos: { id: string; nombre: string; derechos: string[]; valor: number | null }[];
};

export function preciosDelEvento(
  evento: { rondas: Ronda[]; gruposTarifa: Grupo[] },
  ahora: Date = new Date()
): PreciosEvento {
  const ordenadas = [...evento.rondas].sort((a, b) => a.orden - b.orden);
  const vigente = rondaVigente(ordenadas, ahora);
  const mostrada = vigente ?? ordenadas.at(-1) ?? null;

  return {
    ronda: mostrada
      ? {
          nombre: mostrada.nombre,
          fechaCierre: mostrada.fechaCierre,
          vigente: mostrada === vigente,
        }
      : null,
    totalRondas: ordenadas.length,
    grupos: [...evento.gruposTarifa]
      .sort((a, b) => a.orden - b.orden)
      .map((g) => ({
        id: g.id,
        nombre: g.nombre,
        derechos: g.derechos,
        valor:
          mostrada?.tarifas.find((t) => t.grupoTarifaId === g.id)?.valor ??
          null,
      })),
  };
}

// Colombia no tiene horario de verano: siempre UTC-5. El admin escribe el
// cierre de ronda en hora local (`<input type="datetime-local">`, sin zona).
const OFFSET_BOGOTA_MS = 5 * 60 * 60 * 1000;

// Incluye el minuto completo: "23:59" cierra a las 23:59:59.999.
export function fechaCierreDesdeInput(valor: string): Date {
  return new Date(`${valor}:59.999-05:00`);
}

export function fechaCierreAInput(fecha: Date): string {
  return new Date(fecha.getTime() - OFFSET_BOGOTA_MS).toISOString().slice(0, 16);
}
