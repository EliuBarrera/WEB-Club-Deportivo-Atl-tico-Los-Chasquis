"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/admin/dal";
import { documentoLegalSchema } from "@/lib/validation/documentoLegal";

function datosDocumento(formData: FormData) {
  return documentoLegalSchema.parse({
    nombre: String(formData.get("nombre") ?? "").trim(),
    url: String(formData.get("url") ?? "").trim(),
    orden: String(formData.get("orden") ?? "0"),
  });
}

export async function crearDocumento(formData: FormData) {
  await verifySession();

  const datos = datosDocumento(formData);

  await prisma.documentoLegal.create({ data: datos });

  revalidatePath("/admin/documentos");
  revalidatePath("/transparencia");
  redirect(`/admin/documentos?guardado=creado&t=${Date.now()}`);
}

export async function actualizarDocumento(
  documentoId: string,
  formData: FormData
) {
  await verifySession();

  const datos = datosDocumento(formData);

  await prisma.documentoLegal.update({
    where: { id: documentoId },
    data: datos,
  });

  revalidatePath("/admin/documentos");
  revalidatePath("/transparencia");
  redirect(`/admin/documentos?guardado=actualizado&t=${Date.now()}`);
}

// Sin FK que lo referencie (nada apunta a DocumentoLegal), el borrado no
// necesita ninguna guardia previa — mismo caso que eliminarNoticia.
export async function eliminarDocumento(documentoId: string) {
  await verifySession();

  await prisma.documentoLegal.delete({ where: { id: documentoId } });

  revalidatePath("/admin/documentos");
  revalidatePath("/transparencia");
  redirect("/admin/documentos");
}
