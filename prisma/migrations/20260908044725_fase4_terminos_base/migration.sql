-- AlterTable
ALTER TABLE "Inscripcion" ADD COLUMN     "terminosAceptadosEn" TIMESTAMP(3),
ADD COLUMN     "terminosVersion" INTEGER;

-- CreateTable
CREATE TABLE "TerminosBase" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "vigenteDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TerminosBase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TerminosBase_version_key" ON "TerminosBase"("version");
