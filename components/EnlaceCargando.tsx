"use client";

import { createPortal } from "react-dom";
import { useLinkStatus } from "next/link";
import { LoaderTransicion } from "./LoaderTransicion";

// Overlay de carga mientras navega un <Link>: equivalente a
// FormularioCargando pero para enlaces. `useLinkStatus` solo funciona en
// un descendiente del <Link>, así que se monta dentro de él (sirve
// también dentro de componentes de servidor como Hero o CtaFinal). Si la
// ruta ya estaba precargada, la navegación es instantánea y el hook nunca
// queda "pending", así que el overlay no llega a aparecer.
// Se porta a `document.body` por la misma razón que FormularioCargando.
export function EnlaceCargando({ mensaje }: { mensaje: string }) {
  const { pending } = useLinkStatus();

  if (!pending || typeof document === "undefined") return null;

  return createPortal(
    <LoaderTransicion activo={pending} mensaje={mensaje} />,
    document.body,
  );
}
