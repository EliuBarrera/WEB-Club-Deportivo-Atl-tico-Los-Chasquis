"use client";

import { useEffect } from "react";

const CONTACTO_DATOS = "chasquis1981@gmail.com";

// Modal con el mismo contenido de app/politica-datos-personales/page.tsx
// (Fase 7, Ley 1581 de 2012 - Colombia), para el enlace del footer —
// mismo patrón que components/eventos/ModalTerminos.tsx. La página
// standalone se mantiene tal cual (la usa también el checkbox de
// FormularioInscripcion.tsx, que abre en pestaña nueva).
export function ModalPoliticaDatos({
  abierto,
  onCerrar,
}: {
  abierto: boolean;
  onCerrar: () => void;
}) {
  useEffect(() => {
    if (!abierto) return;
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Política de tratamiento de datos personales"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-casi-negro/60 p-4 sm:p-6"
      onClick={onCerrar}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-5 overflow-y-auto rounded-[24px] bg-white p-6 shadow-[0_20px_50px_rgba(28,13,10,0.35)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-extrabold uppercase">
            Política de tratamiento de datos personales
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-casi-negro/5 text-casi-negro"
          >
            ✕
          </button>
        </div>

        <p className="rounded-xl bg-naranja/10 p-4 text-base leading-relaxed text-gris-oscuro">
          <strong>Nota:</strong> esta página describe la estructura exigida
          por la Ley 1581 de 2012 (Colombia). Los compromisos específicos
          del club (marcados como <code>[TODO]</code> abajo) están
          pendientes de redacción legal — no se inventa contenido legal en
          este proyecto.
        </p>

        <div className="flex flex-col gap-2">
          <h3 className="font-display text-lg font-extrabold uppercase text-naranja">
            Responsable del tratamiento
          </h3>
          <p className="text-base leading-relaxed text-gris-oscuro">
            Club Deportivo Atlético Los Chasquis, contacto:{" "}
            <a href={`mailto:${CONTACTO_DATOS}`} className="underline">
              {CONTACTO_DATOS}
            </a>
            .
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-casi-negro/10 pt-4">
          <h3 className="font-display text-lg font-extrabold uppercase text-naranja">
            Datos que se recolectan y su finalidad
          </h3>
          <p className="text-base leading-relaxed text-gris-oscuro">
            [TODO: pendiente de redacción legal del club — detallar qué
            datos se recolectan en el formulario de inscripción
            (identificación, contacto, datos de acudiente para menores de
            edad, condiciones médicas), para qué se usan, por cuánto tiempo
            se conservan y con qué terceros se comparten (ej. la pasarela
            de pagos Wompi para procesar el pago, Cloudinary para el
            almacenamiento de imágenes).]
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-casi-negro/10 pt-4">
          <h3 className="font-display text-lg font-extrabold uppercase text-naranja">
            Derechos del titular
          </h3>
          <p className="text-base leading-relaxed text-gris-oscuro">
            Como titular de tus datos personales, tienes derecho a conocer,
            actualizar, rectificar y solicitar la eliminación de tus datos,
            así como a revocar la autorización otorgada para su
            tratamiento, en los términos de la Ley 1581 de 2012 y demás
            normas que la desarrollen.
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-casi-negro/10 pt-4">
          <h3 className="font-display text-lg font-extrabold uppercase text-naranja">
            Cómo ejercer tus derechos
          </h3>
          <p className="text-base leading-relaxed text-gris-oscuro">
            Para conocer, actualizar, rectificar o solicitar la eliminación
            de tus datos personales, escribe a{" "}
            <a href={`mailto:${CONTACTO_DATOS}`} className="underline">
              {CONTACTO_DATOS}
            </a>{" "}
            indicando tu nombre completo, número de documento y la
            solicitud puntual. Responderemos dentro de los plazos que
            establece la ley.
          </p>
        </div>
      </div>
    </div>
  );
}
