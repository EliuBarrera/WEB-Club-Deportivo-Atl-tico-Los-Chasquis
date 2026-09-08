import { z } from "zod";

// Usado por Premios/Reglamento/Logística (Fase 6): cada una son listas
// ordenadas de texto plano ({ id, texto, orden }) que se reemplazan por
// completo en cada guardado (ver ListaTextoEditable.tsx + las Server
// Actions guardarPremios/guardarReglamento/guardarLogistica).
export const listaTextoSchema = z.array(z.string().trim().min(1).max(500)).max(50);
