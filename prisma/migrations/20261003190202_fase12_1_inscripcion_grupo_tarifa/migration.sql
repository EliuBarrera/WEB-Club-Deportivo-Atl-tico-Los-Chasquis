-- AlterTable
ALTER TABLE "Inscripcion" ADD COLUMN     "grupoTarifaId" TEXT;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_grupoTarifaId_fkey" FOREIGN KEY ("grupoTarifaId") REFERENCES "GrupoTarifa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
