import Image from "next/image";
import type { EventoPublicado } from "@/lib/eventos";
import { formatFechaBadge, formatPrecio, rangoCategorias } from "@/lib/format";

export function TarjetaEvento({
  evento,
  compacta = false,
  mostrarLema = true,
  onInscribirte,
}: {
  evento: EventoPublicado;
  compacta?: boolean;
  mostrarLema?: boolean;
  onInscribirte?: () => void;
}) {
  const cerrado = evento.estado === "CERRADO";
  const badgeCategoria = rangoCategorias(evento.categorias);
  const tieneDescuento = evento.descuento > 0;
  const precioFinal = evento.precio - evento.descuento;

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-casi-negro/10 bg-white shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
      <div className="relative aspect-[16/10] w-full bg-gris-oscuro">
        {evento.imagenUrl ? (
          <Image
            src={evento.imagenUrl}
            alt={evento.titulo}
            fill
            sizes="(min-width: 1024px) 380px, 90vw"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="inline-flex w-fit items-center rounded-full bg-naranja px-4 py-1 font-display text-base font-bold text-crema">
          {formatFechaBadge(evento.fecha)}
        </span>

        <h3 className="font-display text-2xl font-extrabold uppercase leading-tight tracking-tight">
          {evento.titulo}
        </h3>

        {mostrarLema && evento.lema ? (
          <p className="font-mono text-base italic text-naranja">
            &quot;{evento.lema}&quot;
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <p className="flex items-center gap-1 text-lg text-gris-oscuro">
            <span aria-hidden>📍</span>
            {evento.ubicacion}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {tieneDescuento ? (
              <span className="flex items-baseline gap-2">
                <span className="font-display text-xl font-bold text-gris-oscuro line-through">
                  {formatPrecio(evento.precio)}
                </span>
                <span className="font-display text-3xl font-extrabold">
                  {formatPrecio(precioFinal)}
                </span>
              </span>
            ) : (
              <span className="font-display text-3xl font-extrabold">
                {formatPrecio(evento.precio)}
              </span>
            )}
            {badgeCategoria ? (
              <span className="rounded-full bg-casi-negro/10 px-3 py-1 text-base font-semibold">
                {badgeCategoria}
              </span>
            ) : null}
          </div>

          {tieneDescuento && evento.descuentoLabel ? (
            <p className="text-base font-semibold text-naranja">
              {evento.descuentoLabel}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={cerrado}
              onClick={onInscribirte}
              className={
                compacta
                  ? "rounded-full bg-naranja px-6 py-2 font-display text-lg font-bold text-crema disabled:cursor-not-allowed disabled:bg-gris-oscuro"
                  : "w-full rounded-full bg-naranja py-3 font-display text-xl font-bold uppercase tracking-wide text-crema disabled:cursor-not-allowed disabled:bg-gris-oscuro"
              }
            >
              {cerrado ? "Inscripciones cerradas" : "Inscríbete aquí"}
            </button>

            {cerrado && evento.resultadosUrl ? (
              <a
                href={evento.resultadosUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-full bg-gris-oscuro py-3 text-center font-display text-xl font-bold uppercase tracking-wide text-crema"
              >
                Ver resultados
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
