import { z } from "zod";

// Categoría de un evento (Fase 6) + qué pruebas del catálogo global aplican
// a ella. `pruebasIds` aquí son ids de `PruebaCatalogo` (para armar
// `CategoriaPrueba`) — no confundir con los `key` que guarda
// `Inscripcion.pruebasIds` al momento de la inscripción.
export const categoriaSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  edad: z.string().trim().min(1).max(100),
  nacimiento: z.string().trim().min(1).max(100),
  rama: z.string().trim().min(1).max(100),
  pruebasIds: z.array(z.string().min(1)).default([]),
  // Vacío = sin grupo de tarifa (Fase 12.1).
  grupoTarifaId: z.string().optional(),
  // Carreras de calle (Fase 12.3); vacíos en festivales de pista.
  recorridoId: z.string().optional(),
  distancia: z.string().trim().max(50).optional(),
  vueltas: z.coerce.number().int().positive().max(100).optional(),
  horaSalida: z.string().trim().max(50).optional(),
  sitioSalida: z.string().trim().max(200).optional(),
  sitioLlegada: z.string().trim().max(200).optional(),
});

export type CategoriaInput = z.infer<typeof categoriaSchema>;
