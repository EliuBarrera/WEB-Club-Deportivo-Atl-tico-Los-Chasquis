import { z } from "zod";

// Distancia de un evento (ej. "10 km"), asignable a sus categorías.
export const distanciaSchema = z.object({
  nombre: z.string().trim().min(1).max(50),
});
