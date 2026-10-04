-- La distancia de la categoría deja de ser texto libre y pasa a elegirse
-- de las distancias del evento. La columna anterior no tenía datos.
ALTER TABLE "Categoria" DROP COLUMN "distancia",
ADD COLUMN     "distanciaId" TEXT;

-- CreateTable
CREATE TABLE "Distancia" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Distancia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Categoria_distanciaId_idx" ON "Categoria"("distanciaId");

-- CreateIndex
CREATE UNIQUE INDEX "Distancia_eventoId_nombre_key" ON "Distancia"("eventoId", "nombre");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_distanciaId_fkey" FOREIGN KEY ("distanciaId") REFERENCES "Distancia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distancia" ADD CONSTRAINT "Distancia_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
