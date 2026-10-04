"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession, verifySessionAdmin } from "@/lib/admin/dal";
import { getAtletasUnicos } from "@/lib/admin/atletas";
import {
  enviarResumenALista,
  textoPrecioDifusion,
} from "@/lib/admin/difusion";
import cloudinary from "@/lib/cloudinary";
import {
  eventoSchema,
  eventoEdicionSchema,
  resultadosSchema,
  IMAGEN_TIPOS_PERMITIDOS,
  IMAGEN_TAMANO_MAXIMO,
  EVENTO_JSON_TAMANO_MAXIMO,
  traducirErroresEventoJson,
  type ErrorEventoJson,
} from "@/lib/validation/evento";
import { categoriaSchema } from "@/lib/validation/categoria";
import { listaTextoSchema } from "@/lib/validation/listaTexto";
import { noticiaSchema } from "@/lib/validation/noticia";
import { recorridoSchema } from "@/lib/validation/recorrido";
import { distanciaSchema } from "@/lib/validation/distancia";
import { preciosSchema } from "@/lib/validation/precios";
import { guardarPreciosEvento } from "@/lib/admin/precios";
import { preciosDelEvento } from "@/lib/precios";

// `maxDuration` no se puede exportar desde un archivo "use server" (Next.js
// exige que todo export de un módulo de Server Actions sea una función
// async) — la Server Action enviarResumenEvento de más abajo hereda el
// límite configurado en app/admin/(panel)/eventos/page.tsx, que es la
// página que la invoca.

function campoTexto(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

function campoOpcional(formData: FormData, campo: string): string | undefined {
  const limpio = campoTexto(formData, campo);
  return limpio === "" ? undefined : limpio;
}

// El detalle campo-por-campo del error de "Crear desde JSON" viaja en la
// propia URL de redirect (igual que `guardado`/`error` en el resto de este
// archivo) para que ErroresJsonModal lo lea en page.tsx sin necesitar
// sesión/cookie nueva. Se recorta a 20 entradas como tope defensivo —
// eventoSchema hoy no llega ni a la mitad de eso — para no mandar una URL
// larga de más si algún día el schema crece.
function redireccionJsonInvalido(detalle: ErrorEventoJson[]): never {
  const recortado = detalle.slice(0, 20);
  redirect(
    `/admin/eventos?error=json-invalido&jsonDetalle=${encodeURIComponent(
      JSON.stringify(recortado),
    )}&t=${Date.now()}`,
  );
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
    },
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${evento.id}&guardado=evento-creado&t=${Date.now()}`,
  );
}

// Crea un evento a partir de un archivo JSON con los campos básicos
// (Fase 11) — mismo alcance que eventoSchema (Información + Recorrido +
// Contacto), Categorías/Premios/Reglamento/Logística/Noticias se siguen
// llenando a mano en el editor, igual que con crearEvento(). El JSON se
// parsea y valida siempre en el servidor, nunca se confía en el cliente.
export async function crearEventoDesdeJson(formData: FormData) {
  await verifySession();

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    redirect("/admin/eventos?error=json-vacio");
  }
  if (archivo.size > EVENTO_JSON_TAMANO_MAXIMO) {
    redirect("/admin/eventos?error=json-tamano");
  }

  let contenido: unknown;
  try {
    contenido = JSON.parse(await archivo.text());
  } catch (error) {
    redireccionJsonInvalido([
      {
        campo: "Archivo",
        mensaje:
          error instanceof Error
            ? error.message
            : "El archivo no contiene JSON válido.",
      },
    ]);
  }

  const resultado = eventoSchema.safeParse(contenido);
  if (!resultado.success) {
    redireccionJsonInvalido(traducirErroresEventoJson(resultado.error));
  }
  const datos = resultado.data;

  const evento = await prisma.evento.create({
    data: {
      titulo: datos.titulo,
      subtitulo: datos.subtitulo ?? null,
      fecha: new Date(datos.fecha),
      horario: datos.horario ?? null,
      cierreInscripciones: datos.cierreInscripciones ?? null,
      ubicacion: datos.ubicacion,
      estado: datos.estado,
      tipo: datos.tipo,
      descripcion: datos.descripcion ?? null,
      organizador: datos.organizador ?? null,
      aval: datos.aval ?? null,
      terminosUrl: datos.terminosUrl || null,
      recorridos: {
        create: {
          distancia: datos.distancia ?? null,
          desnivel: datos.desnivel ?? null,
          salida: datos.salida ?? null,
          meta: datos.meta ?? null,
          modalidad: datos.modalidad ?? null,
          terreno: datos.terreno ?? null,
        },
      },
    },
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${evento.id}&guardado=evento-creado-json&t=${Date.now()}`,
  );
}

