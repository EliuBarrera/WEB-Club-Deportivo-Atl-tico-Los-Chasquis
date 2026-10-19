// Regla de camiseta (Fase 13.1). Función pura, sin acceso a base de datos,
// para que la usen tanto el route handler (validación) como el formulario
// (mostrar el selector de talla). `derechos` es texto libre del club
// (GrupoTarifa.derechos), así que se compara sin importar mayúsculas ni
// tildes: "Camiseta", "camiseta técnica", etc. cuentan como camiseta.
export function esDerechoCamiseta(derecho: string): boolean {
  return derecho
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .includes("camiseta");
}
