import type { getInscripcionesParaExport } from "@/lib/admin/dal";

type InscripcionExport = Awaited<
  ReturnType<typeof getInscripcionesParaExport>
>[number];

const ENCABEZADOS = [
  "ID",
  "Nombres",
  "Apellidos",
  "Tipo documento",
  "Número documento",
  "Fecha nacimiento",
  "Edad",
  "Género",
  "Categoría",
  "Tipo de costo",
  "Pruebas",
  "Celular",
  "Email",
  "Ciudad",
  "Departamento",
  "Club",
  "Condiciones médicas",
  "Nombres acudiente",
  "Apellidos acudiente",
  "Documento acudiente",
  "Celular acudiente",
  "Estado de pago",
  "Total pago",
  "Fecha de inscripción",
] as const;

// Escapa un valor para una celda CSV (RFC 4180): si contiene coma, comilla
// o salto de línea, se envuelve en comillas dobles y se escapan las
// comillas internas duplicándolas.
function escaparCelda(valor: string): string {
  if (/[",\n]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

function filaDe(inscripcion: InscripcionExport): string {
  const valores = [
    inscripcion.id,
    inscripcion.nombres,
    inscripcion.apellidos,
    inscripcion.tipoDocumento,
    inscripcion.numeroDocumento,
    inscripcion.fechaNacimiento.toISOString().slice(0, 10),
    String(inscripcion.edad),
    inscripcion.genero,
    inscripcion.categoria?.nombre ?? "",
    inscripcion.costo?.tipo ?? "",
    inscripcion.pruebasIds.join(" / "),
    inscripcion.celular,
    inscripcion.email,
    inscripcion.ciudad,
    inscripcion.departamento,
    inscripcion.club ?? "",
    inscripcion.condicionesMedicas ?? "",
    inscripcion.nombresAcudiente ?? "",
    inscripcion.apellidosAcudiente ?? "",
    inscripcion.documentoAcudiente ?? "",
    inscripcion.celularAcudiente ?? "",
    inscripcion.estadoPago,
    String(inscripcion.totalPago),
    inscripcion.createdAt.toISOString(),
  ];
  return valores.map(escaparCelda).join(",");
}

export function construirCsvInscripciones(
  inscripciones: InscripcionExport[]
): string {
  const filas = [ENCABEZADOS.join(","), ...inscripciones.map(filaDe)];
  // BOM UTF-8 al inicio para que Excel abra tildes/ñ correctamente.
  return "﻿" + filas.join("\n");
}
