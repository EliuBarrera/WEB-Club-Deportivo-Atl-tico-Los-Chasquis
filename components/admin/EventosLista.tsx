"use client";

import Link from "next/link";
import Image from "next/image";
import type { EventoAdmin } from "@/lib/admin/dal";
import { cloudinaryThumb } from "@/lib/cloudinaryThumb";
import { formatFechaBadge } from "@/lib/format";
import { EliminarEventoButton } from "@/components/admin/EliminarEventoButton";
import { EnviarResumenBoton } from "@/components/admin/EnviarResumenBoton";
import {
  LoaderTransicion,
  useLoaderTransicion,
} from "@/components/LoaderTransicion";

const ESTADO_ETIQUETA: Record<string, string> = {
  BORRADOR: "Borrador",
  ABIERTO: "Abierto",
  CERRADO: "Cerrado",
};

// Lista de eventos del panel admin (Fase 11): antes vivía inline en
// page.tsx (Server Component) — se extrajo a un Client Component para
// poder mostrar LoaderTransicion mientras se selecciona/crea/elimina un
// evento (el cambio de `eventoId` no cambia de pathname, así que el hook
// se activa con ese valor en vez de con usePathname()). El evento
// seleccionado ya no cambia de color: se distingue con una sombra
// naranja (ver claseCardActiva), y al seleccionarlo revela una segunda
// fila con los botones de difusión (WhatsApp/Correo, solo ADMIN) y el
// botón de eliminar, que se mueve ahí desde la fila superior.
export function EventosLista({
  eventos,
  eventoIdActivo,
  esAdmin,
  totalAtletas,
  crearEventoAction,
  crearEventoDesdeJsonAction,
  eliminarEventoAction,
  enviarResumenAction,
}: {
  eventos: EventoAdmin[];
  eventoIdActivo?: string;
  esAdmin: boolean;
  totalAtletas: number;
  crearEventoAction: () => Promise<void>;
  crearEventoDesdeJsonAction: (formData: FormData) => Promise<void>;
  eliminarEventoAction: (eventoId: string) => Promise<void>;
  enviarResumenAction: (
    eventoId: string,
    canal: "WHATSAPP" | "EMAIL",
  ) => Promise<void>;
}) {
  const { navegando, irA } = useLoaderTransicion(eventoIdActivo ?? "");

  function mostrarLoader() {
    irA(`cargando-${Date.now()}`);
  }

  return (
    <>
      <LoaderTransicion activo={navegando} />
      <div className="flex flex-col gap-2.5">
        {eventos.map((item) => {
          const activo = item.id === eventoIdActivo;

          const fila = (
            <Link
              href={`/admin/eventos?eventoId=${item.id}`}
              onClick={mostrarLoader}
              className="flex flex-1 items-center gap-2.5 overflow-hidden"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-casi-negro/[0.06]">
                {item.imagenUrl ? (
                  <Image
                    src={cloudinaryThumb(item.imagenUrl, "c_fill,w_96,h_96")}
                    alt=""
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1c0d0a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-casi-negro">
                <span className="truncate font-display text-[15px] font-extrabold uppercase">
                  {item.titulo}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gris-oscuro">
                  {formatFechaBadge(item.fecha)} ·{" "}
                  {ESTADO_ETIQUETA[item.estado]}
                </span>
              </div>
            </Link>
          );

          if (!activo) {
            return (
              <div
                key={item.id}
                className="flex items-center gap-2.5 rounded-2xl bg-white p-3 shadow-[0_6px_16px_rgba(28,13,10,0.08)]"
              >
                {fila}
                <EliminarEventoButton
                  eventoId={item.id}
                  eventoTitulo={item.titulo}
                  eliminarEventoAction={async (id) => {
                    mostrarLoader();
                    await eliminarEventoAction(id);
                  }}
                  claseBoton="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-casi-negro/[0.06] text-casi-negro"
                />
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-[28px] bg-[#d9d9d9]"
            >
              <div className="m-1 flex items-center gap-2.5 rounded-[24px] bg-white p-3 shadow-[0_0_0_3px_rgba(241,88,8,0.45),0_10px_26px_rgba(241,88,8,0.3)]">
                {fila}
              </div>

              <div className="flex items-center gap-2.5 px-3 pb-3 pt-2">
                {esAdmin && (
                  <EnviarResumenBoton
                    canal="WHATSAPP"
                    etiqueta="WhatsApp"
                    totalDestinatarios={totalAtletas}
                    enviarAction={async () => {
                      mostrarLoader();
                      await enviarResumenAction(item.id, "WHATSAPP");
                    }}
                    claseBoton="rounded-full bg-verde px-3 py-3 font-display text-sm font-extrabold uppercase text-white shadow-[0_4px_12px_rgba(31,146,84,0.35)] disabled:cursor-not-allowed disabled:bg-gris-oscuro"
                  />
                )}
                {esAdmin && (
                  <EnviarResumenBoton
                    canal="EMAIL"
                    etiqueta="Correo"
                    totalDestinatarios={totalAtletas}
                    enviarAction={async () => {
                      mostrarLoader();
                      await enviarResumenAction(item.id, "EMAIL");
                    }}
                    claseBoton="rounded-full bg-rojo px-3 py-3 font-display text-sm font-extrabold uppercase text-white shadow-[0_4px_12px_rgba(209,39,59,0.35)] disabled:cursor-not-allowed disabled:bg-gris-oscuro"
                  />
                )}
                <EliminarEventoButton
                  eventoId={item.id}
                  eventoTitulo={item.titulo}
                  eliminarEventoAction={async (id) => {
                    mostrarLoader();
                    await eliminarEventoAction(id);
                  }}
                  claseBoton="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-casi-negro shadow-[0_4px_12px_rgba(28,13,10,0.2)]"
                />
              </div>
            </div>
          );
        })}

        <form action={crearEventoAction} onSubmit={mostrarLoader}>
          <button
            type="submit"
            className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-full bg-naranja py-3 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar evento
          </button>
        </form>

        <form
          action={crearEventoDesdeJsonAction}
          onSubmit={mostrarLoader}
          className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-[0_6px_16px_rgba(28,13,10,0.08)]"
        >
          <span className="text-xs font-bold uppercase tracking-wide text-gris-oscuro">
            Crear desde JSON
          </span>

          <label className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-casi-negro/[0.06] py-2 font-display text-sm font-bold uppercase text-casi-negro">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1c0d0a"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Seleccionar archivo
            <input
              type="file"
              name="archivo"
              accept="application/json,.json"
              required
              className="sr-only"
            />
          </label>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-full bg-naranja py-2 font-display text-sm font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
          >
            Crear desde JSON
          </button>
          <a
            href="/plantillas/evento-ejemplo.json"
            download
            className="text-center text-xs font-semibold text-naranja underline"
          >
            Descargar plantilla de ejemplo
          </a>
        </form>
      </div>
    </>
  );
}
