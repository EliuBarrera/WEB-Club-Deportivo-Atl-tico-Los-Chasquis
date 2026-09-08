"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/admin/dal";
import { testimonioSchema } from "@/lib/validation/testimonio";

function campoOpcional(formData: FormData, campo: string): string | null {
  const valor = String(formData.get(campo) ?? "").trim();
  return valor || null;
}

function datosTestimonio(formData: FormData) {
  return testimonioSchema.parse({
    nombre: campoOpcional(formData, "nombre"),
    rol: campoOpcional(formData, "rol"),
    cita: String(formData.get("cita") ?? "").trim(),
    fotoUrl: campoOpcional(formData, "fotoUrl"),
    destacado: formData.get("destacado") === "on",
    orden: String(formData.get("orden") ?? "0"),
  });
}

export async function crearTestimonio(formData: FormData) {
  await verifySession();

  const datos = datosTestimonio(formData);

  await prisma.testimonio.create({ data: datos });

  revalidatePath("/admin/testimonios");
  revalidatePath("/");
  redirect(`/admin/testimonios?guardado=creado&t=${Date.now()}`);
}

export async function actualizarTestimonio(
  testimonioId: string,
  formData: FormData
) {
  await verifySession();

  const datos = datosTestimonio(formData);

  await prisma.testimonio.update({
    where: { id: testimonioId },
    data: datos,
  });

  revalidatePath("/admin/testimonios");
  revalidatePath("/");
  redirect(`/admin/testimonios?guardado=actualizado&t=${Date.now()}`);
}

// Sin FK que lo referencie, el borrado no necesita ninguna guardia previa.
export async function eliminarTestimonio(testimonioId: string) {
  await verifySession();

  await prisma.testimonio.delete({ where: { id: testimonioId } });

  revalidatePath("/admin/testimonios");
  revalidatePath("/");
  redirect("/admin/testimonios");
}
