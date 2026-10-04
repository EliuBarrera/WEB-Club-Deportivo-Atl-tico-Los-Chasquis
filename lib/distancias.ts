// Utilidades compartidas (servidor y cliente) sobre el nombre de una
// distancia del evento (ej. "10 km", "10K", "1.5 km", "800 m").

// Metros que representa el nombre, o null si no tiene un formato
// reconocible. Acepta coma o punto decimal.
export function metrosDistancia(nombre: string): number | null {
  const partes = nombre
    .trim()
    .toLowerCase()
    .match(/^(\d+(?:[.,]\d+)?)\s*(km|k|kil[oó]metros?|m|mts?|metros?)?$/);
  if (!partes) return null;
  const valor = Number(partes[1].replace(",", "."));
  const unidad = partes[2] ?? "m";
  return unidad.startsWith("k") ? valor * 1000 : valor;
}

// Ordena de la más corta a la más larga; las que no se reconocen van al
// final, por nombre.
export function ordenarDistancias<T extends { nombre: string }>(distancias: T[]): T[] {
  const metros = (d: T) => metrosDistancia(d.nombre) ?? Infinity;
  return [...distancias].sort(
    (a, b) =>
      metros(a) - metros(b) ||
      a.nombre.localeCompare(b.nombre, "es", { numeric: true })
  );
}
