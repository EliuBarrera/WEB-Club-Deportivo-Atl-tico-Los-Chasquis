"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/admin/dal";
import cloudinary from "@/lib/cloudinary";
import {
  eventoSchema,
  resultadosSchema,
  IMAGEN_TIPOS_PERMITIDOS,
  IMAGEN_TAMANO_MAXIMO,
} from "@/lib/validation/evento";
import { categoriaSchema } from "@/lib/validation/categoria";
import { listaTextoSchema } from "@/lib/validation/listaTexto";
import { noticiaSchema } from "@/lib/validation/noticia";

function campoTexto(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

function campoOpcional(formData: FormData, campo: string): string | undefined {
  const limpio = campoTexto(formData, campo);
  return limpio === "" ? undefined : limpio;
}

// Crea un evento BORRADOR mínimo y lleva directo a su editor — evita un
// formulario de "creación" aparte, todo se completa en el mismo panel por
// pestañas (Fase 6).
export async function crearEvento() {
  await verifySession();

  const evento = await prisma.evento.create({
    data: {
      titulo: "Nuevo evento",
      fecha: new Date(),
      ubicacion: "",
      precio: 0,
    },
  });

  revalidatePath("/admin/eventos");
  redirect(`/admin/eventos?eventoId=${evento.id}&guardado=evento-creado&t=${Date.now()}`);
}

// Guarda las pestañas Información + Recorrido + Contacto en una sola
// acción (mismo botón "Guardar cambios" del mockup). La imagen es
// opcional: si no se elige un archivo nuevo, se conserva la que ya
// tenía el evento.
export async function actualizarEvento(eventoId: string, formData: FormData) {
  await verifySession();

  const datos = eventoSchema.parse({
    titulo: campoTexto(formData, "titulo"),
    subtitulo: campoOpcional(formData, "subtitulo"),
    fecha: campoTexto(formData, "fecha"),
    horario: campoOpcional(formData, "horario"),
    cierreInscripciones: campoOpcional(formData, "cierreInscripciones"),
    ubicacion: campoTexto(formData, "ubicacion"),
    precio: campoTexto(formData, "precio"),
    descuento: campoOpcional(formData, "descuento") ?? "0",
    descuentoLabel: campoOpcional(formData, "descuentoLabel"),
    estado: campoTexto(formData, "estado"),
    descripcion: campoOpcional(formData, "descripcion"),
    distancia: campoOpcional(formData, "distancia"),
    desnivel: campoOpcional(formData, "desnivel"),
    salida: campoOpcional(formData, "salida"),
    meta: campoOpcional(formData, "meta"),
    modalidad: campoOpcional(formData, "modalidad"),
    terreno: campoOpcional(formData, "terreno"),
    organizador: campoOpcional(formData, "organizador"),
    aval: campoOpcional(formData, "aval"),
    terminosUrl: campoOpcional(formData, "terminosUrl") ?? "",
  });

  // Validar tipo/tamaño en servidor antes de subir a Cloudinary (Fase 6):
  // nunca confiar en el `accept` del <input>, que solo es una sugerencia
  // del navegador.
  let imagenUrl: string | undefined;
  const imagen = formData.get("imagen");
  if (imagen instanceof File && imagen.size > 0) {
    if (
      !IMAGEN_TIPOS_PERMITIDOS.includes(
        imagen.type as (typeof IMAGEN_TIPOS_PERMITIDOS)[number]
      )
    ) {
      redirect(
        `/admin/eventos?eventoId=${eventoId}&error=imagen-formato`
      );
    }
    if (imagen.size > IMAGEN_TAMANO_MAXIMO) {
      redirect(`/admin/eventos?eventoId=${eventoId}&error=imagen-tamano`);
    }

    const buffer = Buffer.from(await imagen.arrayBuffer());
    const dataUri = `data:${imagen.type};base64,${buffer.toString("base64")}`;
    const resultado = await cloudinary.uploader.upload(dataUri, {
      folder: "chasquis/eventos",
    });
    imagenUrl = resultado.secure_url;
  }

  await prisma.$transaction([
    prisma.evento.update({
      where: { id: eventoId },
      data: {
        titulo: datos.titulo,
        subtitulo: datos.subtitulo ?? null,
        fecha: new Date(datos.fecha),
        horario: datos.horario ?? null,
        cierreInscripciones: datos.cierreInscripciones ?? null,
        ubicacion: datos.ubicacion,
        precio: datos.precio,
        descuento: datos.descuento,
        descuentoLabel: datos.descuentoLabel ?? null,
        estado: datos.estado,
        descripcion: datos.descripcion ?? null,
        organizador: datos.organizador ?? null,
        aval: datos.aval ?? null,
        terminosUrl: datos.terminosUrl || null,
        ...(imagenUrl ? { imagenUrl } : {}),
      },
    }),
    prisma.recorrido.upsert({
      where: { eventoId },
      create: {
        eventoId,
        distancia: datos.distancia ?? null,
        desnivel: datos.desnivel ?? null,
        salida: datos.salida ?? null,
        meta: datos.meta ?? null,
        modalidad: datos.modalidad ?? null,
        terreno: datos.terreno ?? null,
      },
      update: {
        distancia: datos.distancia ?? null,
        desnivel: datos.desnivel ?? null,
        salida: datos.salida ?? null,
        meta: datos.meta ?? null,
        modalidad: datos.modalidad ?? null,
        terreno: datos.terreno ?? null,
      },
    }),
  ]);

  revalidatePath("/admin/eventos");
  redirect(`/admin/eventos?eventoId=${eventoId}&guardado=evento&t=${Date.now()}`);
}

export async function publicarResultados(eventoId: string, formData: FormData) {
  await verifySession();

  const datos = resultadosSchema.parse({
    resultadosUrl: campoOpcional(formData, "resultadosUrl") ?? "",
  });

  await prisma.evento.update({
    where: { id: eventoId },
    data: { resultadosUrl: datos.resultadosUrl || null },
  });

  revalidatePath("/admin/eventos");
  redirect(`/admin/eventos?eventoId=${eventoId}`);
}

// La FK real de Inscripcion.eventoId es ON DELETE RESTRICT (ver
// prisma/migrations/20260810231409_init/migration.sql), así que Postgres
// ya rechazaría este borrado — el count previo es solo para dar un
// mensaje amable en vez de un 500 con detalle de Prisma (Fase 7: no
// exponer errores internos).
export async function eliminarEvento(eventoId: string) {
  await verifySession();

  const inscritos = await prisma.inscripcion.count({ where: { eventoId } });
  if (inscritos > 0) {
    redirect(`/admin/eventos?eventoId=${eventoId}&error=tiene-inscripciones`);
  }

  await prisma.evento.delete({ where: { id: eventoId } });

  revalidatePath("/admin/eventos");
  redirect("/admin/eventos");
}

function datosCategoria(formData: FormData) {
  return categoriaSchema.parse({
    nombre: campoTexto(formData, "nombre"),
    edad: campoTexto(formData, "edad"),
    nacimiento: campoTexto(formData, "nacimiento"),
    rama: campoOpcional(formData, "rama") ?? "MASCULINA Y FEMENINA",
    orden: campoOpcional(formData, "orden") ?? "0",
    pruebasIds: formData.getAll("pruebasIds").map(String),
  });
}

export async function crearCategoria(eventoId: string, formData: FormData) {
  await verifySession();

  const datos = datosCategoria(formData);

  await prisma.categoria.create({
    data: {
      eventoId,
      nombre: datos.nombre,
      edad: datos.edad,
      nacimiento: datos.nacimiento,
      rama: datos.rama,
      orden: datos.orden,
      pruebas: {
        create: datos.pruebasIds.map((pruebaId) => ({ pruebaId })),
      },
    },
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=categoria-creada&t=${Date.now()}`
  );
}

export async function actualizarCategoria(
  categoriaId: string,
  eventoId: string,
  formData: FormData
) {
  await verifySession();

  const datos = datosCategoria(formData);

  await prisma.$transaction([
    prisma.categoria.update({
      where: { id: categoriaId },
      data: {
        nombre: datos.nombre,
        edad: datos.edad,
        nacimiento: datos.nacimiento,
        rama: datos.rama,
        orden: datos.orden,
      },
    }),
    prisma.categoriaPrueba.deleteMany({ where: { categoriaId } }),
    prisma.categoriaPrueba.createMany({
      data: datos.pruebasIds.map((pruebaId) => ({ categoriaId, pruebaId })),
    }),
  ]);

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=categoria&t=${Date.now()}`
  );
}

// A diferencia de la FK real (`Inscripcion.categoriaId` es ON DELETE SET
// NULL), acá se bloquea el borrado si ya hay inscritos: dejar que Postgres
// pusiera el campo en null silenciosamente perdería el vínculo con la
// categoría de inscripciones ya pagadas, sin avisar a nadie.
export async function eliminarCategoria(categoriaId: string, eventoId: string) {
  await verifySession();

  const inscritos = await prisma.inscripcion.count({ where: { categoriaId } });
  if (inscritos > 0) {
    redirect(
      `/admin/eventos?eventoId=${eventoId}&error=categoria-tiene-inscripciones`
    );
  }

  await prisma.categoria.delete({ where: { id: categoriaId } });

  revalidatePath("/admin/eventos");
  redirect(`/admin/eventos?eventoId=${eventoId}`);
}

// Reutilizado por guardarPremios: misma validación de tipo/tamaño que ya
// usa actualizarEvento para la portada del evento, antes de subir a
// Cloudinary.
async function subirImagenSiExiste(
  formData: FormData,
  campo: string,
  eventoId: string,
  folder: string
): Promise<string | undefined> {
  const imagen = formData.get(campo);
  if (!(imagen instanceof File) || imagen.size === 0) return undefined;

  if (
    !IMAGEN_TIPOS_PERMITIDOS.includes(
      imagen.type as (typeof IMAGEN_TIPOS_PERMITIDOS)[number]
    )
  ) {
    redirect(`/admin/eventos?eventoId=${eventoId}&error=imagen-formato`);
  }
  if (imagen.size > IMAGEN_TAMANO_MAXIMO) {
    redirect(`/admin/eventos?eventoId=${eventoId}&error=imagen-tamano`);
  }

  const buffer = Buffer.from(await imagen.arrayBuffer());
  const dataUri = `data:${imagen.type};base64,${buffer.toString("base64")}`;
  const resultado = await cloudinary.uploader.upload(dataUri, { folder });
  return resultado.secure_url;
}

// Premios/Reglamento/Logística guardan listas de texto plano ({ id, texto,
// orden }) — el orden final es el orden de envío del formulario (ver
// ListaTextoEditable.tsx), no un campo numérico independiente.
function datosListaTexto(formData: FormData, campo: string): string[] {
  return listaTextoSchema.parse(
    formData
      .getAll(campo)
      .map(String)
      .map((texto) => texto.trim())
      .filter(Boolean)
  );
}

export async function guardarPremios(eventoId: string, formData: FormData) {
  await verifySession();

  const ceremoniaHora = campoOpcional(formData, "ceremoniaHora");
  const ceremoniaLugar = campoOpcional(formData, "ceremoniaLugar");
  const condiciones = datosListaTexto(formData, "condiciones");
  const efectivoUrl = await subirImagenSiExiste(
    formData,
    "efectivoImagen",
    eventoId,
    "chasquis/premios"
  );

  const premios = await prisma.premios.upsert({
    where: { eventoId },
    create: {
      eventoId,
      ceremoniaHora: ceremoniaHora ?? null,
      ceremoniaLugar: ceremoniaLugar ?? null,
      ...(efectivoUrl ? { efectivoUrl } : {}),
    },
    update: {
      ceremoniaHora: ceremoniaHora ?? null,
      ceremoniaLugar: ceremoniaLugar ?? null,
      ...(efectivoUrl ? { efectivoUrl } : {}),
    },
  });

  await prisma.$transaction([
    prisma.condicionPremio.deleteMany({ where: { premiosId: premios.id } }),
    prisma.condicionPremio.createMany({
      data: condiciones.map((texto, orden) => ({
        premiosId: premios.id,
        texto,
        orden,
      })),
    }),
  ]);

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=premios&t=${Date.now()}`
  );
}

export async function guardarReglamento(eventoId: string, formData: FormData) {
  await verifySession();

  const competencia = datosListaTexto(formData, "competencia");
  const seguridad = datosListaTexto(formData, "seguridad");
  const controles = datosListaTexto(formData, "controles");

  const reglamento = await prisma.reglamento.upsert({
    where: { eventoId },
    create: { eventoId },
    update: {},
  });

  await prisma.$transaction([
    prisma.reglaCompetencia.deleteMany({
      where: { reglamentoId: reglamento.id },
    }),
    prisma.reglaCompetencia.createMany({
      data: competencia.map((texto, orden) => ({
        reglamentoId: reglamento.id,
        texto,
        orden,
      })),
    }),
    prisma.normaSeguridad.deleteMany({
      where: { reglamentoId: reglamento.id },
    }),
    prisma.normaSeguridad.createMany({
      data: seguridad.map((texto, orden) => ({
        reglamentoId: reglamento.id,
        texto,
        orden,
      })),
    }),
    prisma.controlItem.deleteMany({ where: { reglamentoId: reglamento.id } }),
    prisma.controlItem.createMany({
      data: controles.map((texto, orden) => ({
        reglamentoId: reglamento.id,
        texto,
        orden,
      })),
    }),
  ]);

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=reglamento&t=${Date.now()}`
  );
}

export async function guardarLogistica(eventoId: string, formData: FormData) {
  await verifySession();

  const servicios = datosListaTexto(formData, "servicios");
  const recomendaciones = datosListaTexto(formData, "recomendaciones");
  const kit = datosListaTexto(formData, "kit");

  const logistica = await prisma.logistica.upsert({
    where: { eventoId },
    create: { eventoId },
    update: {},
  });

  await prisma.$transaction([
    prisma.servicioItem.deleteMany({
      where: { logisticaId: logistica.id },
    }),
    prisma.servicioItem.createMany({
      data: servicios.map((texto, orden) => ({
        logisticaId: logistica.id,
        texto,
        orden,
      })),
    }),
    prisma.recomendacionItem.deleteMany({
      where: { logisticaId: logistica.id },
    }),
    prisma.recomendacionItem.createMany({
      data: recomendaciones.map((texto, orden) => ({
        logisticaId: logistica.id,
        texto,
        orden,
      })),
    }),
    prisma.kitItem.deleteMany({ where: { logisticaId: logistica.id } }),
    prisma.kitItem.createMany({
      data: kit.map((texto, orden) => ({
        logisticaId: logistica.id,
        texto,
        orden,
      })),
    }),
  ]);

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=logistica&t=${Date.now()}`
  );
}

function datosNoticia(formData: FormData) {
  return noticiaSchema.parse({
    titulo: campoTexto(formData, "titulo"),
    fecha: campoTexto(formData, "fecha"),
    contenido: campoTexto(formData, "contenido"),
    orden: campoOpcional(formData, "orden") ?? "0",
  });
}

export async function crearNoticia(eventoId: string, formData: FormData) {
  await verifySession();

  const datos = datosNoticia(formData);

  await prisma.noticia.create({
    data: { eventoId, ...datos },
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=noticia-creada&t=${Date.now()}`
  );
}

export async function actualizarNoticia(
  noticiaId: string,
  eventoId: string,
  formData: FormData
) {
  await verifySession();

  const datos = datosNoticia(formData);

  await prisma.noticia.update({
    where: { id: noticiaId },
    data: datos,
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=noticia&t=${Date.now()}`
  );
}

// A diferencia de Categoría, Noticia no tiene ninguna FK que la referencie
// (no hay Inscripcion.noticiaId ni nada similar) — el borrado no necesita
// ninguna guardia previa.
export async function eliminarNoticia(noticiaId: string, eventoId: string) {
  await verifySession();

  await prisma.noticia.delete({ where: { id: noticiaId } });

  revalidatePath("/admin/eventos");
  redirect(`/admin/eventos?eventoId=${eventoId}`);
}
