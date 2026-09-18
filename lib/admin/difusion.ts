import "server-only";
import type { AtletaUnico } from "@/lib/admin/atletas";
import { enviarWhatsappTemplate } from "@/lib/brevoWhatsapp";
import { enviarCorreo } from "@/lib/resend";
import { formatFechaBadge, formatPrecio } from "@/lib/format";

export type EventoParaDifusion = {
  id: string;
  titulo: string;
  fecha: Date;
  ubicacion: string;
  horario: string | null;
  precio: number;
  cierreInscripciones: string | null;
};

export type ResultadoEnvioDifusion = {
  numeroDocumento: string;
  ok: boolean;
  error?: string;
};

function urlEvento(eventoId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return `${base}/eventos?evento=${eventoId}`;
}

function correoResumenHtml(
  atleta: AtletaUnico,
  evento: EventoParaDifusion,
): string {
  const link = urlEvento(evento.id);
  return `
    <div style="font-family: sans-serif; color: #1c0d0a; max-width: 480px; margin: 0 auto;">
      <p>Hola ${atleta.nombres},</p>
      <p>Te contamos los detalles de nuestro próximo evento:</p>
      <h2 style="color: #f15808; text-transform: uppercase;">${evento.titulo}</h2>
      <p><strong>Fecha:</strong> ${formatFechaBadge(evento.fecha)}</p>
      ${evento.horario ? `<p><strong>Horario:</strong> ${evento.horario}</p>` : ""}
      <p><strong>Ubicación:</strong> ${evento.ubicacion}</p>
      <p><strong>Precio:</strong> ${formatPrecio(evento.precio)}</p>
      ${
        evento.cierreInscripciones
          ? `<p><strong>Cierre de inscripciones:</strong> ${evento.cierreInscripciones}</p>`
          : ""
      }
      <p>
        <a href="${link}" style="display: inline-block; background: #f15808; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold;">
          Ver evento
        </a>
      </p>
      <p>Club Atlético Los Chasquis</p>
    </div>
  `;
}

function correoResumenTexto(
  atleta: AtletaUnico,
  evento: EventoParaDifusion,
): string {
  return [
    `Hola ${atleta.nombres},`,
    "",
    `${evento.titulo}`,
    `Fecha: ${formatFechaBadge(evento.fecha)}`,
    evento.horario ? `Horario: ${evento.horario}` : null,
    `Ubicación: ${evento.ubicacion}`,
    `Precio: ${formatPrecio(evento.precio)}`,
    evento.cierreInscripciones
      ? `Cierre de inscripciones: ${evento.cierreInscripciones}`
      : null,
    "",
    `Más info: ${urlEvento(evento.id)}`,
    "",
    "Club Atlético Los Chasquis",
  ]
    .filter((linea): linea is string => linea !== null)
    .join("\n");
}

async function enviarUno(
  atleta: AtletaUnico,
  canal: "WHATSAPP" | "EMAIL",
  evento: EventoParaDifusion,
): Promise<ResultadoEnvioDifusion> {
  if (canal === "WHATSAPP") {
    const templateId = process.env.BREVO_WHATSAPP_TEMPLATE_ID_RESUMEN;
    if (!templateId) {
      return {
        numeroDocumento: atleta.numeroDocumento,
        ok: false,
        error: "no-configurado",
      };
    }
    const resultado = await enviarWhatsappTemplate({
      celular: atleta.celular,
      templateId,
      variables: [
        atleta.nombres,
        evento.titulo,
        formatFechaBadge(evento.fecha),
        evento.ubicacion,
        urlEvento(evento.id),
      ],
    });
    return {
      numeroDocumento: atleta.numeroDocumento,
      ok: resultado.ok,
      error: resultado.ok ? undefined : resultado.error,
    };
  }

  const resultado = await enviarCorreo({
    to: atleta.email,
    subject: `Resumen: ${evento.titulo}`,
    html: correoResumenHtml(atleta, evento),
    text: correoResumenTexto(atleta, evento),
  });
  return {
    numeroDocumento: atleta.numeroDocumento,
    ok: resultado.ok,
    error: resultado.ok ? undefined : resultado.error,
  };
}

const TAMANO_LOTE = 10;

// Procesa en lotes con concurrencia acotada — los lib/*.ts de envío ya
// nunca lanzan; Promise.allSettled acá es un segundo cinturón de
// seguridad, no la única defensa.
export async function enviarResumenALista(
  atletas: AtletaUnico[],
  canal: "WHATSAPP" | "EMAIL",
  evento: EventoParaDifusion,
): Promise<ResultadoEnvioDifusion[]> {
  const resultados: ResultadoEnvioDifusion[] = [];

  for (let i = 0; i < atletas.length; i += TAMANO_LOTE) {
    const lote = atletas.slice(i, i + TAMANO_LOTE);
    const liquidados = await Promise.allSettled(
      lote.map((atleta) => enviarUno(atleta, canal, evento)),
    );

    for (let j = 0; j < liquidados.length; j++) {
      const resultado = liquidados[j];
      if (resultado.status === "fulfilled") {
        resultados.push(resultado.value);
      } else {
        resultados.push({
          numeroDocumento: lote[j].numeroDocumento,
          ok: false,
          error: "excepcion-inesperada",
        });
      }
    }
  }

  return resultados;
}
