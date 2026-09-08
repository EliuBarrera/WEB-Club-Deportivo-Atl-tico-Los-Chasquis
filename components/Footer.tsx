"use client";

import { useState } from "react";
import type { TerminosVigente } from "@/lib/eventos";
import { ModalTerminos } from "@/components/eventos/ModalTerminos";

// Footer mínimo: por ahora solo existe para exponer el enlace al modal de
// Términos y Condiciones generales (Fase 4) y a la política de datos
// personales (Fase 7) fuera del formulario de inscripción. La Fase 9 lo
// expande con contacto/redes/ubicación.
export function Footer({ terminos }: { terminos: TerminosVigente }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <footer className="mt-auto flex flex-col items-center gap-2 border-t border-casi-negro/10 bg-white px-4 py-6 text-center">
      <p className="text-sm text-gris-oscuro">
        © {new Date().getFullYear()} Club Deportivo Atlético Los Chasquis
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="font-display text-sm font-bold uppercase text-naranja underline"
        >
          Ver términos y condiciones generales
        </button>
        <a
          href="/politica-datos-personales"
          className="font-display text-sm font-bold uppercase text-naranja underline"
        >
          Política de tratamiento de datos personales
        </a>
      </div>

      <ModalTerminos
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        contenido={terminos?.contenido ?? null}
        version={terminos?.version ?? null}
      />
    </footer>
  );
}
