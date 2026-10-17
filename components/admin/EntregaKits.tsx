"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import {
  textoHashDocumento,
  type EntregaPendiente,
  type InscripcionKit,
  type ListaKits,
  type ResultadoSincronizacion,
} from "@/lib/kits/tipos";

// Pantalla de entrega de kits (Fase 13.2), la misma para el voluntario sin
// cuenta (/kits/[token]) y para el usuario del panel
// (/admin/entrega-kits/[eventoId]); solo cambian las acciones que recibe.
//
// Pensada para mala señal: al abrir se descarga la lista de aprobados y se
// guarda en localStorage. Escanear, buscar por documento y entregar
// funcionan contra esa copia local; las entregas quedan en cola y se
// mandan al servidor cuando hay señal (cada 15 s y al volver la conexión).
//
// El QR se lee con jsQR sobre frames de la cámara en vez de la API
// BarcodeDetector, que Safari de iPhone no trae.

const INTERVALO_ESCANEO_MS = 250;
const INTERVALO_SINCRONIZACION_MS = 15_000;
// Al escanear o buscar con señal se consulta el estado en vivo; si el
// servidor no responde en este tiempo se usa la lista local para no
// frenar la fila.
const TIEMPO_CONSULTA_MS = 3_000;
const CLAVE_NOMBRE = "kits:nombre";

const formateadorHora = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

type Alerta = { id: string; texto: string };

type EstadoLocal = {
  lista: ListaKits | null;
  cola: EntregaPendiente[];
  alertas: Alerta[];
};

const ESTADO_VACIO: EstadoLocal = { lista: null, cola: [], alertas: [] };

// localStorage puede no existir o lanzar (modo privado, almacenamiento
// lleno): la pantalla sigue funcionando, solo que sin copia local.
function leerLocal<T>(clave: string, respaldo: T): T {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T) : respaldo;
  } catch {
    return respaldo;
  }
}

function guardarLocal(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin copia local; la cola sigue en memoria mientras la pestaña viva.
  }
}

