import { getSociosAdmin, verifySession } from "@/lib/admin/dal";
import { Toast } from "@/components/admin/Toast";
import { SociosAdmin } from "@/components/admin/SociosAdmin";
import { crearSocio, actualizarSocio, eliminarSocio } from "./actions";

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

const MENSAJES: Record<string, string> = {
  creado: "Socio agregado",
  actualizado: "Socio actualizado",
};

export default async function SociosPage({
  searchParams,
}: PageProps<"/admin/socios">) {
  await verifySession();

  const params = await searchParams;
  const guardado = primerValor(params.guardado);
  const guardadoTs = primerValor(params.t);

  const socios = await getSociosAdmin();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Toast
        key={guardadoTs}
        mensaje={guardado ? (MENSAJES[guardado] ?? null) : null}
      />

      <h1 className="font-display text-4xl font-extrabold uppercase text-white">
        Socios y respaldo institucional
      </h1>

      <p className="text-white/70">
        Esta lista alimenta el grid de logos de la home (&quot;Respaldo
        institucional&quot;). Los patrocinadores cambian de un año a otro —
        agrega o elimina uno cuando corresponda, sin necesidad de un
        despliegue nuevo.
      </p>

      <SociosAdmin
        socios={socios}
        crearAction={crearSocio}
        actualizarAction={actualizarSocio}
        eliminarAction={eliminarSocio}
      />
    </div>
  );
}
