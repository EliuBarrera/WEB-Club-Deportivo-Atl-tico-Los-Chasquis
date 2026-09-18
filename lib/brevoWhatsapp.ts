import "server-only";

// Envío de WhatsApp vía Brevo (Fase 11), Business Solution Provider oficial
// de Meta. Mismo patrón defensivo que lib/turnstile.ts/lib/wompi.ts: fetch
// plano (sin SDK), nunca lanza — quien llama siempre recibe un resultado
// tipado — y los logs de error nunca incluyen el teléfono/nombre del
// destinatario, solo códigos/motivos genéricos.

export type EnvioWhatsappResultado =
  { ok: true } | { ok: false; error: string };

// `celular` en Inscripcion es texto libre (7-20 caracteres, ver
// lib/validation/inscripcion.ts), sin formato garantizado. Se limpia todo
// lo que no sea dígito; si quedan 10 dígitos que empiezan en "3" (celular
// colombiano típico) se antepone el indicativo "57"; si ya viene con "57" +
// 10 dígitos se deja igual. Cualquier otro caso no se puede normalizar con
// certeza, así que se devuelve null y no se intenta el envío.
export function normalizarTelefonoColombia(celular: string): string | null {
  const digitos = celular.replace(/\D/g, "");

  if (digitos.length === 10 && digitos.startsWith("3")) {
    return `57${digitos}`;
  }
  if (digitos.length === 12 && digitos.startsWith("573")) {
    return digitos;
  }
  return null;
}

// Función genérica: la usan tanto la difusión masiva (lib/admin/difusion.ts,
// plantilla "Resumen de evento") como la notificación automática de pago
// aprobado (lib/notificacionPago.ts, plantilla "Pago aprobado") — cada
// caso de uso pasa su propio templateId.
//
// Restricción dura de Meta (no es un detalle de esta implementación):
// cualquier mensaje fuera de una conversación activa de 24h debe usar una
// plantilla ya aprobada por Meta — no se puede mandar texto libre. Las
// plantillas se crean y aprueban en el panel de Brevo (Campaigns >
// WhatsApp) antes de que este código pueda enviar nada de verdad.
export async function enviarWhatsappTemplate(params: {
  celular: string;
  templateId: string;
  variables: string[];
}): Promise<EnvioWhatsappResultado> {
  const telefono = normalizarTelefonoColombia(params.celular);
  if (!telefono) {
    return { ok: false, error: "telefono-invalido" };
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("BREVO_API_KEY no está configurada");
    return { ok: false, error: "no-configurado" };
  }

  try {
    const respuesta = await fetch(
      "https://api.brevo.com/v3/whatsapp/sendMessage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          templateId: Number(params.templateId),
          to: telefono,
          params: params.variables,
        }),
      },
    );

    if (!respuesta.ok) {
      console.error(`Brevo WhatsApp respondió ${respuesta.status}`);
      return { ok: false, error: "error-api" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error llamando a la API de WhatsApp de Brevo:", error);
    return { ok: false, error: "error-red" };
  }
}
