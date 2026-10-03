-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "grupoTarifaId" TEXT;

-- AlterTable
ALTER TABLE "Inscripcion" ADD COLUMN     "rondaId" TEXT;

-- CreateTable
CREATE TABLE "RondaInscripcion" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaCierre" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RondaInscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoTarifa" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "derechos" TEXT[],
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GrupoTarifa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarifaInscripcion" (
    "id" TEXT NOT NULL,
    "rondaId" TEXT NOT NULL,
    "grupoTarifaId" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,

    CONSTRAINT "TarifaInscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RondaInscripcion_eventoId_orden_key" ON "RondaInscripcion"("eventoId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "GrupoTarifa_eventoId_nombre_key" ON "GrupoTarifa"("eventoId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "TarifaInscripcion_rondaId_grupoTarifaId_key" ON "TarifaInscripcion"("rondaId", "grupoTarifaId");

-- CreateIndex
CREATE INDEX "Categoria_grupoTarifaId_idx" ON "Categoria"("grupoTarifaId");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_grupoTarifaId_fkey" FOREIGN KEY ("grupoTarifaId") REFERENCES "GrupoTarifa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RondaInscripcion" ADD CONSTRAINT "RondaInscripcion_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoTarifa" ADD CONSTRAINT "GrupoTarifa_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarifaInscripcion" ADD CONSTRAINT "TarifaInscripcion_rondaId_fkey" FOREIGN KEY ("rondaId") REFERENCES "RondaInscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarifaInscripcion" ADD CONSTRAINT "TarifaInscripcion_grupoTarifaId_fkey" FOREIGN KEY ("grupoTarifaId") REFERENCES "GrupoTarifa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_rondaId_fkey" FOREIGN KEY ("rondaId") REFERENCES "RondaInscripcion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
