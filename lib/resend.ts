import "server-only";

// Envío de correo vía Resend (Fase 11). Mismo patrón defensivo que
// lib/turnstile.ts/lib/wompi.ts: fetch plano (sin SDK), nunca lanza. A
// diferencia de WhatsApp, Resend no exige plantillas pre-aprobadas — cada
// caso de uso arma su propio HTML/texto y llama a esta misma función
// genérica (la usan lib/admin/difusion.ts y lib/notificacionPago.ts).

export type EnvioCorreoResultado = { ok: true } | { ok: false; error: string };

export async function enviarCorreo(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EnvioCorreoResultado> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("RESEND_API_KEY o RESEND_FROM_EMAIL no están configuradas");
    return { ok: false, error: "no-configurado" };
  }

  try {
    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!respuesta.ok) {
      console.error(`Resend respondió ${respuesta.status}`);
      return { ok: false, error: "error-api" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Error llamando a la API de Resend:", error);
    return { ok: false, error: "error-red" };
  }
}
