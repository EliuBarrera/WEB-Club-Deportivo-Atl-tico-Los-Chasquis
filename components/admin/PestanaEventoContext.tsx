"use client";

import { createContext, useCallback, useContext, useState } from "react";

// Pestaña activa del editor de eventos, por evento. Vive en el layout de
// /admin/eventos y no en EventoEditor porque cada guardado redirige a la
// misma página con otros search params (`guardado`, `t`), lo que vuelve a
// montar la página y perdería la pestaña; el layout no se re-monta en esas
// navegaciones, así que el admin se queda en la sección donde estaba.
type ContextoPestana = {
  pestanaDe: (eventoId: string) => string | undefined;
  cambiarPestana: (eventoId: string, pestana: string) => void;
};

const PestanaEventoContext = createContext<ContextoPestana | null>(null);

export function PestanaEventoProvider({ children }: { children: React.ReactNode }) {
  const [pestanas, setPestanas] = useState<Record<string, string>>({});

  const pestanaDe = useCallback((eventoId: string) => pestanas[eventoId], [pestanas]);
  const cambiarPestana = useCallback((eventoId: string, pestana: string) => {
    setPestanas((actuales) => ({ ...actuales, [eventoId]: pestana }));
  }, []);

  return (
    <PestanaEventoContext.Provider value={{ pestanaDe, cambiarPestana }}>
      {children}
    </PestanaEventoContext.Provider>
  );
}

export function usePestanaEvento<T extends string>(eventoId: string, inicial: T) {
  const contexto = useContext(PestanaEventoContext);
  const [local, setLocal] = useState<T>(inicial);
  // Sin provider (no debería pasar) se comporta como un useState normal.
  if (!contexto) return [local, setLocal] as const;
  const pestana = (contexto.pestanaDe(eventoId) as T | undefined) ?? inicial;
  const setPestana = (nueva: T) => contexto.cambiarPestana(eventoId, nueva);
  return [pestana, setPestana] as const;
}
