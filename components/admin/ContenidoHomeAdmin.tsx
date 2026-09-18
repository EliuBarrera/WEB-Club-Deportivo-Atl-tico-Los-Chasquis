"use client";

import { useState } from "react";
import type {
  CifraConfianzaAdmin,
  HitoHistoricoAdmin,
  TestimonioAdmin,
} from "@/lib/admin/dal";
import { CifrasConfianzaAdmin } from "@/components/admin/CifrasConfianzaAdmin";
import { HistoriaAdmin } from "@/components/admin/HistoriaAdmin";
import { TestimoniosAdmin } from "@/components/admin/TestimoniosAdmin";

const TABS = [
  { id: "cifras", label: "Cifras" },
  { id: "historia", label: "Historia" },
  { id: "testimonios", label: "Testimonios" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Componente cliente de /admin/contenido: solo arma las pestañas y delega
// cada una al Admin ya existente (CifrasConfianzaAdmin / HistoriaAdmin /
// TestimoniosAdmin), que no cambiaron — cada uno sigue siendo un CRUD
// independiente con su propia tabla y modal.
export function ContenidoHomeAdmin({
  tabInicial,
  cifras,
  crearCifraAction,
  actualizarCifraAction,
  eliminarCifraAction,
  hitos,
  crearHitoAction,
  actualizarHitoAction,
  eliminarHitoAction,
  testimonios,
  crearTestimonioAction,
  actualizarTestimonioAction,
  eliminarTestimonioAction,
}: {
  tabInicial: TabId;
  cifras: CifraConfianzaAdmin[];
  crearCifraAction: (formData: FormData) => Promise<void>;
  actualizarCifraAction: (cifraId: string, formData: FormData) => Promise<void>;
  eliminarCifraAction: (cifraId: string) => Promise<void>;
  hitos: HitoHistoricoAdmin[];
  crearHitoAction: (formData: FormData) => Promise<void>;
  actualizarHitoAction: (hitoId: string, formData: FormData) => Promise<void>;
  eliminarHitoAction: (hitoId: string) => Promise<void>;
  testimonios: TestimonioAdmin[];
  crearTestimonioAction: (formData: FormData) => Promise<void>;
  actualizarTestimonioAction: (
    testimonioId: string,
    formData: FormData
  ) => Promise<void>;
  eliminarTestimonioAction: (testimonioId: string) => Promise<void>;
}) {
  const [tab, setTab] = useState<TabId>(tabInicial);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={
              tab === item.id
                ? "rounded-full bg-naranja px-5 py-2 font-display text-sm font-extrabold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
                : "rounded-full bg-white/10 px-5 py-2 font-display text-sm font-extrabold uppercase text-white/70"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={tab === "cifras" ? "block" : "hidden"}>
        <CifrasConfianzaAdmin
          cifras={cifras}
          crearAction={crearCifraAction}
          actualizarAction={actualizarCifraAction}
          eliminarAction={eliminarCifraAction}
        />
      </div>

      <div className={tab === "historia" ? "block" : "hidden"}>
        <HistoriaAdmin
          hitos={hitos}
          crearAction={crearHitoAction}
          actualizarAction={actualizarHitoAction}
          eliminarAction={eliminarHitoAction}
        />
      </div>

      <div className={tab === "testimonios" ? "block" : "hidden"}>
        <TestimoniosAdmin
          testimonios={testimonios}
          crearAction={crearTestimonioAction}
          actualizarAction={actualizarTestimonioAction}
          eliminarAction={eliminarTestimonioAction}
        />
      </div>
    </div>
  );
}