async function hashDocumento(eventoId: string, documento: string) {
  const bytes = new TextEncoder().encode(
    textoHashDocumento(eventoId, documento),
  );
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Espera la respuesta del servidor como máximo TIEMPO_CONSULTA_MS; un
// error de red cuenta igual que no responder.
function conTiempoLimite<T>(promesa: Promise<T>): Promise<T | "sin-respuesta"> {
  return Promise.race([
    promesa.catch(() => "sin-respuesta" as const),
    new Promise<"sin-respuesta">((resolver) =>
      setTimeout(() => resolver("sin-respuesta"), TIEMPO_CONSULTA_MS),
    ),
  ]);
}

// La lista del servidor manda, salvo las entregas que este celular aún no
// ha logrado subir: esas se conservan marcadas.
function combinarConCola(
  lista: ListaKits,
  cola: EntregaPendiente[],
): ListaKits {
  const pendientes = new Map(cola.map((e) => [e.inscripcionId, e]));
  return {
    ...lista,
    inscripciones: lista.inscripciones.map((i) => {
      const entrega = pendientes.get(i.id);
      return entrega && !i.kitEntregadoEn
        ? {
            ...i,
            kitEntregadoEn: entrega.entregadoEn,
            kitEntregadoPor: entrega.entregadoPor,
          }
        : i;
    }),
  };
}

export function EntregaKits({
  eventoId,
  nombreFijo,
  descargarLista,
  sincronizar,
  buscarDocumento,
  consultarInscripcion,
}: {
  eventoId: string;
  // Usuario del panel: el nombre sale de su sesión y no se pregunta.
  nombreFijo?: string;
  descargarLista: () => Promise<ListaKits | null>;
  sincronizar: (
    entregas: EntregaPendiente[],
  ) => Promise<ResultadoSincronizacion | null>;
  buscarDocumento: (documento: string) => Promise<InscripcionKit[] | null>;
  // `null` = sin acceso; `{ inscripcion: null }` = no es de este evento.
  consultarInscripcion: (
    inscripcionId: string,
  ) => Promise<{ inscripcion: InscripcionKit | null } | null>;
}) {
  const claveEstado = `kits:${eventoId}`;
  const [cargado, setCargado] = useState(false);
  const [estado, setEstado] = useState<EstadoLocal>(ESTADO_VACIO);
  const estadoRef = useRef(estado);
  const [nombre, setNombre] = useState<string | null>(nombreFijo ?? null);
  const [conectado, setConectado] = useState(true);
  const [sinAcceso, setSinAcceso] = useState(false);
  const sincronizandoRef = useRef(false);
  const otraVueltaRef = useRef(false);
  // Número de la última consulta (escaneo o búsqueda): si llega otra antes
  // de que responda el servidor, la respuesta vieja se ignora.
  const consultaRef = useRef(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [escaneando, setEscaneando] = useState(false);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);

  const [documento, setDocumento] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<
    { ok: true; inscripciones: InscripcionKit[] } | { ok: false; error: string } | null
  >(null);
  // Lo que se acaba de entregar desde este celular se muestra en verde,
  // no con la alerta roja de "ya entregado" (que es para un 2.º escaneo).
  const [recienEntregado, setRecienEntregado] = useState<string | null>(null);

  const actualizar = useCallback(
    (cambio: (previo: EstadoLocal) => EstadoLocal) => {
      const nuevo = cambio(estadoRef.current);
      estadoRef.current = nuevo;
      setEstado(nuevo);
      guardarLocal(claveEstado, nuevo);
    },
    [claveEstado],
  );

  // Sube la cola (si hay) y vuelve a bajar la lista. Cualquier error de red
  // solo marca "sin conexión": la cola se queda para el siguiente intento.
  const sincronizarAhora = useCallback(async () => {
    // Si llega otra entrega mientras hay un envío en curso, no se descarta:
    // se marca y se hace otra vuelta apenas termine la actual, en vez de
    // esperar al siguiente ciclo de 15 s.
    if (sincronizandoRef.current) {
      otraVueltaRef.current = true;
      return;
    }
    sincronizandoRef.current = true;
    try {
      do {
        otraVueltaRef.current = false;
        const enviadas = estadoRef.current.cola;
        if (enviadas.length > 0) {
          const respuesta = await sincronizar(enviadas);
          if (!respuesta) {
            setSinAcceso(true);
            return;
          }
          const resueltas = new Set([
            ...respuesta.aplicadas,
            ...respuesta.rechazadas,
            ...respuesta.conflictos.map((c) => c.inscripcionId),
          ]);
          const nombres = new Map(
            estadoRef.current.lista?.inscripciones.map((i) => [
              i.id,
              i.nombreCompleto,
            ]),
          );
          const nuevasAlertas: Alerta[] = [
            ...respuesta.conflictos.map((c) => ({
              id: `${c.inscripcionId}-${Date.now()}`,
              texto: `Kit de ${c.nombreAtleta} entregado dos veces: ${
                c.entregadoPor ?? "alguien"
              }${
                c.entregadoEn
                  ? ` (${formateadorHora.format(new Date(c.entregadoEn))})`
                  : ""
              } y ${c.intentadoPor}.`,
            })),
            ...respuesta.rechazadas.map((id) => ({
              id: `${id}-${Date.now()}`,
              texto: `No se registró la entrega a ${
                nombres.get(id) ?? "un atleta"
              }: su pago ya no está aprobado.`,
            })),
          ];
          actualizar((previo) => ({
            ...previo,
            cola: previo.cola.filter(
              (e) =>
                !(
                  resueltas.has(e.inscripcionId) &&
                  enviadas.some(
                    (env) =>
                      env.inscripcionId === e.inscripcionId &&
                      env.entregadoEn === e.entregadoEn,
                  )
                ),
            ),
            alertas: [...nuevasAlertas, ...previo.alertas],
          }));
        }

        const lista = await descargarLista();
        if (!lista) {
          setSinAcceso(true);
          return;
        }
        actualizar((previo) => ({
          ...previo,
          lista: combinarConCola(lista, previo.cola),
        }));
        setConectado(true);
      } while (otraVueltaRef.current);
    } catch {
      setConectado(false);
    } finally {
      sincronizandoRef.current = false;
    }
  }, [actualizar, descargarLista, sincronizar]);

  // Carga la copia local y arranca la sincronización periódica.
  useEffect(() => {
    const local = leerLocal(claveEstado, ESTADO_VACIO);
    estadoRef.current = local;
    queueMicrotask(() => {
      setEstado(local);
      if (!nombreFijo) setNombre(leerLocal<string | null>(CLAVE_NOMBRE, null));
      setCargado(true);
      void sincronizarAhora();
    });

    const id = setInterval(sincronizarAhora, INTERVALO_SINCRONIZACION_MS);
    const alVolver = () => void sincronizarAhora();
    window.addEventListener("online", alVolver);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", alVolver);
    };
  }, [claveEstado, nombreFijo, sincronizarAhora]);

  const detenerCamara = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setEscaneando(false);
  }, []);

  useEffect(() => detenerCamara, [detenerCamara]);

  // Combina lo que respondió el servidor con lo que este celular entregó y
  // aún no logró subir (el servidor todavía no lo sabe), y de paso pone al
  // día esas filas en la lista local para que el contador quede bien.
  const ponerAlDia = useCallback(
    (delServidor: InscripcionKit[]) => {
      const pendientes = new Map(
        estadoRef.current.cola.map((e) => [e.inscripcionId, e]),
      );
      const vigentes = delServidor.map((i) => {
        const pendiente = pendientes.get(i.id);
        return pendiente && !i.kitEntregadoEn
          ? {
              ...i,
              kitEntregadoEn: pendiente.entregadoEn,
              kitEntregadoPor: pendiente.entregadoPor,
            }
          : i;
      });
      const aprobadas = new Map(
        vigentes
          .filter((i) => i.estadoPago === "APROBADO")
          .map((i) => [i.id, i]),
      );
      if (aprobadas.size > 0) {
        actualizar((previo) => {
          if (!previo.lista) return previo;
          const nuevas = [...aprobadas.values()].filter(
            (a) => !previo.lista!.inscripciones.some((i) => i.id === a.id),
          );
          return {
            ...previo,
            lista: {
              ...previo.lista,
              inscripciones: [
                ...previo.lista.inscripciones.map(
                  (i) => aprobadas.get(i.id) ?? i,
                ),
                ...nuevas,
              ],
            },
          };
        });
      }
      return vigentes;
    },
    [actualizar],
  );

  // El QR trae "<inscripcionId>.<firma>". La firma no se puede verificar en
  // el celular (el secreto no sale del servidor); basta con que el id esté
  // en este evento, y los ids no se adivinan.
  //
  // Con señal se pregunta al servidor: la lista local puede tener hasta
  // 15 s de atraso, y en ese intervalo otro puesto pudo haber entregado
  // este mismo kit. Sin señal, o si el servidor tarda más de 3 s, se usa
  // la lista local.
  const buscarQr = useCallback(
    async (texto: string) => {
      const id = texto.split(".")[0].slice(0, 64);
      const consulta = ++consultaRef.current;
      setResultado(null);
      setBuscando(true);
      const enServidor = await conTiempoLimite(consultarInscripcion(id));
      if (consulta !== consultaRef.current) return;
      setBuscando(false);

      if (enServidor === null) {
        setSinAcceso(true);
        return;
      }

      if (enServidor !== "sin-respuesta") {
        setConectado(true);
        if (!enServidor.inscripcion) {
          setResultado({
            ok: false,
            error:
              "Este QR no es de una inscripción de este evento. Envíalo a la mesa de incidencias.",
          });
          return;
        }
        setResultado({
          ok: true,
          inscripciones: ponerAlDia([enServidor.inscripcion]),
        });
        return;
      }

      setConectado(false);
      const lista = estadoRef.current.lista;
      if (!lista) {
        setResultado({
          ok: false,
          error: "Aún no hay lista descargada. Necesitas señal una vez.",
        });
        return;
      }
      const inscripcion = lista.inscripciones.find((i) => i.id === id);
      setResultado(
        inscripcion
          ? { ok: true, inscripciones: [inscripcion] }
          : {
              ok: false,
              error:
                "Este QR no está entre los aprobados de este evento. Envíalo a la mesa de incidencias.",
            },
      );
    },
    [consultarInscripcion, ponerAlDia],
  );

  // Bucle de lectura mientras la cámara está activa. Se reduce el frame a
  // 640 px de ancho: jsQR es lento con la resolución completa del celular.
  useEffect(() => {
    if (!escaneando) return;
    const id = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
        return;
      }
      const escala = Math.min(1, 640 / video.videoWidth);
      canvas.width = Math.round(video.videoWidth * escala);
      canvas.height = Math.round(video.videoHeight * escala);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imagen = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const codigo = jsQR(imagen.data, imagen.width, imagen.height, {
        inversionAttempts: "dontInvert",
      });
      if (codigo?.data) {
        navigator.vibrate?.(80);
        detenerCamara();
        void buscarQr(codigo.data);
      }
    }, INTERVALO_ESCANEO_MS);
    return () => clearInterval(id);
  }, [escaneando, detenerCamara, buscarQr]);

  async function iniciarCamara() {
    setErrorCamara(null);
    setResultado(null);
    setRecienEntregado(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setEscaneando(true);
      // El <video> se monta con `escaneando`; se le asigna el stream en el
      // siguiente frame, cuando ya existe en el DOM.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setErrorCamara(
        "No se pudo abrir la cámara. Revisa el permiso del navegador o usa la búsqueda por documento.",
      );
    }
  }

  // Con señal se busca en el servidor (estado en vivo, y ve también pagos
  // pendientes o rechazados: "pagué y no me sale"). Sin señal, o si tarda
  // más de 3 s, se busca en la lista local por el hash del documento.
  async function buscarPorDocumento(evento: React.FormEvent) {
    evento.preventDefault();
    detenerCamara();
    setRecienEntregado(null);
    setResultado(null);
    const consulta = ++consultaRef.current;
    setBuscando(true);

    const enServidor = await conTiempoLimite(buscarDocumento(documento));
    if (consulta !== consultaRef.current) return;

    if (enServidor === null) {
      setBuscando(false);
      setSinAcceso(true);
      return;
    }

    if (enServidor !== "sin-respuesta") {
      setBuscando(false);
      setConectado(true);
      setResultado(
        enServidor.length > 0
          ? { ok: true, inscripciones: ponerAlDia(enServidor) }
          : {
              ok: false,
              error: "No hay inscripciones con ese documento en este evento.",
            },
      );
      return;
    }

    setConectado(false);
    const lista = estadoRef.current.lista;
    const locales =
      lista && crypto.subtle
        ? await hashDocumento(eventoId, documento).then((hash) =>
            lista.inscripciones.filter((i) => i.documentoHash === hash),
          )
        : [];
    if (consulta !== consultaRef.current) return;
    setBuscando(false);
    setResultado(
      locales.length > 0
        ? { ok: true, inscripciones: locales }
        : {
            ok: false,
            error:
              "Sin señal: no está en la lista de aprobados guardada en este celular. Envíalo a la mesa de incidencias.",
          },
    );
  }

  function entregar(inscripcion: InscripcionKit) {
    if (!nombre) return;
    const entrega: EntregaPendiente = {
      inscripcionId: inscripcion.id,
      entregadoEn: new Date().toISOString(),
      entregadoPor: nombre,
    };
    const entregada: InscripcionKit = {
      ...inscripcion,
      kitEntregadoEn: entrega.entregadoEn,
      kitEntregadoPor: entrega.entregadoPor,
    };
    actualizar((previo) => {
      const lista = previo.lista ?? {
        eventoId,
        inscripciones: [],
        descargadaEn: entrega.entregadoEn,
      };
      // Aprobada a última hora (vino de la búsqueda en el servidor): se
      // agrega a la lista local para que el contador la cuente.
      const existe = lista.inscripciones.some((i) => i.id === inscripcion.id);
      return {
        ...previo,
        lista: {
          ...lista,
          inscripciones: existe
            ? lista.inscripciones.map((i) =>
                i.id === inscripcion.id ? entregada : i,
              )
            : [...lista.inscripciones, entregada],
        },
        cola: [...previo.cola, entrega],
      };
    });
    setResultado((previo) =>
      previo?.ok
        ? {
            ok: true,
            inscripciones: previo.inscripciones.map((i) =>
              i.id === inscripcion.id ? entregada : i,
            ),
          }
        : previo,
    );
    setRecienEntregado(inscripcion.id);
    void sincronizarAhora();
  }

  if (sinAcceso) {
    return (
      <p
        role="alert"
        className="rounded-[20px] bg-red-600 p-5 font-bold text-white"
      >
        Este enlace de entrega ya no es válido (vencido o revocado). Pide uno
        nuevo a la organización.
      </p>
    );
  }

  if (!cargado) {
    return (
      <p className="rounded-[20px] bg-white p-5 text-gris-oscuro">Cargando…</p>
    );
  }

  if (!nombre) {
    return <FormularioNombre onGuardar={setNombre} />;
  }

  const lista = estado.lista;
  const entregados =
    lista?.inscripciones.filter((i) => i.kitEntregadoEn).length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[20px] bg-white px-5 py-3 text-sm shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
        <span>
          Entregando como <strong>{nombre}</strong>
          {!nombreFijo ? (
            <button
              type="button"
              onClick={() => setNombre(null)}
              className="ml-2 font-bold text-naranja underline"
            >
              cambiar
            </button>
          ) : null}
        </span>
        <span
          className={
            conectado ? "font-bold text-green-700" : "font-bold text-red-700"
          }
        >
          {conectado ? "En línea" : "Sin conexión"}
          {estado.cola.length > 0
            ? ` · ${estado.cola.length} por sincronizar`
            : ""}
        </span>
        {lista ? (
          <span className="w-full text-xs text-gris-oscuro">
            Lista actualizada{" "}
            {formateadorHora.format(new Date(lista.descargadaEn))}
          </span>
        ) : null}
      </div>

      {estado.alertas.length > 0 ? (
        <section className="flex flex-col gap-2 rounded-[20px] bg-red-600 p-5 text-white">
          <h2 className="font-display font-extrabold uppercase">
            Para revisar en la mesa
          </h2>
          <ul className="list-inside list-disc text-sm">
            {estado.alertas.map((alerta) => (
              <li key={alerta.id}>{alerta.texto}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => actualizar((previo) => ({ ...previo, alertas: [] }))}
            className="w-fit rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase"
          >
            Marcar como revisadas
          </button>
        </section>
      ) : null}

      <section className="flex flex-col gap-3 rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
        {escaneando ? (
          <>
            <video
              ref={videoRef}
              muted
              playsInline
              className="aspect-square w-full rounded-2xl bg-casi-negro object-cover"
            />
            <button
              type="button"
              onClick={detenerCamara}
              className="rounded-full bg-casi-negro/5 px-5 py-3 font-display font-bold uppercase text-casi-negro"
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={iniciarCamara}
            disabled={!lista}
            className="rounded-full bg-naranja px-5 py-4 font-display text-lg font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)] disabled:opacity-60"
          >
            {!lista
              ? "Descargando lista…"
              : resultado
                ? "Escanear siguiente"
                : "Escanear QR"}
          </button>
        )}
        <canvas ref={canvasRef} className="hidden" />
        {errorCamara ? (
          <p className="text-sm text-red-700">{errorCamara}</p>
        ) : null}

        <form onSubmit={buscarPorDocumento} className="flex gap-2">
          <label className="sr-only" htmlFor="documento-kit">
            Número de documento
          </label>
          <input
            id="documento-kit"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Buscar por documento"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            className="min-w-0 flex-1 rounded-lg bg-casi-negro/[0.045] px-3 py-2 text-lg outline-none"
          />
          <button
            type="submit"
            disabled={buscando || documento.trim().length < 3}
            className="rounded-full bg-casi-negro px-5 py-2 font-display font-bold uppercase text-crema disabled:opacity-60"
          >
            Buscar
          </button>
        </form>
      </section>

      {buscando ? (
        <p className="rounded-[20px] bg-white p-5 text-gris-oscuro">
          Buscando…
        </p>
      ) : resultado && !resultado.ok ? (
        <p
          role="alert"
          className="rounded-[20px] bg-red-600 p-5 font-bold text-white"
        >
          {resultado.error}
        </p>
      ) : resultado?.ok ? (
        resultado.inscripciones.map((inscripcion) => (
          <TarjetaKit
            key={inscripcion.id}
            inscripcion={inscripcion}
            recienEntregado={recienEntregado === inscripcion.id}
            onEntregar={() => entregar(inscripcion)}
          />
        ))
      ) : null}

      {lista ? (
        <section className="flex flex-col gap-4 rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-lg font-extrabold uppercase">
              Entregados
            </h2>
            <span className="font-mono text-3xl font-bold text-naranja">
              {entregados}
              <span className="text-lg text-gris-oscuro">
                {" "}
                / {lista.inscripciones.length}
              </span>
            </span>
          </div>
          <TablaConteo
            titulo="Por categoría"
            filas={contar(
              lista.inscripciones,
              (i) => i.categoria ?? "Sin categoría",
            )}
          />
          <TablaConteo
            titulo="Por talla"
            filas={contar(
              lista.inscripciones,
              (i) => i.tallaCamiseta ?? "Sin camiseta",
            )}
          />
        </section>
      ) : null}
    </div>
  );
}

