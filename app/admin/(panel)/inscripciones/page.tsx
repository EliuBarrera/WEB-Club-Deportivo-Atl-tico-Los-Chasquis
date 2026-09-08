import {
  getDashboardIngresos,
  getEventosParaFiltro,
  getInscripcionesPorEvento,
  verifySession,
} from "@/lib/admin/dal";
import { formatFechaBadge, formatPrecio } from "@/lib/format";

const ESTADOS_PAGO = [
  "PENDIENTE",
  "APROBADO",
  "RECHAZADO",
  "DECLINADO",
  "ERROR",
] as const;

const WOMPI_LOGIN_URL = "https://comercios.wompi.co";

const ESTADO_PAGO_BADGE: Record<
  (typeof ESTADOS_PAGO)[number],
  string
> = {
  APROBADO: "bg-verde text-white",
  PENDIENTE: "bg-amarillo text-white",
  ERROR: "bg-rojo text-white",
  RECHAZADO: "bg-casi-negro/[0.06] text-casi-negro",
  DECLINADO: "bg-casi-negro/[0.06] text-casi-negro",
};

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default async function InscripcionesPage({
  searchParams,
}: PageProps<"/admin/inscripciones">) {
  await verifySession();

  const params = await searchParams;
  // getEventosParaFiltro y getDashboardIngresos no dependen entre sí — se
  // piden en paralelo para no sumar dos round-trips secuenciales a Neon
  // (cada uno pasa por verifySession() por separado, ver lib/admin/dal.ts).
  const [eventos, dashboard] = await Promise.all([
    getEventosParaFiltro(),
    getDashboardIngresos(),
  ]);

  const eventoId = primerValor(params.eventoId) ?? eventos[0]?.id;
  const estadoPagoParam = primerValor(params.estadoPago);
  // El <option value=""> de "Todos" llega como string vacío, no como
  // ausente: hay que tratarlo como "sin filtro" antes de pasarlo a Prisma.
  const estadoPago = estadoPagoParam
    ? (estadoPagoParam as (typeof ESTADOS_PAGO)[number])
    : undefined;

  const inscripciones = eventoId
    ? await getInscripcionesPorEvento({ eventoId, estadoPago })
    : [];

  const queryExport = new URLSearchParams();
  if (eventoId) queryExport.set("eventoId", eventoId);
  if (estadoPago) queryExport.set("estadoPago", estadoPago);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-extrabold uppercase text-white">
          Dashboard de ingresos
        </h2>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-1 flex-col justify-center gap-2 rounded-[20px] bg-naranja p-5 text-white shadow-[0_14px_34px_rgba(241,88,8,0.35)] sm:min-w-[280px]">
            <span className="text-sm font-bold uppercase tracking-wide text-white/80">
              Ingresos totales (aprobados)
            </span>
            <span className="font-display text-4xl font-extrabold leading-none">
              {formatPrecio(dashboard.totalRecaudado)}
            </span>
            <span className="text-sm text-white/70">
              Todos los eventos · {dashboard.totalPagos} pagos aprobados
            </span>
            <a
              href={WOMPI_LOGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 font-display text-sm font-bold uppercase text-white"
            >
              Ver en Wompi
            </a>
          </div>

          {dashboard.eventos.map((evento) => (
            <div
              key={evento.id}
              className="flex flex-1 flex-col gap-1 rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(28,13,10,0.10)] sm:min-w-[240px]"
            >
              <span className="w-fit rounded-full bg-naranja px-3 py-0.5 font-display text-sm font-bold text-white">
                {formatFechaBadge(evento.fecha)}
              </span>
              <span className="font-display text-lg font-extrabold uppercase">
                {evento.titulo}
              </span>
              <span className="font-display text-2xl font-extrabold">
                {formatPrecio(evento.recaudado)}
              </span>
              <span className="text-sm text-gris-oscuro">
                {evento.inscritos} inscritos aprobados
              </span>
              <a
                href={WOMPI_LOGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-casi-negro/5 px-3.5 py-1 font-display text-xs font-bold uppercase text-casi-negro"
              >
                Ver en Wompi
              </a>
            </div>
          ))}

          {dashboard.eventos.length === 0 && (
            <div className="flex flex-1 items-center rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
              <p className="italic text-gris-oscuro">
                Aún no hay pagos aprobados para ningún evento.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <h1 className="font-display text-4xl font-extrabold uppercase text-white">
          Inscripciones
        </h1>

        <form className="flex flex-wrap items-end gap-4 rounded-[20px] bg-white p-4 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
              Evento
            </span>
            <select
              name="eventoId"
              defaultValue={eventoId}
              className="rounded-lg bg-casi-negro/[0.045] px-3 py-2 text-lg outline-none"
            >
              {eventos.map((evento) => (
                <option key={evento.id} value={evento.id}>
                  {evento.titulo} — {formatFechaBadge(evento.fecha)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
              Estado de pago
            </span>
            <select
              name="estadoPago"
              defaultValue={estadoPago ?? ""}
              className="rounded-lg bg-casi-negro/[0.045] px-3 py-2 text-lg outline-none"
            >
              <option value="">Todos</option>
              {ESTADOS_PAGO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-full bg-white px-5 py-2 font-display font-bold uppercase text-casi-negro shadow-[0_4px_12px_rgba(28,13,10,0.14)]"
          >
            Filtrar
          </button>

          {eventoId && (
            <a
              href={`/api/admin/inscripciones/export?${queryExport.toString()}`}
              className="ml-auto rounded-full bg-naranja px-5 py-2 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
            >
              Exportar CSV
            </a>
          )}
        </form>

        <div className="overflow-x-auto rounded-[20px] bg-white shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
          <table className="w-full min-w-[900px] table-auto text-left">
            <thead>
              <tr className="border-b border-casi-negro/10 text-sm font-bold uppercase tracking-wide text-gris-oscuro">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Categoría / costo</th>
                <th className="px-4 py-3">Pruebas</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {inscripciones.map((inscripcion) => (
                <tr
                  key={inscripcion.id}
                  className="border-b border-casi-negro/[0.06] last:border-none"
                >
                  <td className="px-4 py-3">
                    {inscripcion.nombres} {inscripcion.apellidos}
                  </td>
                  <td className="px-4 py-3">
                    {inscripcion.tipoDocumento} {inscripcion.numeroDocumento}
                  </td>
                  <td className="px-4 py-3">
                    {inscripcion.categoria?.nombre ?? inscripcion.costo?.tipo ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {inscripcion.pruebasIds.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {inscripcion.celular}
                    <br />
                    {inscripcion.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full px-3 py-1 text-xs font-bold uppercase " +
                        ESTADO_PAGO_BADGE[inscripcion.estadoPago]
                      }
                    >
                      {inscripcion.estadoPago}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatPrecio(inscripcion.totalPago)}</td>
                </tr>
              ))}

              {inscripciones.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center italic text-gris-oscuro">
                    No hay inscripciones para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
