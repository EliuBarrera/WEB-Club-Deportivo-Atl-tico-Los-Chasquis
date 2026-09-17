"use client";

import { useFormStatus } from "react-dom";
import { LoaderTransicion } from "../LoaderTransicion";

// Overlay de carga mientras se procesa el login (Fase 6): `useFormStatus`
// solo funciona en un componente hijo del <form>, por eso vive aparte de
// app/admin/login/page.tsx en vez de calcular el estado ahí mismo. Sigue
// "pending" durante todo el Server Action, incluida la redirección al
// panel si el login es correcto.
export function LoginCargando() {
  const { pending } = useFormStatus();

  return <LoaderTransicion activo={pending} mensaje="Iniciando sesión…" />;
}
