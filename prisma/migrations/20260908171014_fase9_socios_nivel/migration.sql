-- CreateEnum
CREATE TYPE "NivelSocio" AS ENUM ('AVAL', 'SOCIO');

-- AlterTable
ALTER TABLE "Socio" ADD COLUMN     "nivel" "NivelSocio" NOT NULL DEFAULT 'SOCIO';