// Guarda las pestañas Información + Recorrido + Contacto en una sola
// acción (mismo botón "Guardar cambios" del mockup). La imagen es
// opcional: si no se elige un archivo nuevo, se conserva la que ya
// tenía el evento.
export async function actualizarEvento(eventoId: string, formData: FormData) {
  await verifySession();

  // El precio ya no se edita aquí: sale de la pestaña Precios (Fase 12.1).
  const datos = eventoEdicionSchema.parse({
    titulo: campoTexto(formData, "titulo"),
    subtitulo: campoOpcional(formData, "subtitulo"),
    fecha: campoTexto(formData, "fecha"),
    horario: campoOpcional(formData, "horario"),
    cierreInscripciones: campoOpcional(formData, "cierreInscripciones"),
    ubicacion: campoTexto(formData, "ubicacion"),
    estado: campoTexto(formData, "estado"),
    tipo: campoOpcional(formData, "tipo"),
    descripcion: campoOpcional(formData, "descripcion"),
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
        imagen.type as (typeof IMAGEN_TIPOS_PERMITIDOS)[number],
      )
    ) {
      redirect(`/admin/eventos?eventoId=${eventoId}&error=imagen-formato`);
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

  await prisma.evento.update({
    where: { id: eventoId },
    data: {
      titulo: datos.titulo,
      subtitulo: datos.subtitulo ?? null,
      fecha: new Date(datos.fecha),
      horario: datos.horario ?? null,
      cierreInscripciones: datos.cierreInscripciones ?? null,
      ubicacion: datos.ubicacion,
      estado: datos.estado,
      tipo: datos.tipo,
      descripcion: datos.descripcion ?? null,
      organizador: datos.organizador ?? null,
      aval: datos.aval ?? null,
      terminosUrl: datos.terminosUrl || null,
      ...(imagenUrl ? { imagenUrl } : {}),
    },
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=evento&t=${Date.now()}`,
  );
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
    pruebasIds: formData.getAll("pruebasIds").map(String),
    grupoTarifaId: campoOpcional(formData, "grupoTarifaId"),
    distanciaId: campoOpcional(formData, "distanciaId"),
    recorridoId: campoOpcional(formData, "recorridoId"),
    vueltas: campoOpcional(formData, "vueltas"),
    horaSalida: campoOpcional(formData, "horaSalida"),
    sitioSalida: campoOpcional(formData, "sitioSalida"),
    sitioLlegada: campoOpcional(formData, "sitioLlegada"),
  });
}

async function recorridoDelEvento(
  eventoId: string,
  recorridoId: string | undefined,
): Promise<string | null> {
  if (!recorridoId) return null;
  const recorrido = await prisma.recorrido.findFirst({
    where: { id: recorridoId, eventoId },
    select: { id: true },
  });
  if (!recorrido) redirect(`/admin/eventos?eventoId=${eventoId}&error=recorrido-invalido`);
  return recorrido.id;
}

async function distanciaDelEvento(
  eventoId: string,
  distanciaId: string | undefined,
): Promise<string | null> {
  if (!distanciaId) return null;
  const distancia = await prisma.distancia.findFirst({
    where: { id: distanciaId, eventoId },
    select: { id: true },
  });
  if (!distancia) redirect(`/admin/eventos?eventoId=${eventoId}&error=distancia-invalida`);
  return distancia.id;
}

// Distancia y campos de carrera de calle de la categoría (Fase 12.3), ya
// validados.
async function datosCarreraCategoria(
  eventoId: string,
  datos: ReturnType<typeof datosCategoria>,
) {
  return {
    distanciaId: await distanciaDelEvento(eventoId, datos.distanciaId),
    recorridoId: await recorridoDelEvento(eventoId, datos.recorridoId),
    vueltas: datos.vueltas ?? null,
    horaSalida: datos.horaSalida ?? null,
    sitioSalida: datos.sitioSalida ?? null,
    sitioLlegada: datos.sitioLlegada ?? null,
  };
}

// El grupo de tarifa decide el precio de la categoría: tiene que ser de
// este mismo evento, nunca de otro.
async function grupoTarifaDelEvento(
  eventoId: string,
  grupoTarifaId: string | undefined,
): Promise<string | null> {
  if (!grupoTarifaId) return null;
  const grupo = await prisma.grupoTarifa.findFirst({
    where: { id: grupoTarifaId, eventoId },
    select: { id: true },
  });
  if (!grupo) redirect(`/admin/eventos?eventoId=${eventoId}&error=grupo-invalido`);
  return grupo.id;
}

export async function crearCategoria(eventoId: string, formData: FormData) {
  await verifySession();

  const datos = datosCategoria(formData);
  const grupoTarifaId = await grupoTarifaDelEvento(eventoId, datos.grupoTarifaId);
  const carrera = await datosCarreraCategoria(eventoId, datos);

  await prisma.categoria.create({
    data: {
      eventoId,
      grupoTarifaId,
      ...carrera,
      nombre: datos.nombre,
      edad: datos.edad,
      nacimiento: datos.nacimiento,
      rama: datos.rama,
      pruebas: {
        create: datos.pruebasIds.map((pruebaId) => ({ pruebaId })),
      },
    },
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=categoria-creada&t=${Date.now()}`,
  );
}

export async function actualizarCategoria(
  categoriaId: string,
  eventoId: string,
  formData: FormData,
) {
  await verifySession();

  const datos = datosCategoria(formData);
  const grupoTarifaId = await grupoTarifaDelEvento(eventoId, datos.grupoTarifaId);
  const carrera = await datosCarreraCategoria(eventoId, datos);

  await prisma.$transaction([
    prisma.categoria.update({
      where: { id: categoriaId, eventoId },
      data: {
        grupoTarifaId,
        ...carrera,
        nombre: datos.nombre,
        edad: datos.edad,
        nacimiento: datos.nacimiento,
        rama: datos.rama,
      },
    }),
    prisma.categoriaPrueba.deleteMany({ where: { categoriaId } }),
    prisma.categoriaPrueba.createMany({
      data: datos.pruebasIds.map((pruebaId) => ({ categoriaId, pruebaId })),
    }),
  ]);

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=categoria&t=${Date.now()}`,
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
      `/admin/eventos?eventoId=${eventoId}&error=categoria-tiene-inscripciones`,
    );
  }

  await prisma.categoria.delete({ where: { id: categoriaId } });

  revalidatePath("/admin/eventos");
  redirect(`/admin/eventos?eventoId=${eventoId}`);
}

// Distancias del evento: solo se crean y eliminan (renombrar = eliminar y
// crear). Al eliminar una, sus categorías quedan sin distancia (SET NULL).
export async function crearDistancia(eventoId: string, formData: FormData) {
  await verifySession();

  const resultado = distanciaSchema.safeParse({
    nombre: campoTexto(formData, "nombre"),
  });
  if (!resultado.success) {
    redirect(`/admin/eventos?eventoId=${eventoId}&error=distancia-invalida`);
  }

  const existente = await prisma.distancia.findUnique({
    where: { eventoId_nombre: { eventoId, nombre: resultado.data.nombre } },
    select: { id: true },
  });
  if (existente) {
    redirect(`/admin/eventos?eventoId=${eventoId}&error=distancia-repetida`);
  }

  await prisma.distancia.create({
    data: { eventoId, nombre: resultado.data.nombre },
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=distancia-creada&t=${Date.now()}`,
  );
}

export async function eliminarDistancia(distanciaId: string, eventoId: string) {
  await verifySession();

  await prisma.distancia.delete({ where: { id: distanciaId, eventoId } });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=distancia-eliminada&t=${Date.now()}`,
  );
}

function datosRecorrido(formData: FormData) {
  return recorridoSchema.parse({
    nombre: campoTexto(formData, "nombre"),
    orden: campoOpcional(formData, "orden") ?? "0",
    distancia: campoOpcional(formData, "distancia"),
    desnivel: campoOpcional(formData, "desnivel"),
    salida: campoOpcional(formData, "salida"),
    meta: campoOpcional(formData, "meta"),
    modalidad: campoOpcional(formData, "modalidad"),
    terreno: campoOpcional(formData, "terreno"),
  });
}

function camposRecorrido(datos: ReturnType<typeof datosRecorrido>) {
  return {
    nombre: datos.nombre,
    orden: datos.orden,
    distancia: datos.distancia ?? null,
    desnivel: datos.desnivel ?? null,
    salida: datos.salida ?? null,
    meta: datos.meta ?? null,
    modalidad: datos.modalidad ?? null,
    terreno: datos.terreno ?? null,
  };
}

// Recorridos (Fase 12.3): varios por evento, cada uno con su croquis
// opcional (subido a Cloudinary, mismas validaciones que la portada).
export async function crearRecorrido(eventoId: string, formData: FormData) {
  await verifySession();

  const datos = datosRecorrido(formData);
  const mapaUrl = await subirImagenSiExiste(
    formData,
    "mapa",
    eventoId,
    "chasquis/recorridos",
  );

  await prisma.recorrido.create({
    data: { eventoId, ...camposRecorrido(datos), mapaUrl: mapaUrl ?? null },
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=recorrido-creado&t=${Date.now()}`,
  );
}

