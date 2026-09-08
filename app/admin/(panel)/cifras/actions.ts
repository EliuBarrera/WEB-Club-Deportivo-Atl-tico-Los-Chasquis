"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/admin/dal";
import { cifraConfianzaSchema } from "@/lib/validation/cifraConfianza";

function datosCifra(formData: FormData) {
  return cifraConfianzaSchema.parse({
    etiqueta: String(formData.get("etiqueta") ?? "").trim(),
    valor: String(formData.get("valor") ?? "").trim(),
    orden: String(formData.get("orden") ?? "0"),
  });
}

export async function crearCifra(formData: FormData) {
  await verifySession();

  const datos = datosCifra(formData);

  await prisma.cifraConfianza.create({ data: datos });

  revalidatePath("/admin/cifras");
  revalidatePath("/");
  redirect(`/admin/cifras?guardado=creada&t=${Date.now()}`);
}

export async function actualizarCifra(cifraId: string, formData: FormData) {
  await verifySession();

  const datos = datosCifra(formData);

  await prisma.cifraConfianza.update({
    where: { id: cifraId },
    data: datos,
  });

  revalidatePath("/admin/cifras");
  revalidatePath("/");
  redirect(`/admin/cifras?guardado=actualizada&t=${Date.now()}`);
}

// Sin FK que lo referencie, el borrado no necesita ninguna guardia previa.
export async function eliminarCifra(cifraId: string) {
  await verifySession();

  await prisma.cifraConfianza.delete({ where: { id: cifraId } });

  revalidatePath("/admin/cifras");
  revalidatePath("/");
  redirect("/admin/cifras");
}
