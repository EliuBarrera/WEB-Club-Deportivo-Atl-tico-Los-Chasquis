import { z } from "zod";

export const socioSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  logoUrl: z.string().trim().min(1).max(500),
  orden: z.coerce.number().int().nonnegative().default(0),
});

export type SocioInput = z.infer<typeof socioSchema>;
