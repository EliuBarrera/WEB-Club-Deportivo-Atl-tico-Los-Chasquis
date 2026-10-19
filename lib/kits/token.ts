import "server-only";
import crypto from "node:crypto";
import QRCode from "qrcode";

// Token del QR de entrega de kit (Fase 13.2). Mismo mecanismo que la
// cookie de /atletas (lib/atletas/sesion.ts): HMAC-SHA256 con AUTH_SECRET.
// El QR solo lleva el id de la inscripción y su firma — ningún dato
// personal: el nombre, la talla, etc. se consultan en vivo al escanearlo.
//
// No expira: el kit se puede recoger cualquier día de la entrega, y lo que
// impide usarlo dos veces es Inscripcion.kitEntregadoEn, no el token.
//
// El prefijo "kit:" va dentro del HMAC (separación de dominio): así una
// firma de la cookie de sesión nunca vale como token de kit, ni al revés,
// aunque las dos usen el mismo secreto.

const PREFIJO = "kit:";

function obtenerSecreto(): string {
  const secreto = process.env.AUTH_SECRET;
  if (!secreto) {
    throw new Error("AUTH_SECRET no está configurada");
  }
  return secreto;
}

function firmar(inscripcionId: string): string {
  return crypto
    .createHmac("sha256", obtenerSecreto())
    .update(PREFIJO + inscripcionId)
    .digest("base64url");
}

export function firmarTokenKit(inscripcionId: string): string {
  return `${inscripcionId}.${firmar(inscripcionId)}`;
}

export function verificarTokenKit(token: string): string | null {
  const [inscripcionId, firma, sobrante] = token.trim().split(".");
  if (!inscripcionId || !firma || sobrante !== undefined) return null;

  const firmaEsperada = firmar(inscripcionId);
  const firmaValida =
    firma.length === firmaEsperada.length &&
    crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(firmaEsperada));
  return firmaValida ? inscripcionId : null;
}

// Corrección de errores "M" (15%): suficiente para un QR impreso o en
// pantalla con brillo bajo, sin volver el código demasiado denso.
export function qrKitDataUrl(inscripcionId: string): Promise<string> {
  return QRCode.toDataURL(firmarTokenKit(inscripcionId), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
}

export function qrKitPng(inscripcionId: string): Promise<Buffer> {
  return QRCode.toBuffer(firmarTokenKit(inscripcionId), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
}
