import { getCifrasConfianzaAdmin, verifySession } from "@/lib/admin/dal";
import { Toast } from "@/components/admin/Toast";
import { CifrasConfianzaAdmin } from "@/components/admin/CifrasConfianzaAdmin";
import { crearCifra, actualizarCifra, eliminarCifra } from "./actions";

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

const MENSAJES: Record<string, string> = {
  creada: "Cifra agregada",
  actualizada: "Cifra actualizada",
};

export default async function CifrasPage({
  searchParams,
}: PageProps<"/admin/cifras">) {
  await verifySession();

  const params = await searchParams;
  const guardado = primerValor(params.guardado);
  const guardadoTs = primerValor(params.t);

  const cifras = await getCifrasConfianzaAdmin();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Toast
        key={guardadoTs}
        mensaje={guardado ? (MENSAJES[guardado] ?? null) : null}
      />

      <h1 className="font-display text-4xl font-extrabold uppercase text-white">
        Cifras de confianza
      </h1>

      <p className="text-white/70">
        Esta lista alimenta la franja de números grandes en la home (años de
        historia, eventos organizados, atletas participantes, etc.). Se
        muestran en el orden indicado.
      </p>

      <CifrasConfianzaAdmin
        cifras={cifras}
        crearAction={crearCifra}
        actualizarAction={actualizarCifra}
        eliminarAction={eliminarCifra}
      />
    </div>
  );
}
