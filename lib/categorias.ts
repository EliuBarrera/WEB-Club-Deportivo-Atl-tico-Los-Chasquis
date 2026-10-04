// Utilidades compartidas (servidor y cliente) sobre el campo de texto libre
// `Categoria.nacimiento` (ej. "2014-2013", "1976 o anterior").

// Rango de años de nacimiento que cubre una categoría, o null si el texto
// no tiene un formato reconocible.
export function rangoAnios(nacimiento: string): { min: number; max: number } | null {
  const rango = nacimiento.match(/^(\d{4})\s*-\s*(\d{4})$/);
  if (rango) {
    const a = Number(rango[1]);
    const b = Number(rango[2]);
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }
  const anterior = nacimiento.match(/^(\d{4})\s+o\s+anterior$/i);
  if (anterior) {
    return { min: -Infinity, max: Number(anterior[1]) };
  }
  const anio = nacimiento.match(/^(\d{4})$/);
  if (anio) {
    return { min: Number(anio[1]), max: Number(anio[1]) };
  }
  return null;
}

// Ordena las categorías de la más joven a la mayor (año de nacimiento más
// reciente primero), reemplazando el antiguo campo manual `orden`. Las que
// no tienen un año reconocible van al final, por nombre.
export function ordenarCategorias<T extends { nombre: string; nacimiento: string }>(
  categorias: T[]
): T[] {
  const anioMax = (c: T) => rangoAnios(c.nacimiento)?.max ?? -Infinity;
  return [...categorias].sort(
    (a, b) =>
      anioMax(b) - anioMax(a) ||
      a.nombre.localeCompare(b.nombre, "es", { numeric: true })
  );
}
