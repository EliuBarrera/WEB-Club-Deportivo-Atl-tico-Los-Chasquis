import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de tratamiento de datos personales · Club Los Chasquis",
};

const CONTACTO_DATOS = "chasquis1981@gmail.com";

// Página pública de tratamiento de datos personales (Fase 7, Ley 1581 de
// 2012 - Colombia). El esqueleto (responsable, derechos del titular, cómo
// ejercerlos) es exigido por esa ley y no depende del club; los compromisos
// específicos (qué se recolecta, para qué, por cuánto tiempo, con quién se
// comparte) sí son decisiones del club y quedan marcadas como TODO — el
// proyecto no inventa contenido legal.
export default function PoliticaDatosPersonalesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-8">
      <h1 className="font-display text-4xl font-black uppercase tracking-tight">
        Política de tratamiento de datos personales
      </h1>

      <p className="rounded-xl bg-naranja/10 p-4 text-base leading-relaxed text-gris-oscuro">
        <strong>Nota:</strong> esta página describe la estructura exigida por
        la Ley 1581 de 2012 (Colombia). Los compromisos específicos del club
        (marcados como <code>[TODO]</code> abajo) están pendientes de
        redacción legal — no se inventa contenido legal en este proyecto.
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-extrabold uppercase text-naranja">
          Responsable del tratamiento
        </h2>
        <p className="text-base leading-relaxed text-gris-oscuro">
          Club Deportivo Atlético Los Chasquis, contacto:{" "}
          <a href={`mailto:${CONTACTO_DATOS}`} className="underline">
            {CONTACTO_DATOS}
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-extrabold uppercase text-naranja">
          Datos que se recolectan y su finalidad
        </h2>
        <p className="text-base leading-relaxed text-gris-oscuro">
          [TODO: pendiente de redacción legal del club — detallar qué datos
          se recolectan en el formulario de inscripción (identificación,
          contacto, datos de acudiente para menores de edad, condiciones
          médicas), para qué se usan, por cuánto tiempo se conservan y con
          qué terceros se comparten (ej. la pasarela de pagos Wompi para
          procesar el pago, Cloudinary para el almacenamiento de imágenes).]
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-extrabold uppercase text-naranja">
          Derechos del titular
        </h2>
        <p className="text-base leading-relaxed text-gris-oscuro">
          Como titular de tus datos personales, tienes derecho a conocer,
          actualizar, rectificar y solicitar la eliminación de tus datos, así
          como a revocar la autorización otorgada para su tratamiento, en los
          términos de la Ley 1581 de 2012 y demás normas que la desarrollen.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-extrabold uppercase text-naranja">
          Cómo ejercer tus derechos
        </h2>
        <p className="text-base leading-relaxed text-gris-oscuro">
          Para conocer, actualizar, rectificar o solicitar la eliminación de
          tus datos personales, escribe a{" "}
          <a href={`mailto:${CONTACTO_DATOS}`} className="underline">
            {CONTACTO_DATOS}
          </a>{" "}
          indicando tu nombre completo, número de documento y la solicitud
          puntual. Responderemos dentro de los plazos que establece la ley.
        </p>
      </section>
    </main>
  );
}
