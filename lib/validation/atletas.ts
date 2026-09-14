import { z } from "zod";

// Forma de la petición al endpoint de búsqueda de /atletas (Fase 10):
// mismo criterio que lib/validation/inscripcion.ts, solo valida
// tipos/formato — el match real contra Inscripcion se resuelve en el
// route handler.
export const buscarAtletaSchema = z.object({
  numeroDocumento: z.string().trim().min(1).max(30),
  email: z.email(),
  turnstileToken: z.string().min(1),
});

export type BuscarAtletaInput = z.infer<typeof buscarAtletaSchema>;
