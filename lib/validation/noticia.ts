import { z } from "zod";

export const noticiaSchema = z.object({
  titulo: z.string().trim().min(1).max(200),
  fecha: z.string().trim().min(1).max(100),
  contenido: z.string().trim().min(1).max(5000),
  orden: z.coerce.number().int().nonnegative().default(0),
});

export type NoticiaInput = z.infer<typeof noticiaSchema>;