export async function actualizarRecorrido(
  recorridoId: string,
  eventoId: string,
  formData: FormData,
) {
  await verifySession();

  const datos = datosRecorrido(formData);
  const mapaUrl = await subirImagenSiExiste(
    formData,
    "mapa",
    eventoId,
    "chasquis/recorridos",
  );

  await prisma.recorrido.update({
    where: { id: recorridoId, eventoId },
    data: { ...camposRecorrido(datos), ...(mapaUrl ? { mapaUrl } : {}) },
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=recorrido&t=${Date.now()}`,
  );
}

// Las categorías que lo corrían quedan sin recorrido (FK SET NULL); no hay
// inscripciones colgando de un recorrido, así que no se bloquea.
export async function eliminarRecorrido(recorridoId: string, eventoId: string) {
  await verifySession();

  await prisma.recorrido.delete({ where: { id: recorridoId, eventoId } });

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
  folder: string,
): Promise<string | undefined> {
  const imagen = formData.get(campo);
  if (!(imagen instanceof File) || imagen.size === 0) return undefined;

  if (
    !IMAGEN_TIPOS_PERMITIDOS.includes(
      imagen.type as (typeof IMAGEN_TIPOS_PERMITIDOS)[number],
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
      .filter(Boolean),
  );
}

// Notas de categoría (Fase 12.6): lista de texto plano del evento, se
// muestran en el modal de T&C.
export async function guardarNotasCategorias(
  eventoId: string,
  formData: FormData,
) {
  await verifySession();

  const notasCategorias = datosListaTexto(formData, "notasCategorias");

  await prisma.evento.update({
    where: { id: eventoId },
    data: { notasCategorias },
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=notas-categorias&t=${Date.now()}`,
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
    "chasquis/premios",
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
    `/admin/eventos?eventoId=${eventoId}&guardado=premios&t=${Date.now()}`,
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
    `/admin/eventos?eventoId=${eventoId}&guardado=reglamento&t=${Date.now()}`,
  );
}

function redireccionPreciosInvalidos(eventoId: string, detalle: string): never {
  redirect(
    `/admin/eventos?eventoId=${eventoId}&error=precios-invalidos&detalle=${encodeURIComponent(
      detalle.slice(0, 200),
    )}&t=${Date.now()}`,
  );
}

// Pestaña Precios (Fase 12.1): guarda rondas, grupos de tarifa y la tabla
// de tarifas completa de una vez. No permite quitar una ronda o un grupo
// que ya tenga inscripciones — su FK es SET NULL y se perdería con qué
// ronda/grupo pagó cada quien. Quitar un grupo sí deja sin grupo a sus
// categorías (la pestaña lo avisa).
export async function guardarPrecios(eventoId: string, formData: FormData) {
  await verifySession();

  let crudo: unknown = null;
  try {
    crudo = JSON.parse(campoTexto(formData, "precios"));
  } catch {
    // queda null y lo rechaza el schema
  }
  const resultado = preciosSchema.safeParse(crudo);
  if (!resultado.success) {
    redireccionPreciosInvalidos(
      eventoId,
      resultado.error.issues[0]?.message ?? "Datos inválidos.",
    );
  }
  const datos = resultado.data;

  const resultadoGuardado = await guardarPreciosEvento(eventoId, datos);
  if ("error" in resultadoGuardado) {
    redireccionPreciosInvalidos(eventoId, resultadoGuardado.error);
  }

  revalidatePath("/admin/eventos");
  redirect(`/admin/eventos?eventoId=${eventoId}&guardado=precios&t=${Date.now()}`);
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
    `/admin/eventos?eventoId=${eventoId}&guardado=logistica&t=${Date.now()}`,
  );
}

