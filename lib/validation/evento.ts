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

export const resultadosSchema = z.object({
  resultadosUrl: z.union([z.url(), z.literal("")]).optional(),
});

export const IMAGEN_TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const IMAGEN_TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB
