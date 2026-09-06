import type { EventoPublicado } from "@/lib/eventos";
import { CalendarioMapaCarrusel } from "./CalendarioMapaCarrusel";
import { PanelDetalleTabs } from "./PanelDetalleTabs";
import { TarjetaEvento } from "./TarjetaEvento";

export function VistaInscripcion({
  evento,
  onVolver,
  onInscribirte,
}: {
  evento: EventoPublicado;
  onVolver: () => void;
  onInscribirte: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onVolver}
        className="inline-flex w-fit items-center gap-2 rounded-full border-[3px] border-casi-negro bg-white px-5 py-2 font-display font-bold uppercase text-casi-negro transition-colors hover:bg-casi-negro hover:text-white"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver al listado
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <TarjetaEvento evento={evento} compacta onInscribirte={onInscribirte} />
          <CalendarioMapaCarrusel
            titulo={evento.titulo}
            fecha={evento.fecha}
            horario={evento.horario}
            ubicacion={evento.ubicacion}
            descripcion={evento.descripcion}
            mapUrl={evento.mapUrl}
          />
        </div>

        <PanelDetalleTabs evento={evento} />
      </div>
    </div>
  );
}
