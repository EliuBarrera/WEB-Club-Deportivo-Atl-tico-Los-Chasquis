import "server-only";
import crypto from "node:crypto";

// Sesión "casera" para /atletas (Fase 10): no usa NextAuth a propósito,
// para no mezclar el modelo de identidad del panel admin (Usuario/
// RolUsuario, con contraseña) con esto, que es solo una verificación
// temporal de numeroDocumento+email — mismo criterio de "firmar con
// node:crypto en vez de sumar una librería nueva" que ya usa
// lib/wompi.ts (generarFirmaIntegridad/verificarFirmaEvento). Se firma
// con AUTH_SECRET (ya existe en el entorno para NextAuth) para no sumar
// una variable de entorno nueva.

const DURACION_MS = 30 * 60 * 1000; // 30 minutos

export type SesionAtleta = {
  numeroDocumento: string;
  email: string;
  exp: number;
};

function obtenerSecreto(): string {
  const secreto = process.env.AUTH_SECRET;
  if (!secreto) {
    throw new Error("AUTH_SECRET no está configurada");
  }
  return secreto;
}

function firmar(payload: string): string {
  return crypto
    .createHmac("sha256", obtenerSecreto())
    .update(payload)
    .digest("base64url");
}

// La cookie solo guarda esta identidad + expiración, nunca el listado de
// inscripciones — cada carga de página vuelve a consultar la base de
// datos en vivo (lib/atletas/dal.ts), así que un pago que cambia de
// estado se refleja de inmediato sin depender del contenido de la cookie.
export function firmarSesion(datos: {
  numeroDocumento: string;
  email: string;
}): string {
  const payload: SesionAtleta = {
    numeroDocumento: datos.numeroDocumento,
    email: datos.email,
    exp: Date.now() + DURACION_MS,
  };
  const payloadCodificado = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );
  const firma = firmar(payloadCodificado);
  return `${payloadCodificado}.${firma}`;
}

export function verificarSesion(token: string | undefined): {
  numeroDocumento: string;
  email: string;
} | null {
  if (!token) return null;

  const [payloadCodificado, firma] = token.split(".");
  if (!payloadCodificado || !firma) return null;

  const firmaEsperada = firmar(payloadCodificado);
  const firmaValida =
    firma.length === firmaEsperada.length &&
    crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(firmaEsperada));
  if (!firmaValida) return null;

  let payload: SesionAtleta;
  try {
    payload = JSON.parse(
      Buffer.from(payloadCodificado, "base64url").toString("utf-8")
    );
  } catch {
    return null;
  }

  if (typeof payload.exp !== "number" || Date.now() > payload.exp) {
    return null;
  }

  return { numeroDocumento: payload.numeroDocumento, email: payload.email };
}
