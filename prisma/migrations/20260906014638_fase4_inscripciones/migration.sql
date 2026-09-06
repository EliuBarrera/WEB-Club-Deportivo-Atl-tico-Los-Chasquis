-- DropForeignKey
ALTER TABLE "Inscripcion" DROP CONSTRAINT "Inscripcion_categoriaId_fkey";

-- AlterTable
ALTER TABLE "Inscripcion" ADD COLUMN     "costoId" TEXT,
ALTER COLUMN "categoriaId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "IntentoInscripcion" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntentoInscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntentoInscripcion_ip_createdAt_idx" ON "IntentoInscripcion"("ip", "createdAt");

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_costoId_fkey" FOREIGN KEY ("costoId") REFERENCES "Costo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
