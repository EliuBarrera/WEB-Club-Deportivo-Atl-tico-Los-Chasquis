-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('PISTA', 'CALLE');

-- DropIndex
DROP INDEX "Recorrido_eventoId_key";

-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "distancia" TEXT,
ADD COLUMN     "horaSalida" TEXT,
ADD COLUMN     "recorridoId" TEXT,
ADD COLUMN     "sitioLlegada" TEXT,
ADD COLUMN     "sitioSalida" TEXT,
ADD COLUMN     "vueltas" INTEGER;

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "tipo" "TipoEvento" NOT NULL DEFAULT 'PISTA';

-- AlterTable
ALTER TABLE "Recorrido" ADD COLUMN     "nombre" TEXT,
ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Recorrido_eventoId_idx" ON "Recorrido"("eventoId");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_recorridoId_fkey" FOREIGN KEY ("recorridoId") REFERENCES "Recorrido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
