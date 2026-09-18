"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/admin/dal";
import { cifraConfianzaSchema } from "@/lib/validation/cifraConfianza";
import { hitoHistoricoSchema } from "@/lib/validation/historia";
import { testimonioSchema } from "@/lib/validation/testimonio";

// Acciones de /admin/contenido: cifras de confianza, historia (hitos) y
// testimonios, las tres listas que alimentan bloques de la home. Vivían
// en /admin/cifras, /admin/historia y /admin/testimonios por separado;
// se unieron en una sola pantalla con pestañas porque las tres son CRUDs
// simples de "contenido de la home" y no ameritaban 3 items de nav.

function campoOpcional(formData: FormData, campo: string): string | null {
  const valor = String(formData.get(campo) ?? "").trim();
  return valor || null;
}

// ---- Cifras de confianza ----

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

  revalidatePath("/admin/contenido");
  revalidatePath("/");
  redirect(`/admin/contenido?tab=cifras&guardado=cifra-creada&t=${Date.now()}`);
}

export async function actualizarCifra(cifraId: string, formData: FormData) {
  await verifySession();

  const datos = datosCifra(formData);

  await prisma.cifraConfianza.update({
    where: { id: cifraId },
    data: datos,
  });

  revalidatePath("/admin/contenido");
  revalidatePath("/");
  redirect(
    `/admin/contenido?tab=cifras&guardado=cifra-actualizada&t=${Date.now()}`
  );
}

// Sin FK que lo referencie, el borrado no necesita ninguna guardia previa.
export async function eliminarCifra(cifraId: string) {
  await verifySession();

  await prisma.cifraConfianza.delete({ where: { id: cifraId } });

  revalidatePath("/admin/contenido");
  revalidatePath("/");
  redirect("/admin/contenido?tab=cifras");
}

// ---- Historia (hitos) ----

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

  revalidatePath("/admin/contenido");
  revalidatePath("/");
  redirect(`/admin/contenido?tab=historia&guardado=hito-creado&t=${Date.now()}`);
}

export async function actualizarHito(hitoId: string, formData: FormData) {
  await verifySession();

  const datos = datosHito(formData);

  await prisma.hitoHistorico.update({
    where: { id: hitoId },
    data: datos,
  });

  revalidatePath("/admin/contenido");
  revalidatePath("/");
  redirect(
    `/admin/contenido?tab=historia&guardado=hito-actualizado&t=${Date.now()}`
  );
}

// Sin FK que lo referencie, el borrado no necesita ninguna guardia previa.
export async function eliminarHito(hitoId: string) {
  await verifySession();

  await prisma.hitoHistorico.delete({ where: { id: hitoId } });

  revalidatePath("/admin/contenido");
  revalidatePath("/");
  redirect("/admin/contenido?tab=historia");
}

// ---- Testimonios ----

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

  revalidatePath("/admin/contenido");
  revalidatePath("/");
  redirect(
    `/admin/contenido?tab=testimonios&guardado=testimonio-creado&t=${Date.now()}`
  );
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

  revalidatePath("/admin/contenido");
  revalidatePath("/");
  redirect(
    `/admin/contenido?tab=testimonios&guardado=testimonio-actualizado&t=${Date.now()}`
  );
}

// Sin FK que lo referencie, el borrado no necesita ninguna guardia previa.
export async function eliminarTestimonio(testimonioId: string) {
  await verifySession();

  await prisma.testimonio.delete({ where: { id: testimonioId } });

  revalidatePath("/admin/contenido");
  revalidatePath("/");
  redirect("/admin/contenido?tab=testimonios");
}
