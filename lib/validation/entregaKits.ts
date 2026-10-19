import { z } from "zod";
import { MAX_ENTREGAS_POR_ENVIO } from "@/lib/kits/tipos";

// Cola de entregas que manda el celular del voluntario (Fase 13.2). Viene
// de un cliente sin cuenta (enlace con token), así que se valida todo.
export const entregasKitsSchema = z
  .array(
    z.object({
      inscripcionId: z.string().min(1).max(64),
      entregadoEn: z.iso.datetime(),
      entregadoPor: z.string().trim().min(1).max(60),
    }),
  )
  .max(MAX_ENTREGAS_POR_ENVIO);

export const inscripcionIdKitsSchema = z.string().min(1).max(64);

export const documentoKitsSchema = z.string().trim().min(3).max(30);
