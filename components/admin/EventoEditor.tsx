"use client";

import Image from "next/image";
import { useState } from "react";
import type { EventoCompleto, PruebaCatalogoAdmin } from "@/lib/admin/dal";
import { CategoriaModal } from "@/components/admin/CategoriaModal";
import { NoticiaModal } from "@/components/admin/NoticiaModal";
import { ListaTextoEditable } from "@/components/admin/ListaTextoEditable";

const TABS = [
  { id: "informacion", label: "Información" },
  { id: "categorias", label: "Categorías" },
  { id: "recorrido", label: "Recorrido" },
  { id: "premios", label: "Premios" },
  { id: "reglamento", label: "Reglamento" },
  { id: "logistica", label: "Logística" },
  { id: "noticias", label: "Noticias" },
  { id: "contacto", label: "Contacto" },
  { id: "resultados", label: "Resultados" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const campoClase = "rounded-lg bg-white px-3 py-2 text-lg outline-none";
const labelClase =
  "text-sm font-bold uppercase tracking-wide text-gris-oscuro";

export function EventoEditor({
  evento,
  pruebasCatalogo,
  actualizarEventoAction,
  publicarResultadosAction,
  crearCategoriaAction,
  actualizarCategoriaAction,
  eliminarCategoriaAction,
  guardarPremiosAction,
  guardarReglamentoAction,
  guardarLogisticaAction,
  crearNoticiaAction,
  actualizarNoticiaAction,
  eliminarNoticiaAction,
}: {
  evento: EventoCompleto;
  pruebasCatalogo: PruebaCatalogoAdmin[];
  actualizarEventoAction: (formData: FormData) => Promise<void>;
  publicarResultadosAction: (formData: FormData) => Promise<void>;
  crearCategoriaAction: (eventoId: string, formData: FormData) => Promise<void>;
  actualizarCategoriaAction: (
    categoriaId: string,
    eventoId: string,
    formData: FormData
  ) => Promise<void>;
  eliminarCategoriaAction: (
    categoriaId: string,
    eventoId: string
  ) => Promise<void>;
  guardarPremiosAction: (eventoId: string, formData: FormData) => Promise<void>;
  guardarReglamentoAction: (
    eventoId: string,
    formData: FormData
  ) => Promise<void>;
  guardarLogisticaAction: (
    eventoId: string,
    formData: FormData
  ) => Promise<void>;
  crearNoticiaAction: (eventoId: string, formData: FormData) => Promise<void>;
  actualizarNoticiaAction: (
    noticiaId: string,
    eventoId: string,
    formData: FormData
  ) => Promise<void>;
  eliminarNoticiaAction: (
    noticiaId: string,
    eventoId: string
  ) => Promise<void>;
}) {
  const [tab, setTab] = useState<TabId>("informacion");
  const [modalCategoria, setModalCategoria] = useState<"nueva" | string | null>(
    null
  );
  const [modalNoticia, setModalNoticia] = useState<"nueva" | string | null>(
    null
  );

  const mostrarFormPrincipal =
    tab === "informacion" || tab === "recorrido" || tab === "contacto";

  const fechaValor = evento.fecha.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-5 rounded-[20px] bg-white p-7 shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-extrabold uppercase">
          Editar evento
        </h2>
        <span className="rounded-full bg-naranja px-3 py-1 text-xs font-bold uppercase text-white">
          {evento.titulo}
        </span>
      </div>

      <div className="flex flex-col rounded-2xl bg-casi-negro/[0.03] p-3 pb-0">
        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={
                tab === item.id
                  ? "rounded-t-lg bg-naranja px-4 py-2 font-display text-sm font-extrabold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
                  : "rounded-t-lg bg-casi-negro/[0.08] px-4 py-2 font-display text-sm font-extrabold uppercase text-gris-oscuro"
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="rounded-tr-2xl rounded-b-2xl bg-crema p-5">
          <form
            action={actualizarEventoAction}
            className={mostrarFormPrincipal ? "flex flex-col gap-5" : "hidden"}
          >
            <div
              className={
                tab === "informacion" ? "flex flex-col gap-5" : "hidden"
              }
            >
              <div className="flex items-center gap-4">
                <div className="flex h-[72px] w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-casi-negro/[0.06]">
                  {evento.imagenUrl ? (
                    <Image
                      src={evento.imagenUrl}
                      alt=""
                      width={96}
                      height={72}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1c0d0a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </div>
                <label className="flex cursor-pointer flex-col gap-1.5">
                  <span
                    className={
                      "rounded-full bg-casi-negro/[0.06] px-4 py-1.5 font-display text-xs font-bold uppercase text-casi-negro"
                    }
                  >
                    Cambiar imagen
                  </span>
                  <input
                    type="file"
                    name="imagen"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Título</span>
                <input
                  type="text"
                  name="titulo"
                  required
                  defaultValue={evento.titulo}
                  className={campoClase}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Subtítulo</span>
                <input
                  type="text"
                  name="subtitulo"
                  defaultValue={evento.subtitulo ?? ""}
                  className={campoClase}
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5">
                  <span className={labelClase}>Fecha</span>
                  <input
                    type="date"
                    name="fecha"
                    required
                    defaultValue={fechaValor}
                    className={campoClase}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClase}>Horario</span>
                  <input
                    type="text"
                    name="horario"
                    placeholder="7:00 AM - 1:00 PM"
                    defaultValue={evento.horario ?? ""}
                    className={campoClase}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClase}>Cierre de inscripciones</span>
                  <input
                    type="text"
                    name="cierreInscripciones"
                    placeholder="10 de marzo de 2026"
                    defaultValue={evento.cierreInscripciones ?? ""}
                    className={campoClase}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={labelClase}>Ubicación</span>
                  <input
                    type="text"
                    name="ubicacion"
                    required
                    defaultValue={evento.ubicacion}
                    className={campoClase}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClase}>Precio</span>
                  <input
                    type="number"
                    name="precio"
                    min={0}
                    required
                    defaultValue={evento.precio}
                    className={campoClase}
                  />
                </label>
              </div>

              <fieldset className="flex flex-col gap-1.5">
                <legend className={labelClase}>Estado</legend>
                <div className="flex gap-2">
                  {(["BORRADOR", "ABIERTO", "CERRADO"] as const).map(
                    (estado) => (
                      <label key={estado} className="flex-1">
                        <input
                          type="radio"
                          name="estado"
                          value={estado}
                          defaultChecked={evento.estado === estado}
                          className="peer sr-only"
                        />
                        <span className="block cursor-pointer rounded-full bg-casi-negro/5 px-0 py-2 text-center font-display text-sm font-bold uppercase text-casi-negro peer-checked:bg-naranja peer-checked:text-white peer-checked:shadow-[0_4px_10px_rgba(241,88,8,0.4)]">
                          {estado === "BORRADOR"
                            ? "Borrador"
                            : estado === "ABIERTO"
                              ? "Abierto"
                              : "Cerrado"}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </fieldset>

              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Descripción</span>
                <textarea
                  name="descripcion"
                  rows={4}
                  defaultValue={evento.descripcion ?? ""}
                  className={campoClase}
                />
              </label>
            </div>

            <div
              className={
                tab === "recorrido"
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-3"
                  : "hidden"
              }
            >
              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Distancia</span>
                <input
                  type="text"
                  name="distancia"
                  placeholder="21.097 km"
                  defaultValue={evento.recorrido?.distancia ?? ""}
                  className={campoClase}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Desnivel</span>
                <input
                  type="text"
                  name="desnivel"
                  placeholder="+180 m"
                  defaultValue={evento.recorrido?.desnivel ?? ""}
                  className={campoClase}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Modalidad</span>
                <input
                  type="text"
                  name="modalidad"
                  placeholder="Pavimento"
                  defaultValue={evento.recorrido?.modalidad ?? ""}
                  className={campoClase}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Salida</span>
                <input
                  type="text"
                  name="salida"
                  defaultValue={evento.recorrido?.salida ?? ""}
                  className={campoClase}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Meta</span>
                <input
                  type="text"
                  name="meta"
                  defaultValue={evento.recorrido?.meta ?? ""}
                  className={campoClase}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Terreno</span>
                <input
                  type="text"
                  name="terreno"
                  defaultValue={evento.recorrido?.terreno ?? ""}
                  className={campoClase}
                />
              </label>
            </div>

            <div
              className={tab === "contacto" ? "flex flex-col gap-5" : "hidden"}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={labelClase}>Organiza</span>
                  <input
                    type="text"
                    name="organizador"
                    defaultValue={evento.organizador ?? ""}
                    className={campoClase}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClase}>Aval</span>
                  <input
                    type="text"
                    name="aval"
                    defaultValue={evento.aval ?? ""}
                    className={campoClase}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>
                  Enlace de términos y condiciones
                </span>
                <input
                  type="url"
                  name="terminosUrl"
                  placeholder="https://..."
                  defaultValue={evento.terminosUrl ?? ""}
                  className={campoClase}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                className="rounded-full bg-naranja px-6 py-2.5 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
              >
                Guardar cambios
              </button>
            </div>
          </form>

          {tab === "resultados" && (
            <form action={publicarResultadosAction} className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-extrabold uppercase">
                  Resultados
                </span>
                <span
                  className={
                    evento.resultadosUrl
                      ? "rounded-full bg-naranja px-3 py-1 text-xs font-bold uppercase text-white"
                      : "rounded-full bg-casi-negro/[0.06] px-3 py-1 text-xs font-bold uppercase text-casi-negro"
                  }
                >
                  {evento.resultadosUrl ? "Publicados" : "Pendientes de publicar"}
                </span>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className={labelClase}>Enlace de resultados</span>
                <input
                  type="url"
                  name="resultadosUrl"
                  placeholder="https://..."
                  defaultValue={evento.resultadosUrl ?? ""}
                  className={campoClase}
                />
              </label>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="rounded-full bg-naranja px-6 py-2.5 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
                >
                  Publicar resultados
                </button>
                <span className="text-sm italic text-gris-oscuro">
                  Al publicar, &quot;Ver resultados&quot; aparecerá en la tarjeta
                  pública del evento.
                </span>
              </div>
            </form>
          )}

          {tab === "categorias" && (
            <div className="flex flex-col gap-4">
              {evento.categorias.length === 0 ? (
                <p className="italic text-gris-oscuro">
                  Este evento aún no tiene categorías. Si maneja costos
                  únicos en vez de categorías (ej. &quot;Individual&quot;,
                  &quot;Pareja&quot;), no hace falta crear ninguna aquí.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-[20px] bg-white shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
                  <table className="w-full min-w-[560px] table-auto text-left">
                    <thead>
                      <tr className="border-b border-casi-negro/10 text-sm font-bold uppercase tracking-wide text-gris-oscuro">
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Edad</th>
                        <th className="px-4 py-3">Nacimiento</th>
                        <th className="px-4 py-3">Pruebas</th>
                        <th className="px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evento.categorias.map((categoria) => (
                        <tr
                          key={categoria.id}
                          className="border-b border-casi-negro/[0.06] last:border-none"
                        >
                          <td className="px-4 py-3 font-bold">
                            {categoria.nombre}
                          </td>
                          <td className="px-4 py-3">{categoria.edad}</td>
                          <td className="px-4 py-3">{categoria.nacimiento}</td>
                          <td className="px-4 py-3">
                            {categoria.pruebas.length}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                aria-label="Editar categoría"
                                onClick={() => setModalCategoria(categoria.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-casi-negro/[0.06] text-casi-negro"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                aria-label="Eliminar categoría"
                                onClick={() => setModalCategoria(categoria.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-rojo/10 text-rojo"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                type="button"
                onClick={() => setModalCategoria("nueva")}
                className="flex w-fit items-center gap-2 rounded-full bg-naranja px-5 py-2.5 font-display text-sm font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Agregar categoría
              </button>

              <CategoriaModal
                abierto={modalCategoria !== null}
                categoria={
                  modalCategoria && modalCategoria !== "nueva"
                    ? evento.categorias.find((c) => c.id === modalCategoria)
                    : undefined
                }
                pruebasCatalogo={pruebasCatalogo}
                guardarAction={
                  modalCategoria && modalCategoria !== "nueva"
                    ? actualizarCategoriaAction.bind(
                        null,
                        modalCategoria,
                        evento.id
                      )
                    : crearCategoriaAction.bind(null, evento.id)
                }
                eliminarAction={
                  modalCategoria && modalCategoria !== "nueva"
                    ? eliminarCategoriaAction.bind(
                        null,
                        modalCategoria,
                        evento.id
                      )
                    : undefined
                }
                onCerrar={() => setModalCategoria(null)}
              />
            </div>
          )}

          {tab === "premios" && (
            <form
              action={guardarPremiosAction.bind(null, evento.id)}
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className={labelClase}>Hora de ceremonia</span>
                  <input
                    type="text"
                    name="ceremoniaHora"
                    defaultValue={evento.premios?.ceremoniaHora ?? ""}
                    className={campoClase}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={labelClase}>Lugar de ceremonia</span>
                  <input
                    type="text"
                    name="ceremoniaLugar"
                    defaultValue={evento.premios?.ceremoniaLugar ?? ""}
                    className={campoClase}
                  />
                </label>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-[72px] w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-casi-negro/[0.06]">
                  {evento.premios?.efectivoUrl ? (
                    <Image
                      src={evento.premios.efectivoUrl}
                      alt=""
                      width={96}
                      height={72}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1c0d0a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </div>
                <label className="flex cursor-pointer flex-col gap-1.5">
                  <span className="rounded-full bg-casi-negro/[0.06] px-4 py-1.5 font-display text-xs font-bold uppercase text-casi-negro">
                    Tabla de premiación en efectivo
                  </span>
                  <input
                    type="file"
                    name="efectivoImagen"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                </label>
              </div>

              <ListaTextoEditable
                nombreCampo="condiciones"
                etiqueta="Condiciones"
                valoresIniciales={
                  evento.premios?.condiciones.map((c) => c.texto) ?? []
                }
              />

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-naranja px-6 py-2.5 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          )}

          {tab === "reglamento" && (
            <form
              action={guardarReglamentoAction.bind(null, evento.id)}
              className="flex flex-col gap-5"
            >
              <ListaTextoEditable
                nombreCampo="competencia"
                etiqueta="Reglas de competencia"
                valoresIniciales={
                  evento.reglamento?.competencia.map((r) => r.texto) ?? []
                }
              />
              <ListaTextoEditable
                nombreCampo="seguridad"
                etiqueta="Normas de seguridad"
                valoresIniciales={
                  evento.reglamento?.seguridad.map((r) => r.texto) ?? []
                }
              />
              <ListaTextoEditable
                nombreCampo="controles"
                etiqueta="Puntos de control"
                valoresIniciales={
                  evento.reglamento?.controles.map((r) => r.texto) ?? []
                }
              />

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-naranja px-6 py-2.5 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          )}

          {tab === "logistica" && (
            <form
              action={guardarLogisticaAction.bind(null, evento.id)}
              className="flex flex-col gap-5"
            >
              <ListaTextoEditable
                nombreCampo="servicios"
                etiqueta="Servicios"
                valoresIniciales={
                  evento.logistica?.servicios.map((s) => s.texto) ?? []
                }
              />
              <ListaTextoEditable
                nombreCampo="recomendaciones"
                etiqueta="Recomendaciones"
                valoresIniciales={
                  evento.logistica?.recomendaciones.map((r) => r.texto) ?? []
                }
              />
              <ListaTextoEditable
                nombreCampo="kit"
                etiqueta="Kit del corredor"
                valoresIniciales={evento.logistica?.kit.map((k) => k.texto) ?? []}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-naranja px-6 py-2.5 font-display font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          )}

          {tab === "noticias" && (
            <div className="flex flex-col gap-4">
              {evento.noticias.length === 0 ? (
                <p className="italic text-gris-oscuro">
                  Este evento aún no tiene noticias publicadas.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-[20px] bg-white shadow-[0_10px_30px_rgba(28,13,10,0.10)]">
                  <table className="w-full min-w-[420px] table-auto text-left">
                    <thead>
                      <tr className="border-b border-casi-negro/10 text-sm font-bold uppercase tracking-wide text-gris-oscuro">
                        <th className="px-4 py-3">Título</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evento.noticias.map((noticia) => (
                        <tr
                          key={noticia.id}
                          className="border-b border-casi-negro/[0.06] last:border-none"
                        >
                          <td className="px-4 py-3 font-bold">
                            {noticia.titulo}
                          </td>
                          <td className="px-4 py-3">{noticia.fecha}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                aria-label="Editar noticia"
                                onClick={() => setModalNoticia(noticia.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-casi-negro/[0.06] text-casi-negro"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                aria-label="Eliminar noticia"
                                onClick={() => setModalNoticia(noticia.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-rojo/10 text-rojo"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                type="button"
                onClick={() => setModalNoticia("nueva")}
                className="flex w-fit items-center gap-2 rounded-full bg-naranja px-5 py-2.5 font-display text-sm font-bold uppercase text-white shadow-[0_6px_16px_rgba(241,88,8,0.35)]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Agregar noticia
              </button>

              <NoticiaModal
                abierto={modalNoticia !== null}
                noticia={
                  modalNoticia && modalNoticia !== "nueva"
                    ? evento.noticias.find((n) => n.id === modalNoticia)
                    : undefined
                }
                guardarAction={
                  modalNoticia && modalNoticia !== "nueva"
                    ? actualizarNoticiaAction.bind(
                        null,
                        modalNoticia,
                        evento.id
                      )
                    : crearNoticiaAction.bind(null, evento.id)
                }
                eliminarAction={
                  modalNoticia && modalNoticia !== "nueva"
                    ? eliminarNoticiaAction.bind(
                        null,
                        modalNoticia,
                        evento.id
                      )
                    : undefined
                }
                onCerrar={() => setModalNoticia(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
