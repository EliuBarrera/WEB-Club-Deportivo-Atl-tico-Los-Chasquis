"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function cerrarSesionAtletaAction() {
  const jar = await cookies();
  jar.delete("atleta_sesion");
  redirect("/atletas");
}
