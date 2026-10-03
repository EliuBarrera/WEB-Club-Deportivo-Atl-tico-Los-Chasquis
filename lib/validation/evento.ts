import { z } from "zod";

// Campos base del Evento + Recorrido editables desde la pestaña
// Información/Recorrido del panel admin (Fase 6). La imagen se valida
// aparte (lib/admin/eventos.ts) porque llega como File, no como texto.
export const eventoSchema = z.object({
  titulo: z.string().trim().min(1).max(200),
  subtitulo: z.string().trim().max(200).optional(),
  fecha: z.iso.date(),
  horario: z.string().trim().max(100).optional(),
  cierreInscripciones: z.string().trim().max(100).optional(),
  ubicacion: z.string().trim().min(1).max(200),
  precio: z.coerce.number().int().nonnegative(),
  descuento: z.coerce.number().int().nonnegative().default(0),
  descuentoLabel: z.string().trim().max(200).optional(),
  estado: z.enum(["BORRADOR", "ABIERTO", "CERRADO"]),
  tipo: z.enum(["PISTA", "CALLE"]).default("PISTA"),
  descripcion: z.string().trim().max(5000).optional(),

  // Recorrido (1:1 opcional) — se upsertea junto con el evento
  distancia: z.string().trim().max(100).optional(),
  desnivel: z.string().trim().max(100).optional(),
  salida: z.string().trim().max(200).optional(),
  meta: z.string().trim().max(200).optional(),
  modalidad: z.string().trim().max(100).optional(),
  terreno: z.string().trim().max(200).optional(),

  // Contacto
  organizador: z.string().trim().max(200).optional(),
  aval: z.string().trim().max(200).optional(),
  terminosUrl: z.union([z.url(), z.literal("")]).optional(),
});

export type EventoInput = z.infer<typeof eventoSchema>;

// Edición desde el admin: el precio ya no se edita en Información, sale de
// la pestaña Precios (rondas y tarifas, Fase 12.1).
// Tampoco el recorrido: desde la Fase 12.3 un evento tiene varios y se
// editan en su propia pestaña.
export const eventoEdicionSchema = eventoSchema.omit({
  precio: true,
  descuento: true,
  descuentoLabel: true,
  distancia: true,
  desnivel: true,
  salida: true,
  meta: true,
  modalidad: true,
  terreno: true,
});

export const resultadosSchema = z.object({
  resultadosUrl: z.union([z.url(), z.literal("")]).optional(),
});

export const IMAGEN_TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const IMAGEN_TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB

// Archivo de importación de evento (Fase 11): es solo texto, así que un
// límite generoso ya cubre cualquier caso real y evita leer un archivo
// gigante por error antes de siquiera intentar parsearlo como JSON.
export const EVENTO_JSON_TAMANO_MAXIMO = 200 * 1024; // 200 KB

export type ErrorEventoJson = { campo: string; mensaje: string };

// Nombres de campo legibles, los mismos que usan las etiquetas del
// formulario en EventoEditor.tsx — para que el mensaje de un campo del
// JSON coincida con lo que el admin ve al llenarlo a mano.
const ETIQUETAS_CAMPO: Record<string, string> = {
  titulo: "Título",
  subtitulo: "Subtítulo",
  fecha: "Fecha",
  horario: "Horario",
  cierreInscripciones: "Cierre de inscripciones",
  ubicacion: "Ubicación",
  precio: "Precio",
  descuento: "Descuento",
  descuentoLabel: "Etiqueta de descuento",
  estado: "Estado",
  descripcion: "Descripción",
  distancia: "Distancia",
  desnivel: "Desnivel",
  salida: "Salida",
  meta: "Meta",
  modalidad: "Modalidad",
  terreno: "Terreno",
  organizador: "Organiza",
  aval: "Aval",
  terminosUrl: "Enlace de términos y condiciones",
};

// Traduce cada issue de Zod a un mensaje en español, campo por campo, para
// el modal de "Crear desde JSON" (ver crearEventoDesdeJson en
// app/admin/(panel)/eventos/actions.ts) — antes el admin solo veía "el
// archivo no tiene los campos esperados" y tenía que adivinar cuál era.
// Solo traduce los códigos que de hecho puede producir eventoSchema, no
// pretende cubrir cualquier schema de Zod.
export function traducirErroresEventoJson(error: z.ZodError): ErrorEventoJson[] {
  return error.issues.map((issue) => {
    const campo = issue.path.join(".") || "(raíz del JSON)";
    const etiqueta = ETIQUETAS_CAMPO[campo] ?? campo;

    let mensaje: string;
    switch (issue.code) {
      case "invalid_type":
        // Cubre tanto el campo ausente como uno con el tipo equivocado —
        // con z.coerce de por medio (precio, descuento) Zod no siempre
        // distingue "no vino" de "vino pero no se pudo convertir".
        mensaje = "Falta este campo o tiene un tipo de dato incorrecto.";
        break;
      case "too_small":
        mensaje =
          issue.origin === "number"
            ? `Debe ser mayor o igual a ${issue.minimum}.`
            : issue.minimum === 1
              ? "No puede estar vacío."
              : `Debe tener al menos ${issue.minimum} caracteres.`;
        break;
      case "too_big":
        mensaje =
          issue.origin === "number"
            ? `Debe ser menor o igual a ${issue.maximum}.`
            : `No puede superar los ${issue.maximum} caracteres.`;
        break;
      case "invalid_format":
        mensaje =
          issue.format === "date"
            ? "Formato de fecha inválido — usa AAAA-MM-DD."
            : issue.format === "url"
              ? "Debe ser una URL válida (o dejarse vacío)."
              : "Formato inválido.";
        break;
      case "invalid_value":
        mensaje = `Valor no permitido — debe ser uno de: ${issue.values.join(", ")}.`;
        break;
      default:
        mensaje = issue.message;
    }

    return { campo: etiqueta, mensaje };
  });
}