function datosNoticia(formData: FormData) {
  return noticiaSchema.parse({
    titulo: campoTexto(formData, "titulo"),
    fecha: campoTexto(formData, "fecha"),
    contenido: campoTexto(formData, "contenido"),
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
    `/admin/eventos?eventoId=${eventoId}&guardado=noticia-creada&t=${Date.now()}`,
  );
}

export async function actualizarNoticia(
  noticiaId: string,
  eventoId: string,
  formData: FormData,
) {
  await verifySession();

  const datos = datosNoticia(formData);

  await prisma.noticia.update({
    where: { id: noticiaId },
    data: datos,
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&guardado=noticia&t=${Date.now()}`,
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

// Difusión masiva (Fase 11): manda un resumen del evento a todos los
// atletas únicos del club (no solo a los inscritos a este evento — a
// pedido del club), por WhatsApp o por correo. Requiere rol ADMIN, no
// EDITOR (verifySessionAdmin). Sin cola ni cron (no existen en este
// proyecto): a volúmenes reales de un club, un loop con concurrencia
// acotada dentro de la misma request termina en segundos — mismo
// criterio que ya usa el export de CSV.
export async function enviarResumenEvento(
  eventoId: string,
  canal: "WHATSAPP" | "EMAIL",
) {
  const session = await verifySessionAdmin();

  const evento = await prisma.evento.findUniqueOrThrow({
    where: { id: eventoId },
    select: {
      id: true,
      titulo: true,
      fecha: true,
      ubicacion: true,
      horario: true,
      cierreInscripciones: true,
      rondas: {
        select: {
          id: true,
          orden: true,
          nombre: true,
          fechaCierre: true,
          tarifas: { select: { grupoTarifaId: true, valor: true } },
        },
      },
      gruposTarifa: {
        select: { id: true, nombre: true, derechos: true, orden: true },
      },
    },
  });

  const atletas = await getAtletasUnicos();
  const resultados = await enviarResumenALista(atletas, canal, {
    ...evento,
    precio: textoPrecioDifusion(preciosDelEvento(evento)),
  });

  const exitosos = resultados.filter((r) => r.ok).length;
  const fallidos = resultados.length - exitosos;
  const erroresMuestra = resultados
    .filter((r) => !r.ok)
    .slice(0, 20)
    .map((r) => ({
      numeroDocumento: r.numeroDocumento,
      motivo: r.error ?? "",
    }));

  const usuario = await prisma.usuario.findUniqueOrThrow({
    where: { email: session.user.email! },
    select: { id: true },
  });

  await prisma.envioMasivo.create({
    data: {
      eventoId,
      canal,
      usuarioId: usuario.id,
      totalDestinatarios: resultados.length,
      totalExitosos: exitosos,
      totalFallidos: fallidos,
      erroresMuestra: erroresMuestra as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/admin/eventos");
  redirect(
    `/admin/eventos?eventoId=${eventoId}&difusionCanal=${canal}&difusionExitosos=${exitosos}&difusionFallidos=${fallidos}&difusionTotal=${resultados.length}&t=${Date.now()}`,
  );
}
