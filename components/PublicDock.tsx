"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LoaderTransicion, useLoaderTransicion } from "./LoaderTransicion";

const NAV_ITEMS = [
  {
    href: "/",
    etiqueta: "Inicio",
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
        <path d="M3 9.5 12 3l9 6.5" />
        <path d="M5 10v10a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V10" />
      </svg>
    ),
  },
  {
    href: "/eventos",
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
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/atletas",
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
    href: "/transparencia",
    etiqueta: "Transparencia",
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
      </svg>
    ),
  },
] as const;

// Dock inferior flotante del sitio público (Fase 10): reemplaza el
// Header anterior (logo + enlaces arriba), mismo estilo visual que
// components/admin/Dock.tsx. El logo va al inicio (enlaza a "/", igual
// que antes el wordmark del Header) y Transparencia queda al final.
//
// A diferencia del dock del admin (que no necesita ser angosto: solo lo
// ve un usuario logueado), este es la navegación del sitio público, que
// según Documentation/PLAN_DESARROLLO.md tiene mucho tráfico desde
// celular — con 4 accesos + logo, el ancho fijo del admin (116px por
// ítem) desbordaría un viewport de ~390px. Por eso en móvil los ítems se
// achican a solo ícono (sin etiqueta) y recuperan el ancho/etiqueta
// completos desde `sm:`.
//
// `cerrarSesionAction` es opcional porque este dock se monta en todas
// las páginas públicas, pero solo /atletas sabe si hay una sesión de
// atleta activa (cookie `atleta_sesion`, ver lib/atletas/sesion.ts): esa
// página es la única que pasa la prop, así que el botón de cerrar sesión
// solo aparece ahí — igual que el de components/admin/Dock.tsx.
export function PublicDock({
  cerrarSesionAction,
}: {
  cerrarSesionAction?: () => Promise<void>;
}) {
  const pathname = usePathname();
  const { navegando, irA } = useLoaderTransicion(pathname);

  return (
    <>
      <LoaderTransicion activo={navegando} />
      <nav
        aria-label="Navegación principal"
        className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white p-2 shadow-[0_10px_30px_rgba(28,13,10,0.18),0_4px_16px_rgba(241,88,8,0.25)] sm:bottom-7 sm:gap-1.5"
      >
        <Link
          href="/"
          aria-label="Los Chasquis — Inicio"
          onClick={() => irA("/")}
          className="flex h-14 items-center justify-center rounded-full px-2 sm:h-16 sm:px-3"
        >
          {/* LogoClub.png es el wordmark completo (726x194, fondo blanco —
            se ve bien sobre el dock, que también es blanco), no un ícono
            cuadrado como el Logo.png anterior, así que el slot ya no
            tiene un ancho fijo: se deja auto-ancho según su relación de
            aspecto. */}
          <Image
            src="/LogoClub.png"
            alt=""
            width={726}
            height={194}
            className="h-7 w-auto sm:h-11"
          />
        </Link>

        <div className="mx-0.5 w-px self-stretch bg-casi-negro/10" />

        {NAV_ITEMS.map((item) => {
          const activo =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.etiqueta}
              onClick={() => irA(item.href)}
              className={
                activo
                  ? "flex h-14 w-12 flex-col items-center justify-center gap-1 rounded-full bg-naranja text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)] sm:h-16 sm:w-[104px]"
                  : "flex h-14 w-12 flex-col items-center justify-center gap-1 rounded-full bg-white text-casi-negro sm:h-16 sm:w-[104px]"
              }
            >
              {item.icono}
              <span className="hidden font-display text-[11px] font-extrabold uppercase tracking-wide sm:block">
                {item.etiqueta}
              </span>
            </Link>
          );
        })}

        {cerrarSesionAction ? (
          <>
            <div className="mx-0.5 w-px self-stretch bg-casi-negro/10" />

            <form action={cerrarSesionAction}>
              <button
                type="submit"
                aria-label="Cerrar sesión"
                className="flex h-14 w-12 items-center justify-center rounded-full bg-casi-negro/5 text-casi-negro sm:h-16 sm:w-14"
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
          </>
        ) : null}
      </nav>
    </>
  );
}
