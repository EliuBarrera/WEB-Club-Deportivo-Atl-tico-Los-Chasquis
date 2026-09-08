import Script from "next/script";

// Fase 9, sección "Galería de momentos": reemplaza el grid de portadas de
// evento por el widget de Elfsight que el club ya tiene configurado con su
// feed de Instagram. `lazyOnload` porque es contenido decorativo, no
// crítico para la carga inicial — coincide con el `async` del snippet
// original y con el propio `data-elfsight-app-lazy` del widget (Elfsight
// ya difiere el render del contenido hasta que entra en viewport).
export function GaleriaInstagram() {
  return (
    <section className="flex flex-col gap-6">
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
