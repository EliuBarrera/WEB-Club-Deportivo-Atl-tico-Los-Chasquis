import { verifySession } from "@/lib/admin/dal";
import { getAtletasUnicos } from "@/lib/admin/atletas";
import { formatFechaBadge } from "@/lib/format";

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default async function AtletasPage({
  searchParams,
}: PageProps<"/admin/atletas">) {
  await verifySession();

  const params = await searchParams;
  const q = (primerValor(params.q) ?? "").trim().toLowerCase();

  const atletas = await getAtletasUnicos();

  const filtrados = q
    ? atletas.filter((atleta) =>
        `${atleta.nombres} ${atleta.apellidos} ${atleta.numeroDocumento}`
          .toLowerCase()
          .includes(q),
      )
    : atletas;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <h1 className="font-display text-4xl font-extrabold uppercase text-white">
        Atletas
      </h1>

      <form className="flex flex-wrap items-end gap-4 rounded-[20px] bg-white p-4 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
            Buscar por nombre o documento
          </span>
          <input
            type="text"
            name="q"
            defaultValue={q}
            className="rounded-lg bg-casi-negro/[0.045] px-3 py-2 text-lg outline-none"
          />
        </label>

        <button
          type="submit"
          className="rounded-full bg-white px-5 py-2 font-display font-bold uppercase text-casi-negro shadow-[0_4px_12px_rgba(28,13,10,0.14)]"
        >
          Filtrar
        </button>

        <span className="ml-auto text-sm font-bold uppercase tracking-wide text-gris-oscuro">
          {filtrados.length} atleta{filtrados.length === 1 ? "" : "s"} único
          {filtrados.length === 1 ? "" : "s"}
        </span>
      </form>

      <div className="overflow-x-auto rounded-[20px] bg-white shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
        <table className="w-full min-w-[900px] table-auto text-left">
          <thead>
            <tr className="border-b border-casi-negro/10 text-sm font-bold uppercase tracking-wide text-gris-oscuro">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Documento</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Ciudad / Departamento</th>
              <th className="px-4 py-3">Club</th>
              <th className="px-4 py-3">Inscripciones</th>
              <th className="px-4 py-3">Eventos</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((atleta) => (
              <tr
                key={atleta.numeroDocumento}
                className="border-b border-casi-negro/[0.06] last:border-none"
              >
                <td className="px-4 py-3">
                  {atleta.nombres} {atleta.apellidos}
                </td>
                <td className="px-4 py-3">
                  {atleta.tipoDocumento} {atleta.numeroDocumento}
                </td>
                <td className="px-4 py-3">
                  {atleta.celular}
                  <br />
                  {atleta.email}
                </td>
                <td className="px-4 py-3">
                  {atleta.ciudad} / {atleta.departamento}
                </td>
                <td className="px-4 py-3">{atleta.club ?? "—"}</td>
                <td className="px-4 py-3">
                  {atleta.totalInscripciones}
                  <br />
                  <span className="text-xs text-gris-oscuro">
                    Última: {formatFechaBadge(atleta.ultimaInscripcionEn)}
                  </span>
                </td>
                <td
                  className="max-w-[220px] truncate px-4 py-3"
                  title={atleta.eventos.join(", ")}
                >
                  {atleta.eventos.join(", ")}
                </td>
              </tr>
            ))}

            {filtrados.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center italic text-gris-oscuro"
                >
                  No hay atletas para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
