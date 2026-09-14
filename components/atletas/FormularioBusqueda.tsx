"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const inputClase =
  "rounded-lg bg-casi-negro/[0.045] px-3 py-2 text-lg outline-none focus:bg-white focus:shadow-[0_0_0_2px_rgba(241,88,8,0.4)]";

// Formulario de identificación de /atletas (Fase 10): mismo criterio de
// protección que components/eventos/FormularioInscripcion.tsx (Turnstile
// server-verificado, rate limit por IP en el endpoint). No hay cuenta ni
// contraseña — solo confirma que quien pregunta ya conoce esos dos datos
// (los mismos que dio al inscribirse).
export function FormularioBusqueda() {
  const router = useRouter();
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const widgetIdRef = useRef<string | undefined>(undefined);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  function renderTurnstile() {
    if (!window.turnstile || !turnstileContainerRef.current) return;
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!sitekey) {
      console.error("NEXT_PUBLIC_TURNSTILE_SITE_KEY no está configurada");
      return;
    }
    turnstileContainerRef.current.innerHTML = "";
    widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey,
      callback: (token) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(null),
      "error-callback": () => setTurnstileToken(null),
    });
  }

  async function enviar(evt: React.FormEvent) {
    evt.preventDefault();
    if (!turnstileToken) {
      setError("Completa la verificación de seguridad antes de enviar.");
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      const respuesta = await fetch("/api/atletas/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroDocumento, email, turnstileToken }),
      });

      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null);
        setError(
          datos?.error ??
            "No encontramos inscripciones con esos datos. Verifica el número de documento y el correo usados al inscribirte."
        );
        window.turnstile?.reset(widgetIdRef.current);
        setTurnstileToken(null);
        return;
      }

      router.refresh();
    } catch {
      setError("No se pudo completar la consulta, intenta de nuevo.");
      window.turnstile?.reset(widgetIdRef.current);
      setTurnstileToken(null);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-5 rounded-[20px] bg-white p-6 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onReady={renderTurnstile}
      />

      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-extrabold uppercase">
          Mis inscripciones
        </h2>
        <p className="text-sm text-gris-oscuro">
          Ingresa el número de documento y el correo que usaste al
          inscribirte para ver tus inscripciones.
        </p>
      </div>

      <form onSubmit={enviar} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
            Número de documento
          </span>
          <input
            type="text"
            required
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)}
            className={inputClase}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
            Correo electrónico
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClase}
          />
        </label>

        <div ref={turnstileContainerRef} />

        {error ? <p className="text-sm text-naranja">{error}</p> : null}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-full bg-naranja py-3 font-display text-xl font-bold uppercase tracking-wide text-crema disabled:cursor-not-allowed disabled:bg-gris-oscuro"
        >
          {enviando ? "Buscando..." : "Ver mis inscripciones"}
        </button>
      </form>
    </div>
  );
}
