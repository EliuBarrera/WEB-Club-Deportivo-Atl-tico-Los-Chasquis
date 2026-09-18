import "server-only";
import { enviarWhatsappTemplate } from "@/lib/brevoWhatsapp";
import { enviarCorreo } from "@/lib/resend";
import { formatPrecio } from "@/lib/format";

// Notificación automática al aprobarse un pago (Fase 11, backlog de la
// Fase 10). La dispara app/api/webhooks/wompi/route.ts en la transición
// hacia estadoPago === "APROBADO" — reutiliza las mismas funciones
// genéricas de envío que la difusión masiva del admin
// (lib/brevoWhatsapp.ts, lib/resend.ts), no es una integración nueva.
//
// No vive en lib/atletas/ (el portal de autoservicio público) porque
// corre en el contexto del webhook, sin ninguna sesión de atleta de por
// medio — mezclar los dos conceptos sería confuso.
//
// Best-effort a propósito: no se guarda ningún registro de auditoría (a
// diferencia de EnvioMasivo) ni se lanza si algo falla — el webhook de
// Wompi ya tiene su propio log de errores y debe responder rápido; si la
// notificación falla, el atleta igual puede ver su estado en /atletas en
// cualquier momento.
export async function enviarNotificacionPagoAprobado(inscripcion: {
  nombres: string;
  celular: string;
  email: string;
  totalPago: number;
  evento: { titulo: string; fecha: Date; ubicacion: string };
}): Promise<void> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const link = `${base}/atletas`;

  const templateId = process.env.BREVO_WHATSAPP_TEMPLATE_ID_PAGO;
  if (templateId) {
    try {
      await enviarWhatsappTemplate({
        celular: inscripcion.celular,
        templateId,
        variables: [
          inscripcion.nombres,
          inscripcion.evento.titulo,
          formatPrecio(inscripcion.totalPago),
          link,
        ],
      });
    } catch (error) {
      console.error("Error enviando WhatsApp de pago aprobado:", error);
    }
  } else {
    console.error("BREVO_WHATSAPP_TEMPLATE_ID_PAGO no está configurada");
  }

  try {
    await enviarCorreo({
      to: inscripcion.email,
      subject: `Pago aprobado: ${inscripcion.evento.titulo}`,
      html: `
        <div style="font-family: sans-serif; color: #1c0d0a; max-width: 480px; margin: 0 auto;">
          <p>Hola ${inscripcion.nombres},</p>
          <p>¡Tu pago fue aprobado! Ya estás inscrito/a en:</p>
          <h2 style="color: #f15808; text-transform: uppercase;">${inscripcion.evento.titulo}</h2>
          <p><strong>Monto pagado:</strong> ${formatPrecio(inscripcion.totalPago)}</p>
          <p>
            <a href="${link}" style="display: inline-block; background: #f15808; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold;">
              Ver mis inscripciones
            </a>
          </p>
          <p>Club Atlético Los Chasquis</p>
        </div>
      `,
      text: [
        `Hola ${inscripcion.nombres},`,
        "",
        `¡Tu pago fue aprobado! Ya estás inscrito/a en: ${inscripcion.evento.titulo}`,
        `Monto pagado: ${formatPrecio(inscripcion.totalPago)}`,
        "",
        `Ver mis inscripciones: ${link}`,
        "",
        "Club Atlético Los Chasquis",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Error enviando correo de pago aprobado:", error);
  }
}
