-- CreateTable
CREATE TABLE "CifraConfianza" (
    "id" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CifraConfianza_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CifraConfianza_etiqueta_key" ON "CifraConfianza"("etiqueta");
