"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/admin/dal";
import { terminosSchema } from "@/lib/validation/terminos";

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

  revalidatePath("/admin/terminos");
  revalidatePath("/eventos");
  redirect(`/admin/terminos?guardado=terminos&t=${Date.now()}`);
}
