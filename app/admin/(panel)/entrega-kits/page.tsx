import Link from "next/link";
import { getEventosEntregaKits } from "@/lib/admin/kits";
import { formatFechaBadge } from "@/lib/format";

// Selector de evento para la entrega de kits (Fase 13.2). Es la página de
// inicio del rol VOLUNTARIO (lib/admin/dal.ts lo redirige aquí desde el
// resto del panel).
export default async function EntregaKitsPage() {
  const eventos = await getEventosEntregaKits();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <h1 className="font-display text-4xl font-extrabold uppercase text-white">
        Entrega de kits
      </h1>

      {eventos.length === 0 ? (
        <p className="rounded-[20px] bg-white p-5 italic text-gris-oscuro shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
          No hay eventos próximos.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {eventos.map((evento) => (
            <li key={evento.id}>
              <Link
                href={`/admin/entrega-kits/${evento.id}`}
                className="flex flex-col gap-1 rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(28,13,10,0.10)]"
              >
                <span className="w-fit rounded-full bg-naranja px-3 py-0.5 font-display text-sm font-bold text-white">
                  {formatFechaBadge(evento.fecha)}
                </span>
                <span className="font-display text-lg font-extrabold uppercase">
                  {evento.titulo}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
