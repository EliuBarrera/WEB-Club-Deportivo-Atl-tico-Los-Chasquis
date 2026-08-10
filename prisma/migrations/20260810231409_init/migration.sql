-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('ABIERTO', 'CERRADO', 'BORRADOR');

-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMENINO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('RC', 'TI', 'CC', 'CE', 'PA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'DECLINADO', 'ERROR');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'EDITOR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PruebaCatalogo" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "icon" TEXT,
    "genero" "Genero",

    CONSTRAINT "PruebaCatalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT,
    "lema" TEXT,
    "precio" INTEGER NOT NULL,
    "descuento" INTEGER NOT NULL DEFAULT 0,
    "descuentoLabel" TEXT,
    "fechaLimiteDescuento" TIMESTAMP(3),
    "estado" "EstadoEvento" NOT NULL DEFAULT 'BORRADOR',
    "fecha" TIMESTAMP(3) NOT NULL,
    "horario" TEXT,
    "ubicacion" TEXT NOT NULL,
    "mapUrl" TEXT,
    "descripcion" TEXT,
    "imagenUrl" TEXT,
    "resultadosUrl" TEXT,
    "terminosUrl" TEXT,
    "cierreInscripciones" TEXT,
    "aval" TEXT,
    "organizador" TEXT,
    "lemaInstitucional" TEXT,
    "wompiProductRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "edad" TEXT NOT NULL,
    "nacimiento" TEXT NOT NULL,
    "rama" TEXT NOT NULL DEFAULT 'MASCULINA Y FEMENINA',
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaPrueba" (
    "id" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "pruebaId" TEXT NOT NULL,

    CONSTRAINT "CategoriaPrueba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recorrido" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "mapaUrl" TEXT,
    "distancia" TEXT,
    "desnivel" TEXT,
    "salida" TEXT,
    "meta" TEXT,
    "modalidad" TEXT,
    "terreno" TEXT,

    CONSTRAINT "Recorrido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagenProgramacion" (
    "id" TEXT NOT NULL,
    "recorridoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ImagenProgramacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Premios" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "efectivoUrl" TEXT,
    "ceremoniaHora" TEXT,
    "ceremoniaLugar" TEXT,

    CONSTRAINT "Premios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CondicionPremio" (
    "id" TEXT NOT NULL,
    "premiosId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CondicionPremio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reglamento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,

    CONSTRAINT "Reglamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReglaCompetencia" (
    "id" TEXT NOT NULL,
    "reglamentoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReglaCompetencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NormaSeguridad" (
    "id" TEXT NOT NULL,
    "reglamentoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NormaSeguridad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlItem" (
    "id" TEXT NOT NULL,
    "reglamentoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ControlItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logistica" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,

    CONSTRAINT "Logistica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioItem" (
    "id" TEXT NOT NULL,
    "logisticaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ServicioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecomendacionItem" (
    "id" TEXT NOT NULL,
    "logisticaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RecomendacionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitItem" (
    "id" TEXT NOT NULL,
    "logisticaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "KitItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Noticia" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Noticia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objetivo" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Objetivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConvocatoriaItem" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ConvocatoriaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Costo" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,

    CONSTRAINT "Costo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "edad" INTEGER NOT NULL,
    "genero" "Genero" NOT NULL,
    "pruebasIds" TEXT[],
    "celular" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "club" TEXT,
    "condicionesMedicas" TEXT,
    "nombresAcudiente" TEXT,
    "apellidosAcudiente" TEXT,
    "documentoAcudiente" TEXT,
    "celularAcudiente" TEXT,
    "aceptaTerminos" BOOLEAN NOT NULL DEFAULT false,
    "aceptaImagenes" BOOLEAN NOT NULL DEFAULT false,
    "totalPago" INTEGER NOT NULL,
    "estadoPago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "wompiTransactionId" TEXT,
    "wompiReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PruebaCatalogo_key_key" ON "PruebaCatalogo"("key");

-- CreateIndex
CREATE INDEX "Evento_fecha_idx" ON "Evento"("fecha");

-- CreateIndex
CREATE INDEX "Evento_estado_idx" ON "Evento"("estado");

-- CreateIndex
CREATE INDEX "Categoria_eventoId_idx" ON "Categoria"("eventoId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaPrueba_categoriaId_pruebaId_key" ON "CategoriaPrueba"("categoriaId", "pruebaId");

-- CreateIndex
CREATE UNIQUE INDEX "Recorrido_eventoId_key" ON "Recorrido"("eventoId");

-- CreateIndex
CREATE UNIQUE INDEX "Premios_eventoId_key" ON "Premios"("eventoId");

-- CreateIndex
CREATE UNIQUE INDEX "Reglamento_eventoId_key" ON "Reglamento"("eventoId");

-- CreateIndex
CREATE UNIQUE INDEX "Logistica_eventoId_key" ON "Logistica"("eventoId");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_wompiReference_key" ON "Inscripcion"("wompiReference");

-- CreateIndex
CREATE INDEX "Inscripcion_eventoId_idx" ON "Inscripcion"("eventoId");

-- CreateIndex
CREATE INDEX "Inscripcion_numeroDocumento_idx" ON "Inscripcion"("numeroDocumento");

-- CreateIndex
CREATE INDEX "Inscripcion_estadoPago_idx" ON "Inscripcion"("estadoPago");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaPrueba" ADD CONSTRAINT "CategoriaPrueba_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaPrueba" ADD CONSTRAINT "CategoriaPrueba_pruebaId_fkey" FOREIGN KEY ("pruebaId") REFERENCES "PruebaCatalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recorrido" ADD CONSTRAINT "Recorrido_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagenProgramacion" ADD CONSTRAINT "ImagenProgramacion_recorridoId_fkey" FOREIGN KEY ("recorridoId") REFERENCES "Recorrido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Premios" ADD CONSTRAINT "Premios_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicionPremio" ADD CONSTRAINT "CondicionPremio_premiosId_fkey" FOREIGN KEY ("premiosId") REFERENCES "Premios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reglamento" ADD CONSTRAINT "Reglamento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReglaCompetencia" ADD CONSTRAINT "ReglaCompetencia_reglamentoId_fkey" FOREIGN KEY ("reglamentoId") REFERENCES "Reglamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NormaSeguridad" ADD CONSTRAINT "NormaSeguridad_reglamentoId_fkey" FOREIGN KEY ("reglamentoId") REFERENCES "Reglamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlItem" ADD CONSTRAINT "ControlItem_reglamentoId_fkey" FOREIGN KEY ("reglamentoId") REFERENCES "Reglamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logistica" ADD CONSTRAINT "Logistica_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicioItem" ADD CONSTRAINT "ServicioItem_logisticaId_fkey" FOREIGN KEY ("logisticaId") REFERENCES "Logistica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecomendacionItem" ADD CONSTRAINT "RecomendacionItem_logisticaId_fkey" FOREIGN KEY ("logisticaId") REFERENCES "Logistica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitItem" ADD CONSTRAINT "KitItem_logisticaId_fkey" FOREIGN KEY ("logisticaId") REFERENCES "Logistica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Noticia" ADD CONSTRAINT "Noticia_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objetivo" ADD CONSTRAINT "Objetivo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConvocatoriaItem" ADD CONSTRAINT "ConvocatoriaItem_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Costo" ADD CONSTRAINT "Costo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
