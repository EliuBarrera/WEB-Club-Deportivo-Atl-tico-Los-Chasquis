import { z } from "zod";

// Recorrido de un evento (Fase 12.3). El croquis (mapaUrl) llega como
// archivo y se valida aparte, igual que la portada del evento.
export const recorridoSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  orden: z.coerce.number().int().nonnegative().default(0),
  distancia: z.string().trim().max(100).optional(),
  desnivel: z.string().trim().max(100).optional(),
  salida: z.string().trim().max(200).optional(),
  meta: z.string().trim().max(200).optional(),
  modalidad: z.string().trim().max(100).optional(),
  terreno: z.string().trim().max(200).optional(),
});

export type RecorridoInput = z.infer<typeof recorridoSchema>;
