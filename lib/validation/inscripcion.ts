import { z } from "zod";

// Forma de la petición al endpoint de inscripción (Fase 4). Solo valida
// tipos y formato — la elegibilidad real (¿existe la categoría/prueba/
// costo en ESTE evento?, ¿el evento admite inscripciones?, ¿hace falta
// acudiente?) se resuelve en el route handler contra la base de datos,
// porque depende de datos que Zod no conoce por sí solo.
export const inscripcionSchema = z
  .object({
    eventoId: z.string().min(1),
    turnstileToken: z.string().min(1),

    // Atleta
    nombres: z.string().trim().min(1).max(100),
    apellidos: z.string().trim().min(1).max(100),
    tipoDocumento: z.enum(["RC", "TI", "CC", "CE", "PA"]),
    numeroDocumento: z.string().trim().min(1).max(30),
    fechaNacimiento: z.iso.date(),
    genero: z.enum(["MASCULINO", "FEMENINO"]),

    // Categoría/pruebas o costo (uno de los dos según el evento)
    categoriaId: z.string().min(1).optional(),
    pruebasIds: z.array(z.string().min(1)).max(2).default([]),
    costoId: z.string().min(1).optional(),

    // Contacto
    celular: z.string().trim().min(7).max(20),
    email: z.email(),
    ciudad: z.string().trim().min(1).max(100),
    departamento: z.string().trim().min(1).max(100),
    club: z.string().trim().max(100).optional(),

    // Adicional
    condicionesMedicas: z.string().trim().max(1000).optional(),

    // Acudiente (obligatorio solo si el atleta es menor de edad,
    // verificado en el route handler)
    nombresAcudiente: z.string().trim().max(100).optional(),
    apellidosAcudiente: z.string().trim().max(100).optional(),
    documentoAcudiente: z.string().trim().max(30).optional(),
    celularAcudiente: z.string().trim().max(20).optional(),

    // Legal
    aceptaTerminos: z.literal(true),
    aceptaImagenes: z.boolean().default(false),
  })
  .refine((datos) => Boolean(datos.categoriaId) || Boolean(datos.costoId), {
    message: "Debe indicar una categoría o un tipo de costo",
    path: ["categoriaId"],
  });

export type InscripcionInput = z.infer<typeof inscripcionSchema>;
