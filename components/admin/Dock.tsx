"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LoaderTransicion, useLoaderTransicion } from "../LoaderTransicion";
import { FormularioCargando } from "../FormularioCargando";

const NAV_ITEMS = [
  {
    href: "/admin/inscripciones",
    etiqueta: "Inscripciones",
    icono: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
  },
  {
    href: "/admin/atletas",
    etiqueta: "Atletas",
    icono: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="7" r="4" />
        <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      </svg>
    ),
  },
  {
    href: "/admin/eventos",
    etiqueta: "Eventos",
    icono: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    href: "/admin/legal",
    etiqueta: "Legal",
    icono: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
  },
  {
    href: "/admin/contenido",
    etiqueta: "Contenido",
    icono: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/socios",
    etiqueta: "Socios",
    icono: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
        <path d="M17 3.13a4 4 0 0 1 0 7.75" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    ),
  },
];

// Dock inferior flotante del panel admin (Fase 6/9): reemplaza la barra
// superior. Es client component solo por `usePathname()` (resaltar la
// sección activa); la acción de cerrar sesión sigue siendo una Server
// Action que se recibe como prop desde app/admin/layout.tsx.
export function Dock({
  cerrarSesionAction,
}: {
  cerrarSesionAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const { navegando, irA } = useLoaderTransicion(pathname);

  return (
    <>
      <LoaderTransicion activo={navegando} />
      <nav
        aria-label="Navegación panel admin"
        className="fixed bottom-7 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white p-2 shadow-[0_10px_30px_rgba(28,13,10,0.18),0_4px_16px_rgba(241,88,8,0.25)]"
      >
        {NAV_ITEMS.map((item) => {
          const activo = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => irA(item.href)}
              className={
                activo
                  ? "flex h-16 w-[116px] flex-col items-center justify-center gap-1 rounded-full bg-naranja text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
                  : "flex h-16 w-[116px] flex-col items-center justify-center gap-1 rounded-full bg-white text-casi-negro"
              }
            >
              {item.icono}
              <span className="font-display text-[11px] font-extrabold uppercase tracking-wide">
                {item.etiqueta}
              </span>
            </Link>
          );
        })}

        <div className="mx-0.5 w-px self-stretch bg-casi-negro/10" />

        <form action={cerrarSesionAction}>
          <FormularioCargando mensaje="Cerrando sesión…" />
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className="flex h-16 w-14 items-center justify-center rounded-full bg-casi-negro/5 text-casi-negro"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </form>
      </nav>
    </>
  );
}
