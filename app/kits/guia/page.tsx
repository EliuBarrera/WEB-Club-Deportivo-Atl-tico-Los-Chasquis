import type { Metadata } from "next";
import { GuiaEntregaKits } from "@/components/admin/GuiaEntregaKits";

export const metadata: Metadata = {
  title: "Guía de entrega de kits · Club Los Chasquis",
  robots: { index: false, follow: false },
};

// Guía para voluntarios (Fase 13.2), pública y sin datos: se manda junto
// con el enlace de entrega para que la lean antes del evento. La misma
// guía va desplegable dentro de /kits/[token]. Al ser un segmento
// estático tiene prioridad sobre /kits/[token] (un token nunca es "guia").
export default function GuiaEntregaKitsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 bg-casi-negro px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-4xl font-black uppercase text-crema">
          Entrega de kits
        </h1>
        <p className="text-crema/80">
          Lo básico para entregar los kits desde tu celular. No necesitas
          cuenta: solo el enlace que te manda la organización.
        </p>
      </div>
      <div className="rounded-[20px] bg-white p-5">
        <GuiaEntregaKits />
      </div>
    </main>
  );
}