function FormularioNombre({ onGuardar }: { onGuardar: (n: string) => void }) {
  const [valor, setValor] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const limpio = valor.trim().slice(0, 60);
        if (!limpio) return;
        guardarLocal(CLAVE_NOMBRE, limpio);
        onGuardar(limpio);
      }}
      className="flex flex-col gap-3 rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(28,13,10,0.10)]"
    >
      <label htmlFor="nombre-voluntario" className="font-display text-lg font-extrabold uppercase">
        ¿Cómo te llamas?
      </label>
      <p className="text-sm text-gris-oscuro">
        Queda registrado en cada kit que entregues. Solo se pregunta una vez
        en este celular.
      </p>
      <input
        id="nombre-voluntario"
        autoComplete="name"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="rounded-lg bg-casi-negro/[0.045] px-3 py-2 text-lg outline-none"
      />
      <button
        type="submit"
        disabled={!valor.trim()}
        className="rounded-full bg-naranja px-5 py-3 font-display font-bold uppercase text-white disabled:opacity-60"
      >
        Empezar
      </button>
    </form>
  );
}

function contar(
  inscripciones: InscripcionKit[],
  clave: (i: InscripcionKit) => string,
) {
  const mapa = new Map<string, { clave: string; entregados: number; total: number }>();
  for (const inscripcion of inscripciones) {
    const k = clave(inscripcion);
    const conteo = mapa.get(k) ?? { clave: k, entregados: 0, total: 0 };
    conteo.total++;
    if (inscripcion.kitEntregadoEn) conteo.entregados++;
    mapa.set(k, conteo);
  }
  return [...mapa.values()].sort((a, b) => a.clave.localeCompare(b.clave));
}

