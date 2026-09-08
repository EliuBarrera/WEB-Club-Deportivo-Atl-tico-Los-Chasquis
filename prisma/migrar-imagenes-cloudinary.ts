// Script puntual para migrar a Cloudinary las imágenes sembradas en la
// Fase 1 (URLs de ibb.co/unsplash que vienen del `Festivales` original),
// último pendiente de Fase 6 (ver Documentation/PLAN_DESARROLLO.md).
// No es un script `npm run` — se ejecuta a mano una sola vez, igual que
// prisma/seed-admin.ts. Es idempotente: las imágenes que ya estén en
// Cloudinary (subidas por este mismo script o desde el panel admin) se
// saltan, así que se puede volver a correr sin duplicar nada.
//
// Uso: npx tsx prisma/migrar-imagenes-cloudinary.ts

import "dotenv/config";
import dns from "node:dns";
import net from "node:net";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import cloudinary from "../lib/cloudinary";

// Ver nota en lib/prisma.ts.
dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function yaEsCloudinary(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

// Cloudinary sabe subir directo desde una URL remota (pasándola tal cual a
// `upload`), pero eso le pide a ibb.co que le responda específicamente a
// la infraestructura de fetch de Cloudinary — y ese primer intento del
// script mostró que ibb.co la bloquea/limita para esas peticiones. Se
// descarga acá mismo con `fetch` normal y se sube el archivo ya en
// memoria (mismo patrón que actualizarEvento en actions.ts para el
// upload de portada desde el formulario).
async function descargar(url: string): Promise<{ buffer: Buffer; tipo: string }> {
  const controlador = new AbortController();
  const limite = setTimeout(() => controlador.abort(), 20_000);
  try {
    const respuesta = await fetch(url, { signal: controlador.signal });
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} al descargar ${url}`);
    }
    const tipo = respuesta.headers.get("content-type") ?? "image/jpeg";
    const buffer = Buffer.from(await respuesta.arrayBuffer());
    return { buffer, tipo };
  } finally {
    clearTimeout(limite);
  }
}

async function subir(url: string, folder: string): Promise<string> {
  const { buffer, tipo } = await descargar(url);
  const dataUri = `data:${tipo};base64,${buffer.toString("base64")}`;
  const resultado = await cloudinary.uploader.upload(dataUri, { folder });
  return resultado.secure_url;
}

async function main() {
  let migradas = 0;
  let fallidas = 0;

  const eventos = await prisma.evento.findMany({
    where: { imagenUrl: { not: null } },
    select: { id: true, titulo: true, imagenUrl: true },
  });
  for (const evento of eventos) {
    if (!evento.imagenUrl || yaEsCloudinary(evento.imagenUrl)) continue;
    try {
      const nuevaUrl = await subir(evento.imagenUrl, "chasquis/eventos");
      await prisma.evento.update({
        where: { id: evento.id },
        data: { imagenUrl: nuevaUrl },
      });
      console.log(`✓ Evento "${evento.titulo}": portada migrada`);
      migradas++;
    } catch (error) {
      console.error(`✗ Evento "${evento.titulo}" (portada):`, error);
      fallidas++;
    }
  }

  const premios = await prisma.premios.findMany({
    where: { efectivoUrl: { not: null } },
    select: {
      id: true,
      efectivoUrl: true,
      evento: { select: { titulo: true } },
    },
  });
  for (const item of premios) {
    if (!item.efectivoUrl || yaEsCloudinary(item.efectivoUrl)) continue;
    try {
      const nuevaUrl = await subir(item.efectivoUrl, "chasquis/premios");
      await prisma.premios.update({
        where: { id: item.id },
        data: { efectivoUrl: nuevaUrl },
      });
      console.log(
        `✓ Evento "${item.evento.titulo}": tabla de premiación migrada`
      );
      migradas++;
    } catch (error) {
      console.error(`✗ Evento "${item.evento.titulo}" (premiación):`, error);
      fallidas++;
    }
  }

  const imagenesProgramacion = await prisma.imagenProgramacion.findMany({
    select: {
      id: true,
      url: true,
      alt: true,
      recorrido: { select: { evento: { select: { titulo: true } } } },
    },
  });
  for (const imagen of imagenesProgramacion) {
    if (yaEsCloudinary(imagen.url)) continue;
    try {
      const nuevaUrl = await subir(imagen.url, "chasquis/programacion");
      await prisma.imagenProgramacion.update({
        where: { id: imagen.id },
        data: { url: nuevaUrl },
      });
      console.log(
        `✓ Evento "${imagen.recorrido.evento.titulo}": imagen de programación "${imagen.alt}" migrada`
      );
      migradas++;
    } catch (error) {
      console.error(
        `✗ Evento "${imagen.recorrido.evento.titulo}" (programación "${imagen.alt}"):`,
        error
      );
      fallidas++;
    }
  }

  console.log(`\nListo: ${migradas} imágenes migradas, ${fallidas} fallidas.`);
  if (fallidas > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
