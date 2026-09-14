import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { formatFechaBadge } from "@/lib/format";

// Certificado de inscripción en PDF (Fase 10, backlog). Diseño elegido por
// el club entre 3 propuestas presentadas como mockups: "A" (el certificado
// como dorsal de competencia — número grande, imperdibles en las esquinas,
// borde perforado) combinada con el sello circular de la propuesta "B"
// (acta de meta). Se genera al vuelo con pdf-lib (sin dependencias
// nativas, corre bien en funciones serverless) — no se guarda ningún
// archivo, cada descarga arma el PDF desde los datos actuales de la
// Inscripcion. Dice "se encuentra inscrito/a" (no "participó"), porque
// este sistema no registra asistencia real al evento — solo inscripción y
// pago aprobado, que es lo único que sí se puede verificar (mismo criterio
// de "no inventar" del resto del proyecto).

const NARANJA = rgb(0xf1 / 255, 0x58 / 255, 0x08 / 255);
const CASI_NEGRO = rgb(0x1c / 255, 0x0d / 255, 0x0a / 255);
const CREMA = rgb(0xf7 / 255, 0xf4 / 255, 0xef / 255);
const GRIS_CLARO = rgb(0xcd / 255, 0xbf / 255, 0xb8 / 255);

const ANCHO = 842; // A4 horizontal, puntos
const ALTO = 595;
const MARGEN = 42;

function centrarTexto(
  page: PDFPage,
  texto: string,
  y: number,
  font: PDFFont,
  size: number,
  color = CREMA
) {
  const ancho = font.widthOfTextAtSize(texto, size);
  page.drawText(texto, { x: (ANCHO - ancho) / 2, y, size, font, color });
}

// Simula tracking (letter-spacing) insertando espacios entre caracteres —
// pdf-lib no soporta letter-spacing nativo. Solo para etiquetas cortas en
// mayúsculas, nunca para oraciones largas.
function trackear(texto: string): string {
  return texto.split("").join(" ");
}

