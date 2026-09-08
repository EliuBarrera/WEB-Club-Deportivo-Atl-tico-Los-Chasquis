// Helpers de formato para la vista pública de eventos (Fase 2).

const formateadorPesos = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
});

export function formatPrecio(valor: number): string {
  return `$${formateadorPesos.format(valor)}`;
}

const formateadorMes = new Intl.DateTimeFormat("es-CO", {
  month: "long",
  timeZone: "UTC",
});

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// "6 de Septiembre 2026" (badge de fecha en la tarjeta de evento)
export function formatFechaBadge(fecha: Date): string {
  const dia = fecha.getUTCDate();
  const mes = capitalizar(formateadorMes.format(fecha));
  const anio = fecha.getUTCFullYear();
  return `${dia} de ${mes} ${anio}`;
}

function capitalizarPalabras(texto: string): string {
  return texto
    .toLowerCase()
    .split(" ")
    .map((palabra) => capitalizar(palabra))
    .join(" ");
}

// Rango de categorías para el badge gris de la tarjeta, ej. "Sub 8 - Veteranos C".
// `categorias` debe venir ya ordenado por el campo `orden`.
export function rangoCategorias(
  categorias: { nombre: string }[]
): string | null {
  if (categorias.length === 0) return null;
  const primera = capitalizarPalabras(categorias[0].nombre);
  if (categorias.length === 1) return primera;
  const ultima = capitalizarPalabras(categorias[categorias.length - 1].nombre);
  return `${primera} - ${ultima}`;
}

// Intenta extraer una hora "H:MM AM/PM" de un texto libre como
// "7:00 AM - 5:00 PM" u "8:00 AM". Devuelve horas/minutos en 24h.
function parseHoraTexto(
  texto: string
): { horas: number; minutos: number } | null {
  const match = texto.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/);
  if (!match) return null;
  let horas = Number(match[1]) % 12;
  const minutos = Number(match[2]);
  if (match[3].toLowerCase() === "pm") horas += 12;
  return { horas, minutos };
}

function formatFechaHoraUTC(fecha: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${fecha.getUTCFullYear()}${pad(fecha.getUTCMonth() + 1)}${pad(fecha.getUTCDate())}` +
    `T${pad(fecha.getUTCHours())}${pad(fecha.getUTCMinutes())}00Z`
  );
}

function formatFechaSolo(fecha: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getUTCFullYear()}${pad(fecha.getUTCMonth() + 1)}${pad(fecha.getUTCDate())}`;
}

/**
 * Construye el enlace de "Agendar en Google Calendar" (solo un link,
 * sin login ni API de Google). Si `horario` trae una hora reconocible
 * se arma un evento con hora; si no, se arma un evento de todo el día
 * para no inventar una hora que no está en los datos.
 */
export function buildGoogleCalendarUrl(params: {
  titulo: string;
  fecha: Date;
  horario: string | null;
  ubicacion: string;
  descripcion: string | null;
}): string {
  const { titulo, fecha, horario, ubicacion, descripcion } = params;

  const horas = horario?.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)).*?(?:-|a)\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))?/
  );

  let dates: string;
  if (horas) {
    const inicio = parseHoraTexto(horas[1]);
    const finTexto = horas[2] ? parseHoraTexto(horas[2]) : null;
    if (inicio) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setUTCHours(inicio.horas, inicio.minutos, 0, 0);

      const fechaFin = new Date(fecha);
      if (finTexto) {
        fechaFin.setUTCHours(finTexto.horas, finTexto.minutos, 0, 0);
      } else {
        // No hay hora de cierre en el dato original: se usa una
        // duración por defecto de 1 hora solo para que el bloque del
        // calendario no quede vacío; el atleta puede ajustarla.
        fechaFin.setUTCHours(inicio.horas + 1, inicio.minutos, 0, 0);
      }

      dates = `${formatFechaHoraUTC(fechaInicio)}/${formatFechaHoraUTC(fechaFin)}`;
    } else {
      dates = `${formatFechaSolo(fecha)}/${formatFechaSolo(fecha)}`;
    }
  } else {
    const fechaSiguiente = new Date(fecha);
    fechaSiguiente.setUTCDate(fechaSiguiente.getUTCDate() + 1);
    dates = `${formatFechaSolo(fecha)}/${formatFechaSolo(fechaSiguiente)}`;
  }

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", titulo);
  url.searchParams.set("dates", dates);
  url.searchParams.set("location", ubicacion);
  if (descripcion) url.searchParams.set("details", descripcion);

  return url.toString();
}
