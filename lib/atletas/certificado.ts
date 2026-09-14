import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatFechaBadge } from "@/lib/format";

// Certificado de inscripción en PDF (Fase 10, backlog). Se genera al vuelo
// en el servidor con pdf-lib (sin dependencias nativas, corre bien en
// funciones serverless) — no se guarda ningún archivo, cada descarga arma
// el PDF desde los datos actuales de la Inscripcion. Dice "certifica que
// [atleta] está inscrito/a" (no "participó"), porque este sistema no
// registra asistencia real al evento — solo inscripción y pago aprobado,
// que es lo único que sí se puede verificar (mismo criterio de "no
// inventar" del resto del proyecto).

const NARANJA = rgb(0xf1 / 255, 0x58 / 255, 0x08 / 255);
const CASI_NEGRO = rgb(0x1c / 255, 0x0d / 255, 0x0a / 255);
const GRIS = rgb(0x55 / 255, 0x4a / 255, 0x47 / 255);

function centrarTexto(
  page: PDFPage,
  texto: string,
  y: number,
  font: PDFFont,
  size: number,
  color = CASI_NEGRO
) {
  const ancho = font.widthOfTextAtSize(texto, size);
  page.drawText(texto, {
    x: (page.getWidth() - ancho) / 2,
    y,
    size,
    font,
    color,
  });
}

// Envuelve `texto` en líneas que no superen `anchoMax` puntos, para no
// depender de que el contenido (nombre de evento, categoría) sea corto.
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

export async function generarCertificadoPdf(datos: {
  nombres: string;
  apellidos: string;
  eventoTitulo: string;
  eventoFecha: Date;
  categoria: string | null;
  inscripcionId: string;
}): Promise<Uint8Array> {
  const documento = await PDFDocument.create();
  const page = documento.addPage([842, 595]); // A4 horizontal
  const { width, height } = page.getSize();

  const fontBold = await documento.embedFont(StandardFonts.HelveticaBold);
  const font = await documento.embedFont(StandardFonts.Helvetica);

  // Marco decorativo
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: NARANJA,
    borderWidth: 3,
  });
  page.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: CASI_NEGRO,
    borderWidth: 1,
  });

  // Logo del club, centrado arriba — si por algún motivo no se puede leer
  // el archivo, el certificado se sigue generando sin logo en vez de
  // fallar por completo.
  let yDespuesDeLogo = height - 90;
  try {
    const logoBytes = await readFile(
      path.join(process.cwd(), "public", "LogoClub.png")
    );
    const logoImg = await documento.embedPng(logoBytes);
    const escala = 150 / logoImg.width;
    const logoAncho = logoImg.width * escala;
    const logoAlto = logoImg.height * escala;
    page.drawImage(logoImg, {
      x: (width - logoAncho) / 2,
      y: height - 60 - logoAlto,
      width: logoAncho,
      height: logoAlto,
    });
    yDespuesDeLogo = height - 60 - logoAlto - 40;
  } catch (error) {
    console.error("No se pudo incrustar el logo en el certificado:", error);
  }

  centrarTexto(
    page,
    "CERTIFICADO DE INSCRIPCIÓN",
    yDespuesDeLogo,
    fontBold,
    26,
    NARANJA
  );

  const nombreCompleto = `${datos.nombres} ${datos.apellidos}`.toUpperCase();
  centrarTexto(page, nombreCompleto, yDespuesDeLogo - 55, fontBold, 22);

  const anchoParrafo = width - 200;
  const categoriaTexto = datos.categoria ? `, en la categoría ${datos.categoria},` : "";
  const parrafo =
    `El Club Deportivo Atlético Los Chasquis certifica que la persona arriba ` +
    `nombrada se encuentra inscrita${categoriaTexto} en el evento ` +
    `"${datos.eventoTitulo}", a realizarse el ${formatFechaBadge(datos.eventoFecha)}.`;

  const lineas = envolverTexto(parrafo, font, 14, anchoParrafo);
  let y = yDespuesDeLogo - 100;
  for (const linea of lineas) {
    centrarTexto(page, linea, y, font, 14, GRIS);
    y -= 22;
  }

  centrarTexto(
    page,
    `Referencia de inscripción: ${datos.inscripcionId}`,
    64,
    font,
    9,
    GRIS
  );
  centrarTexto(
    page,
    `Generado el ${formatFechaBadge(new Date())}`,
    50,
    font,
    9,
    GRIS
  );

  return documento.save();
}
