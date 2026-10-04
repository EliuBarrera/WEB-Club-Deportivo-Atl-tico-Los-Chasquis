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

// Paso previo del formulario de inscripción: con numeroDocumento+email se
// buscan los datos de la última inscripción del atleta para autorrellenar.
// Sin Turnstile a propósito: el token es de un solo uso y se necesita
// después para enviar la inscripción; la protección acá es el rate limit
// y exigir que ambos datos coincidan.
export const prellenarAtletaSchema = z.object({
  numeroDocumento: z.string().trim().min(1).max(30),
  email: z.email(),
  eventoId: z.string().min(1),
});

export type PrellenarAtletaInput = z.infer<typeof prellenarAtletaSchema>;
