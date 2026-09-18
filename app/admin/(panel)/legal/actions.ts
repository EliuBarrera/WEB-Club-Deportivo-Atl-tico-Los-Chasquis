"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/admin/dal";
import { terminosSchema } from "@/lib/validation/terminos";
import { documentoLegalSchema } from "@/lib/validation/documentoLegal";

// Acciones de /admin/legal: términos y condiciones + documentos legales.
// Vivían en /admin/terminos y /admin/documentos por separado; se unieron
// en una sola pantalla con pestañas porque ambos son el contenido
// institucional/legal del club y no ameritaban 2 items de nav.

// Actualizar el bloque institucional de Términos y Condiciones (Fase 4)
// nunca modifica la fila vigente: crea una versión nueva con
// `vigenteDesde = ahora`, para que las inscripciones ya guardadas sigan
// apuntando (vía Inscripcion.terminosVersion) a un texto inmutable aunque
// el club edite el contenido después.
export async function actualizarTerminos(formData: FormData) {
  await verifySession();

  const datos = terminosSchema.parse({
    contenido: String(formData.get("contenido") ?? "").trim(),
  });

  const ultima = await prisma.terminosBase.findFirst({
    orderBy: { version: "desc" },
    select: { version: true },
  });

  await prisma.terminosBase.create({
    data: {
      version: (ultima?.version ?? 0) + 1,
      contenido: datos.contenido,
    },
  });

  revalidatePath("/admin/legal");
  revalidatePath("/eventos");
  redirect(`/admin/legal?tab=terminos&guardado=terminos&t=${Date.now()}`);
}

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

  revalidatePath("/admin/legal");
  revalidatePath("/transparencia");
  redirect(
    `/admin/legal?tab=documentos&guardado=documento-creado&t=${Date.now()}`
  );
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

  revalidatePath("/admin/legal");
  revalidatePath("/transparencia");
  redirect(
    `/admin/legal?tab=documentos&guardado=documento-actualizado&t=${Date.now()}`
  );
}

// Sin FK que lo referencie (nada apunta a DocumentoLegal), el borrado no
// necesita ninguna guardia previa — mismo caso que eliminarNoticia.
export async function eliminarDocumento(documentoId: string) {
  await verifySession();

  await prisma.documentoLegal.delete({ where: { id: documentoId } });

  revalidatePath("/admin/legal");
  revalidatePath("/transparencia");
  redirect("/admin/legal?tab=documentos");
}
