import { getTestimoniosAdmin, verifySession } from "@/lib/admin/dal";
import { Toast } from "@/components/admin/Toast";
import { TestimoniosAdmin } from "@/components/admin/TestimoniosAdmin";
import {
  crearTestimonio,
  actualizarTestimonio,
  eliminarTestimonio,
} from "./actions";

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

const MENSAJES: Record<string, string> = {
  creado: "Testimonio agregado",
  actualizado: "Testimonio actualizado",
};

export default async function TestimoniosPage({
  searchParams,
}: PageProps<"/admin/testimonios">) {
  await verifySession();

  const params = await searchParams;
  const guardado = primerValor(params.guardado);
  const guardadoTs = primerValor(params.t);

  const testimonios = await getTestimoniosAdmin();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Toast
        key={guardadoTs}
        mensaje={guardado ? (MENSAJES[guardado] ?? null) : null}
      />

      <h1 className="font-display text-4xl font-extrabold uppercase text-white">
        Testimonios
      </h1>

      <p className="text-white/70">
        Esta lista alimenta la sección de testimonios de la home. El nombre
        y el rol son opcionales — dejar vacíos si la persona pidió
        anonimato. Antes de agregar uno, confirma que la persona autorizó
        el uso de su foto y su cita en el sitio.
      </p>

      <TestimoniosAdmin
        testimonios={testimonios}
        crearAction={crearTestimonio}
        actualizarAction={actualizarTestimonio}
        eliminarAction={eliminarTestimonio}
      />
    </div>
  );
}
