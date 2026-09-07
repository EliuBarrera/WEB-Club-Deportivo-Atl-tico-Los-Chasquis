"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import type { EventoPublicado } from "@/lib/eventos";
import { formatFechaBadge, formatPrecio } from "@/lib/format";

const TABS = [
  "Información",
  "Recorridos",
  "Premios",
  "Reglamento",
  "Logística",
  "Noticias",
  "Contacto",
] as const;

type Tab = (typeof TABS)[number];

function SinDatos({ children }: { children: ReactNode }) {
  return <p className="text-lg italic text-gris-oscuro">{children}</p>;
}

function TituloSeccion({ children }: { children: ReactNode }) {
  return (
    <h4 className="mb-2 font-display text-xl font-bold uppercase">
      {children}
    </h4>
  );
}

function ListaTextos({ items }: { items: { id: string; texto: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="border-t-2 border-casi-negro">
      {items.map((item, indice) => (
        <div
          key={item.id}
          className="flex gap-4 border-b border-dashed border-casi-negro/35 py-3 last:border-b-2 last:border-solid last:border-casi-negro"
        >
          <span
            aria-hidden
            className="w-10 shrink-0 font-mono text-2xl font-bold leading-none text-casi-negro"
          >
            {String(indice + 1).padStart(2, "0")}
          </span>
          <span className="pt-0.5 text-lg leading-relaxed">{item.texto}</span>
        </div>
      ))}
    </div>
  );
}

// Panel con tabs del detalle del evento (Fase 3): todo el contenido de
// cada sección viene de la base de datos, nada hardcodeado.
export function PanelDetalleTabs({ evento }: { evento: EventoPublicado }) {
  const [tabActiva, setTabActiva] = useState<Tab>("Información");

  return (
    <div className="flex w-full flex-col rounded-2xl border-2 border-casi-negro bg-casi-negro/5 p-4 sm:p-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setTabActiva(tab)}
            className={`rounded-t-lg px-4 py-2 font-display text-lg font-bold ${
              tab === tabActiva
                ? "bg-crema text-casi-negro"
                : "bg-casi-negro/10 text-gris-oscuro"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[280px] rounded-b-2xl rounded-tr-2xl bg-crema p-5">
        {tabActiva === "Información" ? <TabInformacion evento={evento} /> : null}
        {tabActiva === "Recorridos" ? <TabRecorridos evento={evento} /> : null}
        {tabActiva === "Premios" ? <TabPremios evento={evento} /> : null}
        {tabActiva === "Reglamento" ? <TabReglamento evento={evento} /> : null}
        {tabActiva === "Logística" ? <TabLogistica evento={evento} /> : null}
        {tabActiva === "Noticias" ? <TabNoticias evento={evento} /> : null}
        {tabActiva === "Contacto" ? <TabContacto evento={evento} /> : null}
      </div>
    </div>
  );
}

function TabInformacion({ evento }: { evento: EventoPublicado }) {
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-base font-bold uppercase text-gris-oscuro">
            Fecha
          </dt>
          <dd className="text-xl">{formatFechaBadge(evento.fecha)}</dd>
        </div>
        {evento.horario ? (
          <div>
            <dt className="text-base font-bold uppercase text-gris-oscuro">
              Horario
            </dt>
            <dd className="text-xl">{evento.horario}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-base font-bold uppercase text-gris-oscuro">
            Ubicación
          </dt>
          <dd className="text-xl">{evento.ubicacion}</dd>
        </div>
        {evento.cierreInscripciones ? (
          <div>
            <dt className="text-base font-bold uppercase text-gris-oscuro">
              Cierre inscripciones
            </dt>
            <dd className="text-xl">{evento.cierreInscripciones}</dd>
          </div>
        ) : null}
      </dl>

      {evento.descripcion ? (
        <div>
          <TituloSeccion>Sobre el evento</TituloSeccion>
          <p className="text-lg leading-relaxed">{evento.descripcion}</p>
        </div>
      ) : null}

      {evento.costos.length > 0 ? (
        <div>
          <TituloSeccion>Valor de inscripción</TituloSeccion>
          <div className="flex flex-col gap-3">
            {evento.costos.map((costo) => (
              <div
                key={costo.id}
                className="flex overflow-hidden rounded-2xl border-2 border-casi-negro bg-white"
              >
                <div
                  style={{ writingMode: "vertical-rl" }}
                  className="flex w-14 shrink-0 items-center justify-center border-r-2 border-dashed border-crema bg-casi-negro py-3 font-display text-xs font-bold uppercase tracking-wider text-crema capitalize"
                >
                  {costo.tipo}
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-3">
                  <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
                    Inscripción
                  </span>
                  <span className="font-display text-2xl font-extrabold">
                    {formatPrecio(costo.valor)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {evento.categorias.length > 0 ? (
        <div>
          <TituloSeccion>Categorías y pruebas</TituloSeccion>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {evento.categorias.map((categoria) => {
              return (
                <div
                  key={categoria.id}
                  className="relative flex flex-col gap-3 rounded-xl border-2 border-casi-negro bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display text-lg font-extrabold uppercase capitalize">
                      {categoria.nombre.toLowerCase()}
                    </span>
                    <div className="group relative">
                      <button
                        type="button"
                        aria-label={`Ver todas las pruebas de ${categoria.nombre.toLowerCase()}`}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-casi-negro/10 font-display text-sm font-bold text-casi-negro"
                      >
                        i
                      </button>

                      <div className="pointer-events-none invisible absolute right-0 top-8 z-10 flex min-w-[220px] flex-col gap-2 rounded-xl border-2 border-casi-negro bg-white p-3 opacity-0 shadow-[0_10px_24px_rgba(28,13,10,0.20)] transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                        <span className="text-sm font-bold uppercase tracking-wide text-naranja">
                          Todas las pruebas
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {categoria.pruebas.map((cp, indice) => (
                            <span
                              key={`${categoria.id}-todas-${indice}`}
                              className="rounded-full border border-naranja bg-naranja/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-naranja"
                            >
                              {cp.prueba.nombre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
                      Años
                    </span>
                    <span className="text-sm">{categoria.edad}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold uppercase tracking-wide text-gris-oscuro">
                      Pruebas
                    </span>
                    <div className="flex max-h-[50px] flex-wrap gap-1.5 overflow-hidden">
                      {categoria.pruebas.length > 0 ? (
                        categoria.pruebas.map((cp, indice) => (
                          <span
                            key={`${categoria.id}-prueba-${indice}`}
                            className="rounded-full border border-naranja bg-naranja/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-naranja"
                          >
                            {cp.prueba.nombre}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gris-oscuro">—</span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {evento.aval ? (
        <div>
          <TituloSeccion>Aval</TituloSeccion>
          <p className="text-lg leading-relaxed">{evento.aval}</p>
        </div>
      ) : null}
    </div>
  );
}

function TabRecorridos({ evento }: { evento: EventoPublicado }) {
  const recorrido = evento.recorrido;

  const datosTecnicos = recorrido
    ? [
        ["Distancia", recorrido.distancia],
        ["Desnivel", recorrido.desnivel],
        ["Salida", recorrido.salida],
        ["Meta", recorrido.meta],
        ["Modalidad", recorrido.modalidad],
        ["Terreno", recorrido.terreno],
      ].filter((par): par is [string, string] => Boolean(par[1]))
    : [];

  if (
    !recorrido ||
    (datosTecnicos.length === 0 && recorrido.programacion.length === 0)
  ) {
    return <SinDatos>Este evento aún no tiene recorrido publicado.</SinDatos>;
  }

  return (
    <div className="flex flex-col gap-4">
      {datosTecnicos.length > 0 ? (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {datosTecnicos.map(([etiqueta, valor]) => (
            <div key={etiqueta}>
              <dt className="text-base font-bold uppercase text-gris-oscuro">
                {etiqueta}
              </dt>
              <dd className="text-xl">{valor}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {recorrido.programacion.length > 0 ? (
        <div>
          <TituloSeccion>Programación</TituloSeccion>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recorrido.programacion.map((img) => (
              <div
                key={img.id}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-casi-negro/20"
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TabPremios({ evento }: { evento: EventoPublicado }) {
  const premios = evento.premios;

  if (
    !premios ||
    (!premios.efectivoUrl &&
      !premios.ceremoniaHora &&
      !premios.ceremoniaLugar &&
      premios.condiciones.length === 0)
  ) {
    return <SinDatos>Este evento aún no tiene premiación publicada.</SinDatos>;
  }

  return (
    <div className="flex flex-col gap-4">
      {premios.ceremoniaHora || premios.ceremoniaLugar ? (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {premios.ceremoniaHora ? (
            <div>
              <dt className="text-base font-bold uppercase text-gris-oscuro">
                Hora de ceremonia
              </dt>
              <dd className="text-xl">{premios.ceremoniaHora}</dd>
            </div>
          ) : null}
          {premios.ceremoniaLugar ? (
            <div>
              <dt className="text-base font-bold uppercase text-gris-oscuro">
                Lugar de ceremonia
              </dt>
              <dd className="text-xl">{premios.ceremoniaLugar}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {premios.condiciones.length > 0 ? (
        <div>
          <TituloSeccion>Condiciones</TituloSeccion>
          <ListaTextos items={premios.condiciones} />
        </div>
      ) : null}

      {premios.efectivoUrl ? (
        <div>
          <TituloSeccion>Premiación en efectivo</TituloSeccion>
          <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl border-2 border-casi-negro/20">
            <Image
              src={premios.efectivoUrl}
              alt="Tabla de premiación en efectivo"
              fill
              sizes="(min-width: 640px) 400px, 90vw"
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TabReglamento({ evento }: { evento: EventoPublicado }) {
  const reglamento = evento.reglamento;

  if (
    !reglamento ||
    (reglamento.competencia.length === 0 &&
      reglamento.seguridad.length === 0 &&
      reglamento.controles.length === 0)
  ) {
    return <SinDatos>Este evento aún no tiene reglamento publicado.</SinDatos>;
  }

  return (
    <div className="flex flex-col gap-6">
      {reglamento.competencia.length > 0 ? (
        <div>
          <TituloSeccion>Reglas de competencia</TituloSeccion>
          <ListaTextos items={reglamento.competencia} />
        </div>
      ) : null}
      {reglamento.seguridad.length > 0 ? (
        <div>
          <TituloSeccion>Normas de seguridad</TituloSeccion>
          <ListaTextos items={reglamento.seguridad} />
        </div>
      ) : null}
      {reglamento.controles.length > 0 ? (
        <div>
          <TituloSeccion>Puntos de control</TituloSeccion>
          <ListaTextos items={reglamento.controles} />
        </div>
      ) : null}
    </div>
  );
}

function TabLogistica({ evento }: { evento: EventoPublicado }) {
  const logistica = evento.logistica;

  if (
    !logistica ||
    (logistica.servicios.length === 0 &&
      logistica.recomendaciones.length === 0 &&
      logistica.kit.length === 0)
  ) {
    return <SinDatos>Este evento aún no tiene logística publicada.</SinDatos>;
  }

  return (
    <div className="flex flex-col gap-6">
      {logistica.servicios.length > 0 ? (
        <div>
          <TituloSeccion>Servicios</TituloSeccion>
          <ListaTextos items={logistica.servicios} />
        </div>
      ) : null}
      {logistica.recomendaciones.length > 0 ? (
        <div>
          <TituloSeccion>Recomendaciones</TituloSeccion>
          <ListaTextos items={logistica.recomendaciones} />
        </div>
      ) : null}
      {logistica.kit.length > 0 ? (
        <div>
          <TituloSeccion>Kit del corredor</TituloSeccion>
          <ListaTextos items={logistica.kit} />
        </div>
      ) : null}
    </div>
  );
}

function TabNoticias({ evento }: { evento: EventoPublicado }) {
  if (evento.noticias.length === 0) {
    return <SinDatos>Aún no hay noticias publicadas para este evento.</SinDatos>;
  }

  return (
    <div className="flex flex-col gap-5">
      {evento.noticias.map((noticia) => (
        <article
          key={noticia.id}
          className="border-b border-casi-negro/20 pb-4 last:border-none last:pb-0"
        >
          <p className="text-sm font-bold uppercase text-gris-oscuro">
            {noticia.fecha}
          </p>
          <h4 className="mb-1 font-display text-xl font-bold uppercase">
            {noticia.titulo}
          </h4>
          <p className="text-lg leading-relaxed">{noticia.contenido}</p>
        </article>
      ))}
    </div>
  );
}

function TabContacto({ evento }: { evento: EventoPublicado }) {
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-base font-bold uppercase text-gris-oscuro">
            Ubicación
          </dt>
          <dd className="text-xl">{evento.ubicacion}</dd>
        </div>
        {evento.organizador ? (
          <div>
            <dt className="text-base font-bold uppercase text-gris-oscuro">
              Organiza
            </dt>
            <dd className="text-xl">{evento.organizador}</dd>
          </div>
        ) : null}
        {evento.aval ? (
          <div>
            <dt className="text-base font-bold uppercase text-gris-oscuro">
              Aval
            </dt>
            <dd className="text-xl">{evento.aval}</dd>
          </div>
        ) : null}
      </dl>

      {evento.terminosUrl ? (
        <a
          href={evento.terminosUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-full border-[3px] border-casi-negro px-5 py-2 font-display font-bold uppercase transition-colors hover:bg-casi-negro hover:text-crema"
        >
          Ver términos y condiciones
        </a>
      ) : null}
    </div>
  );
}
