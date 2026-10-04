import Script from "next/script";

// Fase 9, sección "Galería de momentos": reemplaza el grid de portadas de
// evento por el widget de Elfsight que el club ya tiene configurado con su
// feed de Instagram. `lazyOnload` porque es contenido decorativo, no
// crítico para la carga inicial — coincide con el `async` del snippet
// original y con el propio `data-elfsight-app-lazy` del widget (Elfsight
// ya difiere el render del contenido hasta que entra en viewport).
//
// `relative overflow-x-clip`: el widget inyecta piezas absolutas propias
// (ej. el panel "compartir" de su barra de herramientas, visible para
// quien administra el widget) que se salían ~55px por la derecha y en
// celular ensanchaban toda la página. `clip` en vez de `hidden` para no
// convertir la sección en contenedor de scroll.
export function GaleriaInstagram() {
  return (
    <section className="relative flex flex-col gap-6 overflow-x-clip">
      <h2 className="text-center font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
        Síguenos en Instagram
      </h2>
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
      <div
        className="elfsight-app-ace3027c-e81d-411e-af3f-3be4a95fc584"
        data-elfsight-app-lazy
      />
    </section>
  );
}
