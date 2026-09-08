import type { PruebaCatalogoAdmin } from "@/lib/admin/dal";

const ORDEN_GRUPOS = ["Pista", "Marcha", "Campo", "Obstáculos", "Otras"] as const;

// Agrupación por prefijo/sufijo del `key` sembrado en prisma/seed.ts — el
// catálogo no tiene un campo "tipo" en el schema, así que se deriva del
// key para no tener que migrar datos solo por presentación.
function grupoDePrueba(key: string): (typeof ORDEN_GRUPOS)[number] {
  if (key.startsWith("marcha_")) return "Marcha";
  if (key.startsWith("obs_")) return "Obstáculos";
  if (key === "salto_largo" || key === "bala" || key === "pelota") return "Campo";
  if (key.endsWith("_m")) return "Pista";
  return "Otras";
}

export function agruparPruebas(pruebas: PruebaCatalogoAdmin[]) {
  return ORDEN_GRUPOS.map((grupo) => ({
    grupo,
    pruebas: pruebas.filter((prueba) => grupoDePrueba(prueba.key) === grupo),
  })).filter((seccion) => seccion.pruebas.length > 0);
}
