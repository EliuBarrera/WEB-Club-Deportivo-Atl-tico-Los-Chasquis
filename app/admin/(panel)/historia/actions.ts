"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/admin/dal";
import { hitoHistoricoSchema } from "@/lib/validation/historia";

function campoOpcional(formData: FormData, campo: string): string | null {
  const valor = String(formData.get(campo) ?? "").trim();
  return valor || null;
}

function datosHito(formData: FormData) {
  return hitoHistoricoSchema.parse({
    anio: campoOpcional(formData, "anio"),
    titulo: String(formData.get("titulo") ?? "").trim(),
    descripcion: String(formData.get("descripcion") ?? "").trim(),
    imagenUrl: campoOpcional(formData, "imagenUrl"),
    orden: String(formData.get("orden") ?? "0"),
  });
}

export async function crearHito(formData: FormData) {
  await verifySession();

  const datos = datosHito(formData);

  await prisma.hitoHistorico.create({ data: datos });

  revalidatePath("/admin/historia");
  revalidatePath("/");
  redirect(`/admin/historia?guardado=creado&t=${Date.now()}`);
}

export async function actualizarHito(hitoId: string, formData: FormData) {
  await verifySession();

  const datos = datosHito(formData);

  await prisma.hitoHistorico.update({
    where: { id: hitoId },
    data: datos,
  });

  revalidatePath("/admin/historia");
  revalidatePath("/");
  redirect(`/admin/historia?guardado=actualizado&t=${Date.now()}`);
}

// Sin FK que lo referencie, el borrado no necesita ninguna guardia previa.
export async function eliminarHito(hitoId: string) {
  await verifySession();

  await prisma.hitoHistorico.delete({ where: { id: hitoId } });

  revalidatePath("/admin/historia");
  revalidatePath("/");
  redirect("/admin/historia");
}
