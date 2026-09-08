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
  orden: z.coerce.number().int().nonnegative().default(0),
  pruebasIds: z.array(z.string().min(1)).default([]),
});

export type CategoriaInput = z.infer<typeof categoriaSchema>;
