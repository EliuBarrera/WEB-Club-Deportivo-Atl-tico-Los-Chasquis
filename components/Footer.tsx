"use client";

import { useState } from "react";
import type { TerminosVigente } from "@/lib/eventos";
import { ModalTerminos } from "@/components/eventos/ModalTerminos";
import { ModalPoliticaDatos } from "@/components/ModalPoliticaDatos";

// Footer mínimo: por ahora solo existe para exponer el enlace al modal de
// Términos y Condiciones generales (Fase 4) y a la política de datos
// personales (Fase 7) fuera del formulario de inscripción. La Fase 9 lo
// expande con contacto/redes/ubicación (ubicación exacta sigue pendiente:
// no hay dirección física confirmada por el club).
const REDES_SOCIALES = [
  {
    nombre: "WhatsApp",
    href: "https://wa.me/573112644205",
    icono: (
      <path
        d="M12 3C7.03 3 3 7.03 3 12c0 1.64.44 3.18 1.2 4.5L3 21l4.64-1.18A8.93 8.93 0 0 0 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9Zm4.53 12.62c-.19.53-1.11 1.02-1.53 1.08-.39.06-.89.08-1.43-.09-.33-.1-.75-.24-1.3-.47-2.29-.99-3.78-3.29-3.9-3.44-.11-.15-.93-1.24-.93-2.36 0-1.13.59-1.68.8-1.91.21-.23.46-.29.61-.29.15 0 .3.001.43.007.14.006.32-.053.5.38.19.46.65 1.58.7 1.7.06.11.09.25.02.4-.07.15-.11.24-.22.37-.11.13-.24.29-.34.39-.11.11-.23.24-.1.47.13.23.57.94 1.23 1.52.85.75 1.56.99 1.79 1.1.23.11.36.09.5-.06.14-.15.58-.68.74-.91.15-.23.31-.19.51-.11.21.08 1.32.62 1.55.73.23.11.38.17.44.26.06.09.06.53-.13 1.06Z"
        fill="currentColor"
        stroke="none"
      />
    ),
  },
  {
    nombre: "Facebook",
    href: "https://www.facebook.com/Clubloschasquiss",
    icono: (
      <path
        d="M13.5 21v-7.5h2.5l.5-3H13.5V8.5c0-.87.24-1.46 1.49-1.46H16.5V4.35C16.19 4.31 15.13 4.2 13.9 4.2c-2.56 0-4.32 1.56-4.32 4.43V10.5H7v3h2.58V21h3.92Z"
        fill="currentColor"
        stroke="none"
      />
    ),
  },
  {
    nombre: "Instagram",
    href: "https://www.instagram.com/clubloschasquis",
    icono: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r="0.8" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    nombre: "X (Twitter)",
    href: "https://x.com/clubloschasquis",
    icono: (
      <path d="M4 4l16 16M20 4 4 20" />
    ),
  },
] as const;

export function Footer({ terminos }: { terminos: TerminosVigente }) {
  const [abierto, setAbierto] = useState(false);
  const [politicaAbierta, setPoliticaAbierta] = useState(false);

  return (
    <footer className="mt-auto flex flex-col items-center gap-4 border-t border-casi-negro/10 bg-white px-4 pt-6 pb-28 text-center sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:pb-32 sm:text-left">
      <p className="text-sm text-gris-oscuro sm:justify-self-start sm:text-left">
        © {new Date().getFullYear()} Club Deportivo Atlético Los Chasquis
      </p>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-self-center">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="font-display text-sm font-bold uppercase text-naranja underline"
        >
          Ver términos y condiciones generales
        </button>
        <button
          type="button"
          onClick={() => setPoliticaAbierta(true)}
          className="font-display text-sm font-bold uppercase text-naranja underline"
        >
          Política de tratamiento de datos personales
        </button>
        <a
          href="/transparencia"
          className="font-display text-sm font-bold uppercase text-naranja underline"
        >
          Transparencia y documentos legales
        </a>
      </div>

      <div className="flex items-center justify-center gap-4 sm:justify-self-end">
        {REDES_SOCIALES.map((red) => (
          <a
            key={red.nombre}
            href={red.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={red.nombre}
            className="text-gris-oscuro transition-colors hover:text-naranja"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {red.icono}
            </svg>
          </a>
        ))}
      </div>

      <ModalTerminos
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        contenido={terminos?.contenido ?? null}
        version={terminos?.version ?? null}
      />
      <ModalPoliticaDatos
        abierto={politicaAbierta}
        onCerrar={() => setPoliticaAbierta(false)}
      />
    </footer>
  );
}
