-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "tallasCamiseta" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Inscripcion" ADD COLUMN     "dorsal" INTEGER,
ADD COLUMN     "tallaCamiseta" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_eventoId_dorsal_key" ON "Inscripcion"("eventoId", "dorsal");
