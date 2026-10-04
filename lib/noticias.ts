// Utilidades compartidas sobre `Noticia.fecha`, que es texto libre
// (ej. "15 de enero, 2026"). Las noticias se ordenan por esa fecha, de la
// más reciente a la más antigua — ya no hay un campo de orden manual.

const MESES: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

// "15 de enero, 2026" / "15 de enero de 2026" / "15 enero 2026" -> ms UTC,
// o null si el texto no tiene un formato reconocible.
export function fechaNoticiaAMs(texto: string): number | null {
  const match = texto
    .toLowerCase()
    .match(/(\d{1,2})\s*(?:de\s+)?([a-záéíóúñ]+)\s*,?\s*(?:de(?:l)?\s+)?(\d{4})/);
  if (!match) return null;
  const [, dia, mesTexto, anio] = match;
  const mes = MESES[mesTexto];
  if (mes === undefined) return null;
  return Date.UTC(Number(anio), mes, Number(dia));
}

// Más reciente primero. Las de fecha ilegible van al final; los empates
// (misma fecha o ambas ilegibles) se resuelven por la más recién creada.
export function ordenarNoticias<T extends { fecha: string; createdAt: Date }>(
  noticias: T[],
): T[] {
  return noticias
    .map((noticia) => ({ noticia, ms: fechaNoticiaAMs(noticia.fecha) }))
    .sort((a, b) => {
      if (a.ms !== b.ms) {
        if (a.ms === null) return 1;
        if (b.ms === null) return -1;
        return b.ms - a.ms;
      }
      return b.noticia.createdAt.getTime() - a.noticia.createdAt.getTime();
    })
    .map(({ noticia }) => noticia);
}
