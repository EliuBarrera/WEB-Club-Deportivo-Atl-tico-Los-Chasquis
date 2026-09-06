"use client";

import Script from "next/script";
import { useMemo, useRef, useState } from "react";
import type { EventoPublicado } from "@/lib/eventos";
import { formatPrecio } from "@/lib/format";

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
  "rounded-lg border-2 border-casi-negro bg-white px-3 py-2 text-lg outline-none focus:border-naranja";

export function FormularioInscripcion({
  evento,
  onCancelar,
}: {
  evento: EventoPublicado;
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

  const [categoriaId, setCategoriaId] = useState("");
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

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [inscripcionId, setInscripcionId] = useState<string | null>(null);

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
    } catch {
      setError("No se pudo conectar con el servidor, intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (inscripcionId) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border-2 border-casi-negro bg-crema p-6">
        <h3 className="font-display text-2xl font-extrabold uppercase">
          ¡Inscripción registrada!
        </h3>
        <p className="text-lg leading-relaxed">
          Tu inscripción a <strong>{evento.titulo}</strong> quedó registrada
          en estado <strong>pendiente de pago</strong>. El pago en línea se
          habilita en una próxima fase — por ahora guarda este número de
          referencia:
        </p>
        <p className="font-mono text-base">{inscripcionId}</p>
        <button
          type="button"
          onClick={onCancelar}
          className="w-fit rounded-full border-[3px] border-casi-negro bg-white px-5 py-2 font-display font-bold uppercase text-casi-negro transition-colors hover:bg-casi-negro hover:text-white"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col rounded-2xl border-2 border-casi-negro bg-casi-negro/5 p-4 sm:p-6">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onReady={renderTurnstile}
      />

      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-2xl font-extrabold uppercase">
          Formulario de inscripción
        </h3>
        <button
          type="button"
          onClick={onCancelar}
          className="font-display text-sm font-bold uppercase text-gris-oscuro underline"
        >
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
                  onChange={(e) => setFechaNacimiento(e.target.value)}
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
                    setCategoriaId(e.target.value);
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
                          className={`flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-2 text-base font-semibold ${
                            seleccionada
                              ? "border-naranja bg-naranja/10 text-naranja"
                              : "border-casi-negro/30 text-gris-oscuro"
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
                  className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 border-casi-negro bg-white px-4 py-3"
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
                Acepto los términos y condiciones{" "}
                {evento.terminosUrl ? (
                  <a
                    href={evento.terminosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    (ver documento)
                  </a>
                ) : null}{" "}
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
            <p className="rounded-xl border-2 border-naranja bg-naranja/10 p-3 text-lg font-semibold text-naranja">
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
    </div>
  );
}
