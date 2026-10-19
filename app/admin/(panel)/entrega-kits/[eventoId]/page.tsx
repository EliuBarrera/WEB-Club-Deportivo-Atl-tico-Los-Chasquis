import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/admin/dal";
import { accesoKitsPorSesion, getEnlaceEntregaKits } from "@/lib/admin/kits";
import { formatFechaBadge } from "@/lib/format";
import { EntregaKits } from "@/components/admin/EntregaKits";
import { EnlaceEntregaKits } from "@/components/admin/EnlaceEntregaKits";
import {
  buscarDocumentoSesionAction,
  consultarKitSesionAction,
  generarEnlaceKitsAction,
  listaKitsSesionAction,
  revocarEnlaceKitsAction,
  sincronizarKitsSesionAction,
} from "./actions";

// Entrega de kits desde el panel (Fase 13.2). Además de entregar (mismo
// componente que usan los voluntarios en /kits/[token]), aquí se genera o
// revoca el enlace para voluntarios, que no tienen cuenta.
export default async function EntregaKitsEventoPage({
  params,
}: PageProps<"/admin/entrega-kits/[eventoId]">) {
  const { eventoId } = await params;
  const session = await verifySession();

  const [acceso, enlace] = await Promise.all([
    accesoKitsPorSesion(eventoId),
    getEnlaceEntregaKits(eventoId),
  ]);
  if (!acceso) notFound();

  const enlaceVigente =
    enlace?.tokenEntregaKits &&
    enlace.tokenEntregaKitsExpira &&
    enlace.tokenEntregaKitsExpira > new Date()
      ? enlace.tokenEntregaKits
      : null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/entrega-kits"
          className="w-fit font-display text-sm font-bold uppercase text-white/80"
        >
          ← Eventos
        </Link>
        <h1 className="font-display text-3xl font-extrabold uppercase text-white">
          {acceso.titulo}
        </h1>
        <span className="text-white/80">{formatFechaBadge(acceso.fecha)}</span>
      </div>

      <section className="flex flex-col gap-3 rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
        <h2 className="font-display text-lg font-extrabold uppercase">
          Enlace para voluntarios
        </h2>
        <p className="text-sm text-gris-oscuro">
          Sin cuentas: quien tenga el enlace puede ver los inscritos
          aprobados y entregar kits. Vence al terminar el día siguiente al
          evento. El mensaje de WhatsApp incluye la{" "}
          <Link
            href="/kits/guia"
            target="_blank"
            className="font-bold text-naranja underline"
          >
            guía para voluntarios
          </Link>
          .
        </p>
        {enlaceVigente ? (
          <>
            <EnlaceEntregaKits token={enlaceVigente} />
            <p className="text-xs text-gris-oscuro">
              Vence el{" "}
              {formatFechaBadge(enlace!.tokenEntregaKitsExpira!)}.
            </p>
            <form action={revocarEnlaceKitsAction.bind(null, eventoId)}>
              <button
                type="submit"
                className="rounded-full bg-casi-negro/5 px-4 py-2 font-display text-sm font-bold uppercase text-red-700"
              >
                Revocar enlace
              </button>
            </form>
          </>
        ) : (
          <form action={generarEnlaceKitsAction.bind(null, eventoId)}>
            <button
              type="submit"
              className="rounded-full bg-naranja px-5 py-2 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
            >
              Generar enlace
            </button>
          </form>
        )}
      </section>

      <EntregaKits
        eventoId={eventoId}
        nombreFijo={session.user.name ?? session.user.email ?? "Panel"}
        descargarLista={listaKitsSesionAction.bind(null, eventoId)}
        sincronizar={sincronizarKitsSesionAction.bind(null, eventoId)}
        buscarDocumento={buscarDocumentoSesionAction.bind(null, eventoId)}
        consultarInscripcion={consultarKitSesionAction.bind(null, eventoId)}
      />
    </div>
  );
}
