import { getHitosHistoricosAdmin, verifySession } from "@/lib/admin/dal";
import { Toast } from "@/components/admin/Toast";
import { HistoriaAdmin } from "@/components/admin/HistoriaAdmin";
import { crearHito, actualizarHito, eliminarHito } from "./actions";

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

const MENSAJES: Record<string, string> = {
  creado: "Hito agregado",
  actualizado: "Hito actualizado",
};

export default async function HistoriaPage({
  searchParams,
}: PageProps<"/admin/historia">) {
  await verifySession();

  const params = await searchParams;
  const guardado = primerValor(params.guardado);
  const guardadoTs = primerValor(params.t);

  const hitos = await getHitosHistoricosAdmin();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Toast
        key={guardadoTs}
        mensaje={guardado ? (MENSAJES[guardado] ?? null) : null}
      />

      <h1 className="font-display text-4xl font-extrabold uppercase text-white">
        Nuestra historia
      </h1>

      <p className="text-white/70">
        Esta lista alimenta la línea de tiempo de la home. Hoy es un{" "}
        <strong>borrador</strong>: solo tiene la fundación (1980) y el
        reconocimiento de Personería Jurídica No. 086, entregados por el
        club el 2026-09-14. El año es opcional — déjalo vacío si el hito
        todavía no tiene una fecha exacta confirmada. Cuando el club
        entregue más hitos (fotos + años + datos destacados), agrégalos
        acá sin necesidad de un despliegue nuevo.
      </p>

      <HistoriaAdmin
        hitos={hitos}
        crearAction={crearHito}
        actualizarAction={actualizarHito}
        eliminarAction={eliminarHito}
      />
    </div>
  );
}
