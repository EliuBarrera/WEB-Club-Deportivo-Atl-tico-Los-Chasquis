-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "tokenEntregaKits" TEXT,
ADD COLUMN     "tokenEntregaKitsExpira" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Inscripcion" ADD COLUMN     "kitEntregadoEn" TIMESTAMP(3),
ADD COLUMN     "kitEntregadoPor" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Evento_tokenEntregaKits_key" ON "Evento"("tokenEntregaKits");
