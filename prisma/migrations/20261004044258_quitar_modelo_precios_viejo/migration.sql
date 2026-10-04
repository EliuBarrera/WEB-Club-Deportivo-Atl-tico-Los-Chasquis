-- Fase 12.1: quita el modelo viejo de precios (precio/descuento/Costo).
-- Requiere que los precios ya se hayan pasado a rondas y tarifas — en la
-- rama de Neon que quedó como producción eso ya se hizo (con el script
-- migrar-precios-rondas.ts, borrado en este mismo cambio). No aplicar
-- sobre una base que todavía no tenga rondas: se pierden los precios.

-- DropForeignKey
ALTER TABLE "Costo" DROP CONSTRAINT "Costo_eventoId_fkey";

-- DropForeignKey
ALTER TABLE "Inscripcion" DROP CONSTRAINT "Inscripcion_costoId_fkey";

-- AlterTable
ALTER TABLE "Evento" DROP COLUMN "descuento",
DROP COLUMN "descuentoLabel",
DROP COLUMN "fechaLimiteDescuento",
DROP COLUMN "precio";

-- AlterTable
ALTER TABLE "Inscripcion" DROP COLUMN "costoId";

-- DropTable
DROP TABLE "Costo";

