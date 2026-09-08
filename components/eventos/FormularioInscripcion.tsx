"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EventoPublicado, TerminosVigente } from "@/lib/eventos";
import { formatPrecio } from "@/lib/format";
import { ModalTerminos } from "./ModalTerminos";

type ResultadoWidgetWompi = {
  transaction: { id: string; status: string; reference: string };
};

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
    WidgetCheckout?: new (opciones: {
      currency: "COP";
      amountInCents: number;
      reference: string;
      publicKey: string;
      signature: { integrity: string };
    }) => { open: (callback: (resultado: ResultadoWidgetWompi) => void) => void };
  }
}

// Sondeo del estado de pago tras volver del widget: unos medios de pago de
// Wompi son asíncronos, así que el resultado del callback no siempre es
// definitivo de inmediato.
const INTENTOS_POLLING = 5;
const INTERVALO_POLLING_MS = 3000;

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const TIPOS_DOCUMENTO = [
  { valor: "RC", etiqueta: "Registro Civil" },
  { valor: "TI", etiqueta: "Tarjeta de Identidad" },
  { valor: "CC", etiqueta: "Cédula de Ciudadanía" },
  { valor: "CE", etiqueta: "Cédula de Extranjería" },
  { valor: "PA", etiqueta: "Pasaporte" },
] as const;

function calcularEdad(fechaNacimiento: string, fechaEvento: Date): number | null {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(`${fechaNacimiento}T00:00:00Z`);
  if (Number.isNaN(nacimiento.getTime())) return null;
  let edad = fechaEvento.getUTCFullYear() - nacimiento.getUTCFullYear();
  const noHaCumplidoAnios =
    fechaEvento.getUTCMonth() < nacimiento.getUTCMonth() ||
    (fechaEvento.getUTCMonth() === nacimiento.getUTCMonth() &&
      fechaEvento.getUTCDate() < nacimiento.getUTCDate());
  if (noHaCumplidoAnios) edad -= 1;
  return edad;
}

// Parsea el campo de texto libre `categoria.nacimiento` (ej. "2014-2013",
// "1976 o anterior") para poder sugerir la categoría a partir del año de
// nacimiento. Solo se usa como ayuda de UX (preselecciona el select, que
// sigue siendo editable) — el servidor no depende de este parseo porque
// el formato varía entre eventos y no es confiable para bloquear el
// envío (ver Fase 4 en el plan de desarrollo).
function rangoAnios(nacimiento: string): { min: number; max: number } | null {
  const rango = nacimiento.match(/^(\d{4})\s*-\s*(\d{4})$/);
  if (rango) {
    const a = Number(rango[1]);
    const b = Number(rango[2]);
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }
  const anterior = nacimiento.match(/^(\d{4})\s+o\s+anterior$/i);
  if (anterior) {
    return { min: -Infinity, max: Number(anterior[1]) };
  }
  return null;
}

function sugerirCategoriaPorNacimiento(
  anioNacimiento: number,
  categorias: EventoPublicado["categorias"]
) {
  return categorias.find((c) => {
    const rango = rangoAnios(c.nacimiento);
    return rango && anioNacimiento >= rango.min && anioNacimiento <= rango.max;
  });
}

function Campo({
  etiqueta,
  children,
  error,
}: {
  etiqueta: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
        {etiqueta}
      </span>
      {children}
      {error ? <span className="text-sm text-naranja">{error}</span> : null}
    </label>
  );
}

const inputClase =
  "rounded-lg bg-casi-negro/[0.045] px-3 py-2 text-lg outline-none focus:bg-white focus:shadow-[0_0_0_2px_rgba(241,88,8,0.4)]";

