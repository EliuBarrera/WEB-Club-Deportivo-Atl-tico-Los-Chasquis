"use client";

import { useEffect, useState } from "react";

// Estado del loader de transición para un dock: se activa con `irA(href)`
// al hacer clic en un link hacia otra ruta y se apaga cuando `pathname`
// cambia, ajustado durante el render (no en un efecto) para evitar el
// parpadeo de un ciclo extra:
// https://react.dev/learn/you-might-not-need-an-effect
// El timeout es un respaldo por si la navegación nunca resuelve (ruta
// rota, error de red): evita que el loader quede pegado en pantalla.
export function useLoaderTransicion(pathname: string) {
  const [navState, setNavState] = useState({ pathname, navegando: false });

  if (navState.pathname !== pathname) {
    setNavState({ pathname, navegando: false });
  }
  const navegando = navState.navegando;

  useEffect(() => {
    if (!navegando) return;
    const id = setTimeout(
      () => setNavState((s) => ({ ...s, navegando: false })),
      4000,
    );
    return () => clearTimeout(id);
  }, [navegando]);

  function irA(href: string) {
    if (href !== pathname) setNavState({ pathname, navegando: true });
  }

  return { navegando, irA };
}

// Loader que se muestra sobre el contenido mientras se navega de una
// página a otra usando un dock (ver PublicDock.tsx y admin/Dock.tsx), o
// mientras se procesa un login. Se renderiza como hermano de <nav> (no
// dentro de ella) porque el dock tiene un -translate-x-1/2, y un
// position:fixed dentro de un ancestro con transform queda contenido por
// ese ancestro en vez de cubrir todo el viewport.
export function LoaderTransicion({
  activo,
  mensaje,
}: {
  activo: boolean;
  mensaje?: string;
}) {
  if (!activo) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-casi-negro/15 p-4"
    >
      <div className="flex flex-col items-center gap-3 rounded-[20px] bg-white px-8 py-7 shadow-[0_10px_30px_rgba(28,13,10,0.25)]">
        <svg className="pl h-16 w-16" viewBox="0 0 128 128">
          <defs>
            <linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                style={{
                  stopColor:
                    "color-mix(in srgb, var(--color-naranja) 55%, white)",
                }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "var(--color-naranja)" }}
              />
            </linearGradient>
          </defs>
          <circle
            className="pl__ring"
            r="56"
            cx="64"
            cy="64"
            fill="none"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            className="pl__worm"
            d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z"
            fill="none"
            stroke="url(#pl-grad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="44 1111"
            strokeDashoffset="10"
          />
        </svg>
        {mensaje ? (
          <span className="font-display text-base font-bold uppercase text-casi-negro">
            {mensaje}
          </span>
        ) : (
          <span className="sr-only">Cargando…</span>
        )}
      </div>
    </div>
  );
}
