import { buildGoogleCalendarUrl } from "@/lib/format";

const DIAS_SEMANA = ["D", "L", "M", "M", "J", "V", "S"];
const MESES_CORTOS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

// Calendario NO interactivo: solo resalta el día del evento (Fase 2).
// No hay selección de día ni navegación entre meses.
export function MiniCalendario({
  titulo,
  fecha,
  horario,
  ubicacion,
  descripcion,
}: {
  titulo: string;
  fecha: Date;
  horario: string | null;
  ubicacion: string;
  descripcion: string | null;
}) {
  const anio = fecha.getUTCFullYear();
  const mes = fecha.getUTCMonth();
  const diaEvento = fecha.getUTCDate();

  const primerDiaSemana = new Date(Date.UTC(anio, mes, 1)).getUTCDay();
  const diasEnMes = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();

  const celdas: (number | null)[] = [
    ...Array(primerDiaSemana).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];

  const googleCalendarUrl = buildGoogleCalendarUrl({
    titulo,
    fecha,
    horario,
    ubicacion,
    descripcion,
  });

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-casi-negro bg-white p-5 sm:flex-row sm:items-center">
      <table className="w-full max-w-[220px] table-fixed border-collapse text-center">
        <thead>
          <tr>
            {DIAS_SEMANA.map((d, i) => (
              <th
                key={i}
                className={`pb-1 text-xs font-bold ${
                  i === 0 || i === 6 ? "text-naranja" : "text-casi-negro"
                }`}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(celdas.length / 7) }, (_, fila) => (
            <tr key={fila}>
              {celdas.slice(fila * 7, fila * 7 + 7).map((dia, i) => (
                <td key={i} className="py-1 text-sm">
                  {dia === null ? (
                    ""
                  ) : dia === diaEvento ? (
                    <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-casi-negro font-bold text-crema">
                      {dia}
                    </span>
                  ) : (
                    <span
                      className={i === 0 || i === 6 ? "text-naranja" : ""}
                    >
                      {dia}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-1 flex-col items-start gap-2">
        <p className="font-display text-lg font-bold text-naranja">
          {diaEvento} {MESES_CORTOS[mes]}
        </p>
        {horario ? (
          <p className="font-display text-3xl font-extrabold leading-none">
            {horario}
          </p>
        ) : null}
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 rounded-full bg-green-600 px-6 py-2 font-display font-bold text-white"
        >
          Agendar
        </a>
      </div>
    </div>
  );
}
