-- CreateEnum
CREATE TYPE "CanalEnvioMasivo" AS ENUM ('WHATSAPP', 'EMAIL');

-- CreateTable
CREATE TABLE "EnvioMasivo" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "canal" "CanalEnvioMasivo" NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "totalDestinatarios" INTEGER NOT NULL,
    "totalExitosos" INTEGER NOT NULL,
    "totalFallidos" INTEGER NOT NULL,
    "erroresMuestra" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnvioMasivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnvioMasivo_eventoId_idx" ON "EnvioMasivo"("eventoId");

-- AddForeignKey
ALTER TABLE "EnvioMasivo" ADD CONSTRAINT "EnvioMasivo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvioMasivo" ADD CONSTRAINT "EnvioMasivo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
