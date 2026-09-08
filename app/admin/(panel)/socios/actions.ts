"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/admin/dal";
import { socioSchema } from "@/lib/validation/socio";

function datosSocio(formData: FormData) {
  return socioSchema.parse({
    nombre: String(formData.get("nombre") ?? "").trim(),
    logoUrl: String(formData.get("logoUrl") ?? "").trim(),
    orden: String(formData.get("orden") ?? "0"),
  });
}

export async function crearSocio(formData: FormData) {
  await verifySession();

  const datos = datosSocio(formData);

  await prisma.socio.create({ data: datos });

  revalidatePath("/admin/socios");
  revalidatePath("/");
  redirect(`/admin/socios?guardado=creado&t=${Date.now()}`);
}

export async function actualizarSocio(socioId: string, formData: FormData) {
  await verifySession();

  const datos = datosSocio(formData);

  await prisma.socio.update({
    where: { id: socioId },
    data: datos,
  });

  revalidatePath("/admin/socios");
  revalidatePath("/");
  redirect(`/admin/socios?guardado=actualizado&t=${Date.now()}`);
}

// Sin FK que lo referencie, el borrado no necesita ninguna guardia previa.
export async function eliminarSocio(socioId: string) {
  await verifySession();

  await prisma.socio.delete({ where: { id: socioId } });

  revalidatePath("/admin/socios");
  revalidatePath("/");
  redirect("/admin/socios");
}
