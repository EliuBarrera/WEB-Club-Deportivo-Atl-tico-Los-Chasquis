"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    href: "/admin/terminos",
    etiqueta: "Términos",
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
    href: "/admin/documentos",
    etiqueta: "Documentos",
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
  },
  {
    href: "/admin/cifras",
    etiqueta: "Cifras",
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
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/admin/testimonios",
    etiqueta: "Testimonios",
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
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

  return (
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
  );
}
