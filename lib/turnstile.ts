// Verificación server-side de Cloudflare Turnstile (Fase 4). Nunca se
// confía en que el widget del cliente haya pasado el reto: el token se
// vuelve a validar contra la API de Cloudflare con el secret, que solo
// vive en el servidor.
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type RespuestaTurnstile = {
  success: boolean;
  [key: string]: unknown;
};

export async function verifyTurnstileToken(
  token: string,
  ip: string | null
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY no está configurada");
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const respuesta = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const datos = (await respuesta.json()) as RespuestaTurnstile;
    return datos.success === true;
  } catch (error) {
    console.error("Error verificando Turnstile:", error);
    return false;
  }
}
