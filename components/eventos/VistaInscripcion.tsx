import type { EventoPublicado } from "@/lib/eventos";
import { MiniCalendario } from "./MiniCalendario";
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
        className="w-fit font-display font-bold uppercase text-gris-oscuro hover:text-casi-negro"
      >
        &larr; Volver al listado
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <TarjetaEvento evento={evento} compacta onInscribirte={onInscribirte} />
          <MiniCalendario
            titulo={evento.titulo}
            fecha={evento.fecha}
            horario={evento.horario}
            ubicacion={evento.ubicacion}
            descripcion={evento.descripcion}
          />
        </div>

        <PanelDetalleTabs evento={evento} />
      </div>
    </div>
  );
}