// Envuelve `texto` en líneas que no superen `anchoMax` puntos.
function envolverTexto(
  texto: string,
  font: PDFFont,
  size: number,
  anchoMax: number
): string[] {
  const palabras = texto.split(" ");
  const lineas: string[] = [];
  let actual = "";
  for (const palabra of palabras) {
    const candidata = actual ? `${actual} ${palabra}` : palabra;
    if (font.widthOfTextAtSize(candidata, size) > anchoMax && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = candidata;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

// Centra `texto` rotado `anguloGrados` alrededor del punto (cx, cy). El
// anclaje de drawText es el punto donde pivota la rotación (no el centro
// visual del texto), así que hay que resolver la posición del ancla para
// que, una vez rotado, el centro del texto caiga exactamente en (cx, cy).
function centrarTextoRotado(
  page: PDFPage,
  texto: string,
  cx: number,
  cy: number,
  font: PDFFont,
  size: number,
  anguloGrados: number,
  color = NARANJA
) {
  const ancho = font.widthOfTextAtSize(texto, size);
  const dx = ancho / 2;
  const dy = size * 0.32; // aprox. la mitad de la altura visual del glifo
  const theta = (anguloGrados * Math.PI) / 180;
  const rx = dx * Math.cos(theta) - dy * Math.sin(theta);
  const ry = dx * Math.sin(theta) + dy * Math.cos(theta);
  page.drawText(texto, {
    x: cx - rx,
    y: cy - ry,
    size,
    font,
    color,
    rotate: degrees(anguloGrados),
  });
}

// Ojal de dorsal (el hueco por donde pasa el imperdible), no el
// imperdible en sí — una cruz dentro del círculo se lee como un ícono de
// "prohibido", así que se deja como un simple círculo hueco.
function dibujarOjal(page: PDFPage, x: number, y: number) {
  page.drawCircle({
    x,
    y,
    size: 5,
    borderColor: CREMA,
    borderWidth: 1,
    borderOpacity: 0.4,
  });
}

// Hash corto y determinista del id de la inscripción, para mostrar un
// "número de dorsal" decorativo consistente — nunca aleatorio, siempre el
// mismo para la misma inscripción. La referencia real (el id completo)
// sigue impresa abajo para trazabilidad; esto es solo el elemento visual
// grande, no un identificador nuevo que el proyecto empiece a inventar.
function numeroDesdeId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return String(hash % 100000).padStart(5, "0");
}

export async function generarCertificadoPdf(datos: {
  nombres: string;
  apellidos: string;
  eventoTitulo: string;
  eventoFecha: Date;
  categoria: string | null;
  inscripcionId: string;
}): Promise<Uint8Array> {
  const documento = await PDFDocument.create();
  const page = documento.addPage([ANCHO, ALTO]);

  const bold = await documento.embedFont(StandardFonts.HelveticaBold);
  const mono = await documento.embedFont(StandardFonts.Courier);
  const monoBold = await documento.embedFont(StandardFonts.CourierBold);

  // Fondo: banner institucional del club (silueta de corredor a modo de
  // marca de agua), a modo "cover" — se escala por altura y se recorta el
  // ancho sobrante por los lados para llenar la página sin deformarlo.
  try {
    const bannerBytes = await readFile(
      path.join(process.cwd(), "public", "Banner-01.jpg")
    );
    const bannerImg = await documento.embedJpg(bannerBytes);
    const escala = ALTO / bannerImg.height;
    const bannerAncho = bannerImg.width * escala;
    page.drawImage(bannerImg, {
      x: (ANCHO - bannerAncho) / 2,
      y: 0,
      width: bannerAncho,
      height: ALTO,
    });
  } catch (error) {
    console.error("No se pudo incrustar el banner de fondo:", error);
    page.drawRectangle({ x: 0, y: 0, width: ANCHO, height: ALTO, color: CASI_NEGRO });
  }

  // Borde perforado arriba, como si la hoja se pudiera separar de un
  // talonario mayor — mismo detalle de la propuesta "Dorsal".
  page.drawLine({
    start: { x: MARGEN, y: ALTO - 30 },
    end: { x: ANCHO - MARGEN, y: ALTO - 30 },
    thickness: 1.2,
    color: CREMA,
    opacity: 0.3,
    dashArray: [4, 4],
  });

  // Ojales en las cuatro esquinas, como los de un dorsal real.
  dibujarOjal(page, 30, ALTO - 34);
  dibujarOjal(page, ANCHO - 30, ALTO - 34);
  dibujarOjal(page, 30, 34);
  dibujarOjal(page, ANCHO - 30, 34);

  // Logo del club — versión en texto claro (cropped-cropped-Logo-png.png),
  // pensada de fábrica para fondos oscuros (mismo archivo que ya usa
  // public/admin-banner.jpg en el panel admin) y con fondo transparente,
  // así que va directo sobre el banner sin necesitar una placa blanca
  // detrás (a diferencia de LogoClub.png, que trae fondo blanco sólido).
  try {
    const logoBytes = await readFile(
      path.join(process.cwd(), "public", "cropped-cropped-Logo-png.png")
    );
    const logoImg = await documento.embedPng(logoBytes);
    const logoAlto = 34;
    const logoAncho = (logoImg.width / logoImg.height) * logoAlto;
    page.drawImage(logoImg, {
      x: 52,
      y: ALTO - 118,
      width: logoAncho,
      height: logoAlto,
    });
  } catch (error) {
    console.error("No se pudo incrustar el logo en el certificado:", error);
  }

  // Bloque central: "N.° de inscripción" + número grande + nombre.
  const centroY = 430;
  centrarTexto(page, trackear("N.° DE INSCRIPCIÓN"), centroY, mono, 10, NARANJA);
  centrarTexto(
    page,
    numeroDesdeId(datos.inscripcionId),
    centroY - 78,
    bold,
    76,
    CREMA
  );

  const nombreCompleto = `${datos.nombres} ${datos.apellidos}`.toUpperCase();
  centrarTexto(page, nombreCompleto, centroY - 118, bold, 24, CREMA);

  page.drawRectangle({
    x: ANCHO / 2 - 45,
    y: centroY - 136,
    width: 90,
    height: 2.5,
    color: NARANJA,
  });

  // Franja inferior: EVENTO / CATEGORÍA / FECHA, como el pie de un dorsal.
  const columnas = [
    { etiqueta: "EVENTO", valor: datos.eventoTitulo },
    { etiqueta: "CATEGORÍA", valor: datos.categoria ?? "—" },
    { etiqueta: "FECHA", valor: formatFechaBadge(datos.eventoFecha) },
  ];
  const anchoColumna = 230;
  const separacion = 24;
  const anchoGrupo = columnas.length * anchoColumna + (columnas.length - 1) * separacion;
  const inicioX = (ANCHO - anchoGrupo) / 2;
  const filaY = 225;

  columnas.forEach((columna, indice) => {
    const x = inicioX + indice * (anchoColumna + separacion);
    const centroColumna = x + anchoColumna / 2;
    const etiqueta = trackear(columna.etiqueta);
    const anchoEtiqueta = mono.widthOfTextAtSize(etiqueta, 8.5);
    page.drawText(etiqueta, {
      x: centroColumna - anchoEtiqueta / 2,
      y: filaY,
      size: 8.5,
      font: mono,
      color: GRIS_CLARO,
    });

    const lineas = envolverTexto(columna.valor, bold, 12.5, anchoColumna);
    lineas.slice(0, 2).forEach((linea, i) => {
      const anchoLinea = bold.widthOfTextAtSize(linea, 12.5);
      page.drawText(linea, {
        x: centroColumna - anchoLinea / 2,
        y: filaY - 18 - i * 16,
        size: 12.5,
        font: bold,
        color: CREMA,
      });
    });
  });

  // Sello circular "LC" (propuesta "Acta de meta"), abajo a la derecha —
  // no en la esquina misma, para no chocar con la marca de imperdible.
  const selloX = ANCHO - 105;
  const selloY = 98;
  page.drawCircle({
    x: selloX,
    y: selloY,
    size: 34,
    borderColor: NARANJA,
    borderWidth: 2,
  });
  page.drawCircle({
    x: selloX,
    y: selloY,
    size: 29,
    borderColor: NARANJA,
    borderWidth: 0.75,
    borderOpacity: 0.5,
  });
  centrarTextoRotado(page, "LC", selloX, selloY, bold, 22, 8, NARANJA);

  // Referencia completa + fecha de generación, abajo a la izquierda —
  // trazabilidad real, no reemplaza el número decorativo de arriba.
  page.drawText(`REF. ${datos.inscripcionId}`, {
    x: MARGEN,
    y: 46,
    size: 8,
    font: monoBold,
    color: GRIS_CLARO,
  });
  page.drawText(`GENERADO EL ${formatFechaBadge(new Date()).toUpperCase()}`, {
    x: MARGEN,
    y: 34,
    size: 8,
    font: mono,
    color: GRIS_CLARO,
  });

  return documento.save();
}
