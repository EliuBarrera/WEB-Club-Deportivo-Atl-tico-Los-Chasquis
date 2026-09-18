"use client";

import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";
import { LoaderTransicion } from "./LoaderTransicion";

// Overlay de carga mientras se procesa cualquier <form action={...}> con
// una Server Action (login, cerrar sesión, etc.): `useFormStatus` solo
// funciona en un componente hijo del <form>, por eso vive aparte del
// componente que renderiza el formulario y se monta dentro de él. Sigue
// "pending" durante todo el Server Action, incluida la redirección si la
// acción termina en una.
//
// Se porta a `document.body` en vez de dejarlo en su lugar en el árbol:
// el formulario de cerrar sesión vive dentro del <nav> del dock, que
// tiene `-translate-x-1/2` (ver la nota en LoaderTransicion.tsx sobre por
// qué un position:fixed dentro de un ancestro con transform no cubre el
// viewport completo). El portal solo mueve el DOM, no el árbol de React,
// así que useFormStatus sigue viendo el <form> correcto.
export function FormularioCargando({ mensaje }: { mensaje: string }) {
  const { pending } = useFormStatus();

  if (!pending || typeof document === "undefined") return null;

  return createPortal(
    <LoaderTransicion activo={pending} mensaje={mensaje} />,
    document.body,
  );
}
