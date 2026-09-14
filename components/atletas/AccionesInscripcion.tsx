"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EstadoPago } from "@prisma/client";

type ResultadoWidgetWompi = {
  transaction: { id: string; status: string; reference: string };
};

declare global {
  interface Window {
    WidgetCheckout?: new (opciones: {
      currency: "COP";
      amountInCents: number;
      reference: string;
      publicKey: string;
      signature: { integrity: string };
    }) => { open: (callback: (resultado: ResultadoWidgetWompi) => void) => void };
  }
}

const INTENTOS_POLLING = 5;
const INTERVALO_POLLING_MS = 3000;

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Botones de acción por inscripción en /atletas (Fase 10, backlog):
// reintentar pago (reabre el widget de Wompi, mismo patrón de carga manual
// del script y de sondeo post-pago que components/eventos/FormularioInscripcion.tsx,
// pero recalculando la firma contra app/api/atletas/inscripciones/[id]/pago
// en vez de tenerla ya en memoria) o descargar el certificado (enlace
// directo — la cookie de sesión viaja sola en la navegación).
export function AccionesInscripcion({
  inscripcionId,
  estadoPago,
}: {
  inscripcionId: string;
  estadoPago: EstadoPago;
}) {
  const router = useRouter();
  const [widgetListo, setWidgetListo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeReintentar = estadoPago !== "APROBADO";

  useEffect(() => {
    if (!puedeReintentar) return;
    if (window.WidgetCheckout) {
      // Ver la misma nota en FormularioInscripcion.tsx: setState síncrono
      // dentro del efecto dispara el lint de react-hooks (cascading
      // renders), se difiere con queueMicrotask.
      queueMicrotask(() => setWidgetListo(true));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.async = true;
    script.onload = () => setWidgetListo(true);
    document.body.appendChild(script);
  }, [puedeReintentar]);

  async function verificarPago(wompiTransactionId?: string) {
    setVerificando(true);
    try {
      for (let intento = 0; intento < INTENTOS_POLLING; intento++) {
        const url = wompiTransactionId
          ? `/api/inscripciones/${inscripcionId}?tx=${wompiTransactionId}`
          : `/api/inscripciones/${inscripcionId}`;
        const respuesta = await fetch(url);
        if (respuesta.ok) {
          const datos = await respuesta.json();
          if (datos.estadoPago !== "PENDIENTE") break;
        }
        await esperar(INTERVALO_POLLING_MS);
      }
    } finally {
      setVerificando(false);
      router.refresh();
    }
  }

  async function reintentarPago() {
    setError(null);
    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
    if (!window.WidgetCheckout || !publicKey) {
      setError("No se pudo iniciar el pago, intenta de nuevo.");
      return;
    }

    setCargando(true);
    try {
      const respuesta = await fetch(
        `/api/atletas/inscripciones/${inscripcionId}/pago`,
        { method: "POST" }
      );
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(datos.error ?? "No se pudo iniciar el pago.");
        return;
      }

      const checkout = new window.WidgetCheckout({
        currency: "COP",
        amountInCents: datos.totalPago * 100,
        reference: inscripcionId,
        publicKey,
        signature: { integrity: datos.firmaIntegridad },
      });
      checkout.open((resultado) => {
        void verificarPago(resultado.transaction?.id);
      });
    } catch {
      setError("No se pudo conectar con el servidor, intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  if (!puedeReintentar) {
    return (
      <a
        href={`/api/atletas/inscripciones/${inscripcionId}/certificado`}
        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-display text-xs font-bold uppercase text-casi-negro shadow-[0_4px_12px_rgba(28,13,10,0.14)] transition-colors hover:bg-casi-negro hover:text-white"
      >
        Descargar certificado
      </a>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <button
        type="button"
        onClick={reintentarPago}
        disabled={!widgetListo || cargando || verificando}
        className="inline-flex items-center gap-2 rounded-full bg-naranja px-4 py-1.5 font-display text-xs font-bold uppercase text-white shadow-[0_4px_12px_rgba(241,88,8,0.3)] transition-colors hover:bg-casi-negro disabled:cursor-not-allowed disabled:opacity-50"
      >
        {verificando
          ? "Verificando pago…"
          : cargando
            ? "Abriendo pago…"
            : "Reintentar pago"}
      </button>
      {error ? <p className="text-xs text-naranja">{error}</p> : null}
    </div>
  );
}
