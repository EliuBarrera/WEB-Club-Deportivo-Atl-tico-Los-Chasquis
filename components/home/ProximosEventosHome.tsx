"use client";

import { useRouter } from "next/navigation";
import type { EventoPublicado } from "@/lib/eventos";
import { CarruselEventos } from "@/components/eventos/CarruselEventos";

// Reutiliza tal cual el carrusel de la Fase 2 (Fase 9, sección "Próximos
// eventos" — no duplicar componente). La única diferencia con /eventos es
// que aquí "Inscríbete aquí" no cambia un estado local: navega a
// /eventos?evento=<id>, que abre esa misma inscripción en la página del
// calendario (ver EventosExplorer.tsx).
export function ProximosEventosHome({
  eventos,
}: {
  eventos: EventoPublicado[];
}) {
  const router = useRouter();

  return (
    <CarruselEventos
      eventos={eventos}
      onInscribirte={(eventoId) => router.push(`/eventos?evento=${eventoId}`)}
    />
  );
}
