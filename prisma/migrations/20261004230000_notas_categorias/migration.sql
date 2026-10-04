-- Fase 12.6: notas que aplican a las categorías del evento (modal de T&C)
ALTER TABLE "Evento" ADD COLUMN     "notasCategorias" TEXT[] DEFAULT ARRAY[]::TEXT[];
