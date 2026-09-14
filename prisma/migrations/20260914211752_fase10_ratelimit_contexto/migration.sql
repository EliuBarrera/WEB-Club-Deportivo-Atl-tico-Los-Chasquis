-- DropIndex
DROP INDEX "IntentoInscripcion_ip_createdAt_idx";

-- AlterTable
ALTER TABLE "IntentoInscripcion" ADD COLUMN     "contexto" TEXT NOT NULL DEFAULT 'inscripcion';

-- CreateIndex
CREATE INDEX "IntentoInscripcion_ip_contexto_createdAt_idx" ON "IntentoInscripcion"("ip", "contexto", "createdAt");