function TablaConteo({
  titulo,
  filas,
}: {
  titulo: string;
  filas: { clave: string; entregados: number; total: number }[];
}) {
  if (filas.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
        {titulo}
      </h3>
      <table className="w-full text-sm">
        <thead className="sr-only">
          <tr>
            <th>{titulo}</th>
            <th>Entregados</th>
            <th>Pendientes</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila.clave} className="border-t border-casi-negro/10">
              <td className="py-1.5">{fila.clave}</td>
              <td className="py-1.5 text-right font-mono">
                {fila.entregados}/{fila.total}
              </td>
              <td className="py-1.5 pl-3 text-right text-gris-oscuro">
                {fila.total - fila.entregados} pend.
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TarjetaKit({
  inscripcion,
  recienEntregado,
  onEntregar,
}: {
  inscripcion: InscripcionKit;
  recienEntregado: boolean;
  onEntregar: () => void;
}) {
  const aprobada = inscripcion.estadoPago === "APROBADO";

  return (
    <section className="flex flex-col gap-3 rounded-[20px] bg-white p-5 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-display text-xl font-extrabold uppercase">
            {inscripcion.nombreCompleto}
          </span>
          <span className="text-sm text-gris-oscuro">
            Documento terminado en {inscripcion.documentoFinal}
          </span>
          <span className="text-sm text-gris-oscuro">
            {inscripcion.categoria ?? "Sin categoría"}
          </span>
        </div>
        {inscripcion.dorsal ? (
          <span className="rounded-xl bg-casi-negro px-3 py-1 text-center font-mono text-2xl font-bold text-crema">
            {inscripcion.dorsal}
          </span>
        ) : null}
      </div>

      {inscripcion.tallaCamiseta ? (
        <p className="text-lg">
          Camiseta talla{" "}
          <strong className="font-display text-2xl">
            {inscripcion.tallaCamiseta}
          </strong>
        </p>
      ) : null}

      {inscripcion.derechos.length > 0 ? (
        <ul className="list-inside list-disc text-sm">
          {inscripcion.derechos.map((derecho) => (
            <li key={derecho}>{derecho}</li>
          ))}
        </ul>
      ) : null}

      {recienEntregado ? (
        <p
          role="status"
          className="rounded-xl bg-green-600 p-4 font-bold text-white"
        >
          ✓ Kit entregado
        </p>
      ) : inscripcion.kitEntregadoEn ? (
        <p
          role="alert"
          className="rounded-xl bg-red-600 p-4 font-bold text-white"
        >
          Kit YA ENTREGADO el{" "}
          {formateadorHora.format(new Date(inscripcion.kitEntregadoEn))}
          {inscripcion.kitEntregadoPor
            ? ` por ${inscripcion.kitEntregadoPor}`
            : ""}
          . No entregar de nuevo.
        </p>
      ) : !aprobada ? (
        <p
          role="alert"
          className="rounded-xl bg-amber-400 p-4 font-bold text-casi-negro"
        >
          Pago {inscripcion.estadoPago}: no entregar. Enviar a la mesa de
          incidencias.
        </p>
      ) : (
        <button
          type="button"
          onClick={onEntregar}
          className="rounded-full bg-green-600 px-5 py-4 font-display text-lg font-bold uppercase text-white"
        >
          Entregar kit
        </button>
      )}
    </section>
  );
}
