import { z } from "zod";

export const documentoLegalSchema = z.object({
  nombre: z.string().trim().min(1).max(200),
  url: z.string().trim().url().max(500),
  orden: z.coerce.number().int().nonnegative().default(0),
});

export type DocumentoLegalInput = z.infer<typeof documentoLegalSchema>;
