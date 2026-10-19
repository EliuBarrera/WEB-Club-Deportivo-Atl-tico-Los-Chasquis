import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { accesoKitsPorToken } from "@/lib/admin/kits";
import { formatFechaBadge } from "@/lib/format";
import { EntregaKits } from "@/components/admin/EntregaKits";
import { GuiaEntregaKits } from "@/components/admin/GuiaEntregaKits";
import {
  buscarDocumentoTokenAction,
  consultarKitTokenAction,
  listaKitsTokenAction,
  sincronizarKitsTokenAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Entrega de kits · Club Los Chasquis",
  robots: { index: false, follow: false },
};

// Entrega de kits para voluntarios sin cuenta (Fase 13.2). Fuera de
// /admin a propósito: proxy.ts no la intercepta y el acceso lo da el token
// del enlace (Evento.tokenEntregaKits), que se revalida en cada acción.
// Token inválido o vencido → 404, sin distinguir el motivo.
export default async function EntregaKitsVoluntarioPage({
  params,
}: PageProps<"/kits/[token]">) {
  const { token } = await params;
  const acceso = await accesoKitsPorToken(token);
  if (!acceso) notFound();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 bg-casi-negro px-4 py-8">
      <div className="flex flex-col gap-1">
        <Image
          src="/cropped-cropped-Logo-png.png"
          alt="Club Los Chasquis"
          width={405}
          height={105}
          // self-start: dentro del flex-col el <img> se estiraría a todo el
          // ancho con la altura fija, y el logo saldría aplastado.
          className="mb-2 h-14 w-auto self-start"
        />
        <h1 className="font-display text-3xl font-extrabold uppercase text-crema">
          {acceso.titulo}
        </h1>
        <span className="text-crema/80">
          Entrega de kits · {formatFechaBadge(acceso.fecha)}
        </span>
      </div>

      {/* Viene con la página, así que se puede consultar aunque se caiga
          la señal. */}
      <details className="group rounded-[20px] bg-white shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-display text-lg font-extrabold uppercase">
          ¿Primera vez? Lee cómo entregar
          <span
            aria-hidden
            className="text-naranja transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <div className="px-5 pb-5">
          <GuiaEntregaKits />
        </div>
      </details>

      <EntregaKits
        eventoId={acceso.eventoId}
        descargarLista={listaKitsTokenAction.bind(null, token)}
        sincronizar={sincronizarKitsTokenAction.bind(null, token)}
        buscarDocumento={buscarDocumentoTokenAction.bind(null, token)}
        consultarInscripcion={consultarKitTokenAction.bind(null, token)}
      />
    </main>
  );
}
