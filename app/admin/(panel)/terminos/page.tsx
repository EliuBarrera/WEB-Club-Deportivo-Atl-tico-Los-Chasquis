import { verifySession } from "@/lib/admin/dal";
import { getTerminosVigente } from "@/lib/eventos";
import { Toast } from "@/components/admin/Toast";
import { actualizarTerminos } from "./actions";

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default async function TerminosPage({
  searchParams,
}: PageProps<"/admin/terminos">) {
  await verifySession();

  const params = await searchParams;
  const guardado = primerValor(params.guardado);
  const guardadoTs = primerValor(params.t);

  const terminos = await getTerminosVigente();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Toast
        key={guardadoTs}
        mensaje={guardado === "terminos" ? "Términos y condiciones actualizados" : null}
      />

      <h1 className="font-display text-4xl font-extrabold uppercase text-white">
        Términos y condiciones
      </h1>

      <p className="text-white/70">
        Este es el bloque institucional que ven todos los atletas al
        inscribirse a cualquier evento (reglamento general, seguridad,
        premiación, tratamiento de datos y exoneración de responsabilidad).
        Guardar un cambio crea una nueva versión — las inscripciones ya
        registradas conservan la versión que aceptaron en su momento.
      </p>

      {terminos ? (
        <p className="text-sm text-white/50">
          Versión vigente: {terminos.version} · desde{" "}
          {terminos.vigenteDesde.toLocaleDateString("es-CO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      ) : (
        <p className="text-sm text-white/50">
          Todavía no hay ninguna versión publicada.
        </p>
      )}

      <form
        action={actualizarTerminos}
        className="flex flex-col gap-4 rounded-[20px] bg-white p-6 shadow-[0_10px_30px_rgba(28,13,10,0.10)]"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
            Contenido
          </span>
          <textarea
            name="contenido"
            required
            rows={24}
            defaultValue={terminos?.contenido ?? ""}
            className="rounded-lg bg-casi-negro/[0.045] px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:bg-white focus:shadow-[0_0_0_2px_rgba(241,88,8,0.4)]"
          />
        </label>

        <button
          type="submit"
          className="w-fit rounded-full bg-naranja px-6 py-2.5 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
        >
          Guardar nueva versión
        </button>
      </form>
    </div>
  );
}