export function FormularioInscripcion({
  evento,
  terminos,
  onCancelar,
}: {
  evento: EventoPublicado;
  terminos: TerminosVigente;
  onCancelar: () => void;
}) {
  const usaCategorias = evento.categorias.length > 0;
  const usaCostos = !usaCategorias && evento.costos.length > 0;

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<string>("CC");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [genero, setGenero] = useState<string>("MASCULINO");

  // `null` = sin elección manual: se usa la categoría sugerida según la
  // fecha de nacimiento. Se guarda aparte (en vez de escribir la
  // sugerencia directamente en el estado) para no pisar una elección
  // manual del atleta mientras no cambie la fecha de nacimiento.
  const [categoriaIdManual, setCategoriaIdManual] = useState<string | null>(
    null
  );
  const [pruebasIds, setPruebasIds] = useState<string[]>([]);
  const [costoId, setCostoId] = useState("");

  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [club, setClub] = useState("");
  const [condicionesMedicas, setCondicionesMedicas] = useState("");

  const [nombresAcudiente, setNombresAcudiente] = useState("");
  const [apellidosAcudiente, setApellidosAcudiente] = useState("");
  const [documentoAcudiente, setDocumentoAcudiente] = useState("");
  const [celularAcudiente, setCelularAcudiente] = useState("");

  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaImagenes, setAceptaImagenes] = useState(false);
  const [modalTerminosAbierto, setModalTerminosAbierto] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [inscripcionId, setInscripcionId] = useState<string | null>(null);
  const [totalPago, setTotalPago] = useState<number | null>(null);
  const [firmaIntegridad, setFirmaIntegridad] = useState<string | null>(null);
  const [estadoPago, setEstadoPago] = useState<
    "PENDIENTE" | "APROBADO" | "RECHAZADO" | "DECLINADO" | "ERROR" | null
  >(null);
  const [verificandoPago, setVerificandoPago] = useState(false);
  const [widgetWompiListo, setWidgetWompiListo] = useState(false);

  // Carga manual del widget de Wompi (en vez de next/script): con
  // next/script el `<link rel=preload>` que genera para este script se
  // quedaba sin usar (el navegador nunca disparaba la carga real), así que
  // `window.WidgetCheckout` nunca quedaba definido y el botón de pago se
  // quedaba en "Cargando pasarela de pago..." para siempre.
  useEffect(() => {
    if (!inscripcionId) return;
    if (window.WidgetCheckout) {
      queueMicrotask(() => setWidgetWompiListo(true));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.async = true;
    script.onload = () => setWidgetWompiListo(true);
    script.onerror = () =>
      setError(
        "No se pudo cargar la pasarela de pago. Si tienes un bloqueador de anuncios activo, desactívalo para este sitio e intenta de nuevo."
      );
    document.body.appendChild(script);
  }, [inscripcionId]);

  const categoriaSugerida = useMemo(() => {
    if (!fechaNacimiento) return undefined;
    const anio = new Date(`${fechaNacimiento}T00:00:00Z`).getUTCFullYear();
    if (Number.isNaN(anio)) return undefined;
    return sugerirCategoriaPorNacimiento(anio, evento.categorias);
  }, [fechaNacimiento, evento.categorias]);

  const categoriaId = categoriaIdManual ?? categoriaSugerida?.id ?? "";

  const categoriaSeleccionada = useMemo(
    () => evento.categorias.find((c) => c.id === categoriaId),
    [evento.categorias, categoriaId]
  );

  const pruebasDisponibles = useMemo(() => {
    if (!categoriaSeleccionada) return [];
    return categoriaSeleccionada.pruebas.filter(
      (cp) => cp.prueba.genero === null || cp.prueba.genero === genero
    );
  }, [categoriaSeleccionada, genero]);

  const edad = useMemo(
    () => calcularEdad(fechaNacimiento, evento.fecha),
    [fechaNacimiento, evento.fecha]
  );
  const esMenorDeEdad = edad !== null && edad < 18;

  const precioPreview = usaCategorias
    ? Math.max(0, evento.precio - evento.descuento)
    : usaCostos
      ? (evento.costos.find((c) => c.id === costoId)?.valor ?? null)
      : null;

  function alternarPrueba(key: string) {
    setPruebasIds((actual) => {
      if (actual.includes(key)) return actual.filter((k) => k !== key);
      if (actual.length >= 2) return actual;
      return [...actual, key];
    });
  }

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

  const puedeInscribirse = usaCategorias || usaCostos;

  async function enviar(evt: React.FormEvent) {
    evt.preventDefault();
    if (!turnstileToken) {
      setError("Completa la verificación de seguridad antes de enviar.");
      return;
    }

    setEnviando(true);
    setError(null);
    setFieldErrors({});

    try {
      const respuesta = await fetch("/api/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventoId: evento.id,
          turnstileToken,
          nombres,
          apellidos,
          tipoDocumento,
          numeroDocumento,
          fechaNacimiento,
          genero,
          categoriaId: usaCategorias ? categoriaId : undefined,
          pruebasIds: usaCategorias ? pruebasIds : [],
          costoId: usaCostos ? costoId : undefined,
          celular,
          email,
          ciudad,
          departamento,
          club: club || undefined,
          condicionesMedicas: condicionesMedicas || undefined,
          nombresAcudiente: esMenorDeEdad ? nombresAcudiente : undefined,
          apellidosAcudiente: esMenorDeEdad ? apellidosAcudiente : undefined,
          documentoAcudiente: esMenorDeEdad ? documentoAcudiente : undefined,
          celularAcudiente: esMenorDeEdad ? celularAcudiente : undefined,
          aceptaTerminos,
          aceptaImagenes,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error ?? "No se pudo completar la inscripción");
        setFieldErrors(datos.fieldErrors ?? {});
        if (respuesta.status === 403 && widgetIdRef.current) {
          window.turnstile?.reset(widgetIdRef.current);
          setTurnstileToken(null);
        }
        return;
      }

      setInscripcionId(datos.id);
      setTotalPago(datos.totalPago);
      setFirmaIntegridad(datos.firmaIntegridad);
      setEstadoPago("PENDIENTE");
    } catch {
      setError("No se pudo conectar con el servidor, intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  // Consulta el estado de pago hasta `INTENTOS_POLLING` veces: algunos
  // medios de pago de Wompi confirman de forma asíncrona, así que el
  // resultado del callback del widget no siempre es definitivo.
  async function verificarPago(id: string, wompiTransactionId?: string) {
    setVerificandoPago(true);
    try {
      for (let intento = 0; intento < INTENTOS_POLLING; intento++) {
        const url = wompiTransactionId
          ? `/api/inscripciones/${id}?tx=${wompiTransactionId}`
          : `/api/inscripciones/${id}`;
        const respuesta = await fetch(url);
        if (respuesta.ok) {
          const datos = await respuesta.json();
          setEstadoPago(datos.estadoPago);
          if (datos.estadoPago !== "PENDIENTE") return;
        }
        await esperar(INTERVALO_POLLING_MS);
      }
    } finally {
      setVerificandoPago(false);
    }
  }

  function abrirWidgetPago() {
    setError(null);
    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
    if (
      !window.WidgetCheckout ||
      !publicKey ||
      !inscripcionId ||
      !firmaIntegridad ||
      totalPago === null
    ) {
      setError("No se pudo iniciar el pago, intenta de nuevo.");
      return;
    }

    try {
      const checkout = new window.WidgetCheckout({
        currency: "COP",
        amountInCents: totalPago * 100,
        reference: inscripcionId,
        publicKey,
        signature: { integrity: firmaIntegridad },
      });

      checkout.open((resultado) => {
        void verificarPago(inscripcionId, resultado.transaction?.id);
      });
    } catch (error) {
      console.error("Error abriendo el widget de Wompi:", error);
      setError(
        "No se pudo abrir la pasarela de pago. Si tienes un bloqueador de anuncios activo, desactívalo para este sitio e intenta de nuevo."
      );
    }
  }

  if (inscripcionId) {
    const pagoRechazado =
      estadoPago === "RECHAZADO" ||
      estadoPago === "DECLINADO" ||
      estadoPago === "ERROR";

    return (
      <div className="flex flex-col gap-4 rounded-[20px] bg-white p-6 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
        <h3 className="font-display text-2xl font-extrabold uppercase">
          {estadoPago === "APROBADO"
            ? "¡Pago aprobado!"
            : "¡Inscripción registrada!"}
        </h3>

        <p className="text-lg leading-relaxed">
          Tu inscripción a <strong>{evento.titulo}</strong> quedó registrada
          con número de referencia: <span className="font-mono font-bold italic text-naranja">{inscripcionId}</span>.
        </p>

        {error ? <p className="text-base font-bold text-naranja">{error}</p> : null}

        {estadoPago === "APROBADO" && (
          <p className="rounded-xl bg-green-50 p-4 text-lg font-bold text-green-800">
            Tu pago de {totalPago !== null && formatPrecio(totalPago)} fue
            aprobado. ¡Nos vemos en la línea de salida!
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {pagoRechazado && (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-red-50 p-4">
              <p className="text-lg font-bold text-red-800">
                Tu pago no pudo procesarse. Puedes intentarlo de nuevo.
              </p>
              <button
                type="button"
                onClick={abrirWidgetPago}
                className="mx-auto w-64 justify-center rounded-full bg-white px-5 py-2 text-center font-display font-bold uppercase text-casi-negro shadow-[0_4px_12px_rgba(28,13,10,0.14)] transition-colors hover:bg-casi-negro hover:text-white"
              >
                Reintentar pago
              </button>
            </div>
          )}

          {estadoPago === "PENDIENTE" && !verificandoPago && (
            <button
              type="button"
              onClick={abrirWidgetPago}
              disabled={!widgetWompiListo}
              className="mx-auto w-64 justify-center rounded-full bg-naranja px-6 py-3 text-center font-display text-lg font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)] transition-colors hover:bg-casi-negro disabled:cursor-not-allowed disabled:opacity-50"
            >
              {widgetWompiListo
                ? `Pagar ${totalPago !== null ? formatPrecio(totalPago) : ""} ahora`
                : "Cargando pasarela de pago…"}
            </button>
          )}

          {verificandoPago && (
            <p className="text-lg font-bold">
              Verificando tu pago, un momento…
            </p>
          )}

          <button
            type="button"
            onClick={onCancelar}
            className="mx-auto w-64 justify-center rounded-full bg-white px-5 py-2 text-center font-display font-bold uppercase text-casi-negro shadow-[0_4px_12px_rgba(28,13,10,0.14)] transition-colors hover:bg-casi-negro hover:text-white"
          >
            Volver
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="flex w-full flex-col rounded-[20px] bg-white p-4 shadow-[0_10px_30px_rgba(28,13,10,0.10)] sm:p-6">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onReady={renderTurnstile}
      />

      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl font-extrabold uppercase">
          Formulario de inscripción
        </h3>
        <button
          type="button"
          onClick={onCancelar}
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-white px-4 py-1.5 font-display text-sm font-bold uppercase text-casi-negro shadow-[0_4px_12px_rgba(28,13,10,0.14)] transition-colors hover:bg-casi-negro hover:text-white"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver al detalle
        </button>
      </div>

      {!puedeInscribirse ? (
        <p className="rounded-xl border-2 border-dashed border-gris-oscuro p-4 text-lg italic text-gris-oscuro">
          Este evento aún no tiene inscripciones configuradas.
        </p>
      ) : (
        <form onSubmit={enviar} className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 font-display text-lg font-bold uppercase">
              Datos del atleta
            </legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo etiqueta="Nombres" error={fieldErrors.nombres?.[0]}>
                <input
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  className={inputClase}
                />
              </Campo>
              <Campo etiqueta="Apellidos" error={fieldErrors.apellidos?.[0]}>
                <input
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  className={inputClase}
                />
              </Campo>
              <Campo etiqueta="Tipo de documento">
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className={inputClase}
                >
                  {TIPOS_DOCUMENTO.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.etiqueta}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo
                etiqueta="Número de documento"
                error={fieldErrors.numeroDocumento?.[0]}
              >
                <input
                  required
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  className={inputClase}
                />
              </Campo>
              <Campo
                etiqueta="Fecha de nacimiento"
                error={fieldErrors.fechaNacimiento?.[0]}
              >
                <input
                  required
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => {
                    setFechaNacimiento(e.target.value);
                    // Vuelve a dejar que la categoría se elija por fecha
                    // de nacimiento en vez de conservar una elección
                    // manual anterior, que pudo corresponder a otra edad.
                    setCategoriaIdManual(null);
                    setPruebasIds([]);
                  }}
                  className={inputClase}
                />
              </Campo>
              <Campo etiqueta="Género">
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  className={inputClase}
                >
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                </select>
              </Campo>
            </div>
          </fieldset>

          {usaCategorias ? (
            <fieldset className="flex flex-col gap-4">
              <legend className="mb-1 font-display text-lg font-bold uppercase">
                Categoría y pruebas
              </legend>
              <Campo etiqueta="Categoría" error={fieldErrors.categoriaId?.[0]}>
                <select
                  required
                  value={categoriaId}
                  onChange={(e) => {
                    setCategoriaIdManual(e.target.value);
                    setPruebasIds([]);
                  }}
                  className={inputClase}
                >
                  <option value="">Selecciona una categoría</option>
                  {evento.categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.edad})
                    </option>
                  ))}
                </select>
                {categoriaIdManual === null && categoriaSugerida ? (
                  <span className="text-sm text-gris-oscuro">
                    Sugerida según la fecha de nacimiento — puedes cambiarla
                    si no aplica.
                  </span>
                ) : null}
              </Campo>

              {categoriaSeleccionada && pruebasDisponibles.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
                    Pruebas (máximo 2)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {pruebasDisponibles.map((cp) => {
                      const seleccionada = pruebasIds.includes(cp.prueba.key);
                      const deshabilitada =
                        !seleccionada && pruebasIds.length >= 2;
                      return (
                        <label
                          key={cp.prueba.key}
                          className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-base font-semibold ${
                            seleccionada
                              ? "bg-naranja/10 text-naranja shadow-[0_2px_8px_rgba(241,88,8,0.25)]"
                              : "bg-casi-negro/5 text-gris-oscuro"
                          } ${deshabilitada ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={seleccionada}
                            disabled={deshabilitada}
                            onChange={() => alternarPrueba(cp.prueba.key)}
                          />
                          {cp.prueba.icon ? (
                            <span aria-hidden>{cp.prueba.icon}</span>
                          ) : null}
                          {cp.prueba.nombre}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </fieldset>
          ) : null}

          {usaCostos ? (
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 font-display text-lg font-bold uppercase">
                Tipo de inscripción
              </legend>
              {evento.costos.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 shadow-[0_6px_16px_rgba(28,13,10,0.08)]"
                >
                  <span className="flex items-center gap-2 font-semibold capitalize">
                    <input
                      type="radio"
                      name="costo"
                      required
                      checked={costoId === c.id}
                      onChange={() => setCostoId(c.id)}
                    />
                    {c.tipo}
                  </span>
                  <span className="font-display text-xl font-extrabold">
                    {formatPrecio(c.valor)}
                  </span>
                </label>
              ))}
            </fieldset>
          ) : null}

          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 font-display text-lg font-bold uppercase">
              Contacto
            </legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo etiqueta="Celular" error={fieldErrors.celular?.[0]}>
                <input
                  required
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className={inputClase}
                />
              </Campo>
              <Campo etiqueta="Correo electrónico" error={fieldErrors.email?.[0]}>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClase}
                />
              </Campo>
              <Campo etiqueta="Ciudad" error={fieldErrors.ciudad?.[0]}>
                <input
                  required
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  className={inputClase}
                />
              </Campo>
              <Campo
                etiqueta="Departamento"
                error={fieldErrors.departamento?.[0]}
              >
                <input
                  required
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  className={inputClase}
                />
              </Campo>
              <Campo etiqueta="Club (opcional)">
                <input
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                  className={inputClase}
                />
              </Campo>
            </div>
            <Campo etiqueta="Condiciones médicas (opcional)">
              <textarea
                value={condicionesMedicas}
                onChange={(e) => setCondicionesMedicas(e.target.value)}
                className={`${inputClase} min-h-[80px]`}
              />
            </Campo>
          </fieldset>

          {esMenorDeEdad ? (
            <fieldset className="flex flex-col gap-4 rounded-xl border-2 border-dashed border-naranja p-4">
              <legend className="mb-1 font-display text-lg font-bold uppercase text-naranja">
                Datos del acudiente (atleta menor de edad)
              </legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo etiqueta="Nombres del acudiente">
                  <input
                    required
                    value={nombresAcudiente}
                    onChange={(e) => setNombresAcudiente(e.target.value)}
                    className={inputClase}
                  />
                </Campo>
                <Campo etiqueta="Apellidos del acudiente">
                  <input
                    required
                    value={apellidosAcudiente}
                    onChange={(e) => setApellidosAcudiente(e.target.value)}
                    className={inputClase}
                  />
                </Campo>
                <Campo etiqueta="Documento del acudiente">
                  <input
                    required
                    value={documentoAcudiente}
                    onChange={(e) => setDocumentoAcudiente(e.target.value)}
                    className={inputClase}
                  />
                </Campo>
                <Campo etiqueta="Celular del acudiente">
                  <input
                    required
                    value={celularAcudiente}
                    onChange={(e) => setCelularAcudiente(e.target.value)}
                    className={inputClase}
                  />
                </Campo>
              </div>
            </fieldset>
          ) : null}

          <fieldset className="flex flex-col gap-2">
            <label className="flex items-start gap-2 text-lg">
              <input
                required
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="mt-1"
              />
              <span>
                Acepto los{" "}
                <button
                  type="button"
                  onClick={() => setModalTerminosAbierto(true)}
                  className="font-semibold underline"
                >
                  términos y condiciones
                </button>{" "}
                y la política de tratamiento de datos personales.
              </span>
            </label>
            <label className="flex items-start gap-2 text-lg">
              <input
                type="checkbox"
                checked={aceptaImagenes}
                onChange={(e) => setAceptaImagenes(e.target.checked)}
                className="mt-1"
              />
              <span>
                Autorizo el uso de mis imágenes y videos tomados durante el
                evento con fines promocionales del club.
              </span>
            </label>
          </fieldset>

          <div ref={turnstileContainerRef} />

          {precioPreview !== null ? (
            <p className="font-display text-2xl font-extrabold">
              Total a pagar: {formatPrecio(precioPreview)}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-xl bg-naranja/10 p-3 text-lg font-semibold text-naranja">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={enviando || !aceptaTerminos || !turnstileToken}
            className="w-full rounded-full bg-naranja py-3 font-display text-xl font-bold uppercase tracking-wide text-crema disabled:cursor-not-allowed disabled:bg-gris-oscuro"
          >
            {enviando ? "Enviando…" : "Enviar inscripción"}
          </button>
        </form>
      )}

      <ModalTerminos
        abierto={modalTerminosAbierto}
        onCerrar={() => setModalTerminosAbierto(false)}
        contenido={terminos?.contenido ?? null}
        version={terminos?.version ?? null}
        evento={{
          kit: evento.logistica?.kit ?? [],
          premiosEfectivo: Boolean(evento.premios?.efectivoUrl),
        }}
      />
    </div>
  );
}
