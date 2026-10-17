// Guía para voluntarios de la entrega de kits (Fase 13.2). Se muestra
// desplegable en /kits/[token] (viene con la página, así que se puede leer
// aunque se caiga la señal) y como página propia en /kits/guia, para
// mandarla antes del evento. Los mensajes entre comillas son los textos
// exactos de EntregaKits.tsx: si cambian allá, actualizarlos aquí.

function Ui({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-md border border-casi-negro/15 bg-crema px-1 font-mono text-[0.85em]">
      {children}
    </span>
  );
}

const PASOS = [
  {
    titulo: "Abre el enlace con señal.",
    texto:
      "Hazlo antes de llegar a la mesa, con datos o wifi. El celular descarga la lista de inscritos y después puede trabajar aunque se caiga la señal.",
  },
  {
    titulo: (
      <>
        Escribe tu nombre y toca <Ui>Empezar</Ui>.
      </>
    ),
    texto:
      "Se pregunta una sola vez. Queda registrado en cada kit que entregues.",
  },
  {
    titulo: (
      <>
        Espera a ver <Ui>Escanear QR</Ui> activo.
      </>
    ),
    texto: (
      <>
        Mientras diga <Ui>Descargando lista…</Ui> todavía no está lista.
      </>
    ),
  },
];

const CASOS = [
  {
    titulo: "Verde: entrégalo",
    banda: null,
    accion: (
      <>
        Entrega el dorsal, la camiseta en la talla que aparece y lo que dice
        la lista del kit. Luego toca <Ui>Entregar kit</Ui> y verás{" "}
        <Ui>✓ Kit entregado</Ui>.
      </>
    ),
  },
  {
    titulo: "Rojo: ya fue entregado",
    banda: {
      clase: "bg-rojo text-white",
      texto:
        "Kit YA ENTREGADO el 17 dic, 8:15 a. m. por Lucía. No entregar de nuevo.",
    },
    accion:
      "No entregues nada. Si el atleta dice que no lo recibió, envíalo a la mesa de incidencias.",
  },
  {
    titulo: "Amarillo: el pago no está aprobado",
    banda: {
      clase: "bg-amarillo text-casi-negro",
      texto: "Pago PENDIENTE: no entregar. Enviar a la mesa de incidencias.",
    },
    accion:
      "No entregues. En la mesa le explican cómo completar el pago desde “Mis inscripciones”.",
  },
  {
    titulo: "Rojo: no aparece",
    banda: {
      clase: "bg-rojo text-white",
      texto:
        "Este QR no es de una inscripción de este evento. Envíalo a la mesa de incidencias.",
    },
    accion:
      "Puede ser un QR de otro evento o alguien que no está inscrito. Envíalo a la mesa.",
  },
];

export function GuiaEntregaKits() {
  return (
    <div className="flex flex-col gap-8 text-lg leading-snug text-casi-negro">
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-black uppercase">
          Antes de empezar
        </h2>
        <ol className="flex flex-col gap-3">
          {PASOS.map((paso, indice) => (
            <li key={indice} className="grid grid-cols-[2.25rem_1fr] gap-3">
              <span
                aria-hidden
                className="grid h-9 w-9 place-items-center rounded-full bg-naranja font-display text-xl font-black text-white"
              >
                {indice + 1}
              </span>
              <div>
                <strong className="block">{paso.titulo}</strong>
                <span className="text-gris-oscuro">{paso.texto}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-black uppercase">
          Con cada atleta
        </h2>
        <figure className="flex flex-col gap-2">
          <DiagramaEntrega />
          <figcaption className="text-base text-gris-oscuro">
            El color de la tarjeta decide qué hacer. Solo el verde tiene botón
            para entregar.
          </figcaption>
        </figure>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-black uppercase">
          Qué significa cada tarjeta
        </h2>
        {CASOS.map((caso) => (
          <div key={caso.titulo} className="flex flex-col gap-2">
            <h3 className="font-display text-xl font-bold uppercase">
              {caso.titulo}
            </h3>
            <span className="font-mono text-xs uppercase tracking-widest text-gris-oscuro">
              Ejemplo
            </span>
            {caso.banda ? (
              <p
                className={`rounded-xl p-3 font-bold ${caso.banda.clase}`}
              >
                {caso.banda.texto}
              </p>
            ) : (
              <TarjetaEjemplo />
            )}
            <p className="font-bold">
              <span className="text-naranja">→ </span>
              {caso.accion}
            </p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-black uppercase">
          Si no trae QR
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-naranja">
          <li>
            Escribe su número de documento en <Ui>Buscar por documento</Ui> y
            toca <Ui>Buscar</Ui>. Los puntos y espacios no importan.
          </li>
          <li>
            Compara los últimos 4 dígitos que muestra la tarjeta con su
            documento físico antes de entregar.
          </li>
          <li>
            Si salen varias tarjetas (por ejemplo, un pago rechazado y uno
            aprobado), entrega solo con la verde.
          </li>
          <li>Si la cámara no abre, usa siempre esta búsqueda.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-black uppercase">
          Si se cae la señal
        </h2>
        <p>Sigue entregando normal. Arriba de la pantalla verás algo así:</p>
        <div className="flex flex-wrap justify-between gap-2 rounded-xl border border-casi-negro/15 bg-crema px-4 py-2 text-base">
          <span>
            Entregando como <strong>Juan</strong>
          </span>
          <span className="font-bold text-rojo">
            Sin conexión · 7 por sincronizar
          </span>
        </div>
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-naranja">
          <li>
            Las entregas se guardan en tu celular y se suben solas cuando
            vuelve la señal.
          </li>
          <li>
            <strong>No recargues ni cierres la página sin señal:</strong> no
            vuelve a abrir hasta que haya internet. Lo que entregaste no se
            pierde.
          </li>
          <li>
            Si aparece el recuadro rojo <Ui>Para revisar en la mesa</Ui>, es
            porque dos puestos entregaron el mismo kit sin señal. Avísale a la
            mesa y después toca <Ui>Marcar como revisadas</Ui>.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3 rounded-[20px] bg-casi-negro p-5 text-crema">
        <h2 className="font-display text-2xl font-black uppercase text-naranja">
          Lo que nunca debes hacer
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-naranja">
          <li>Entregar un kit si la tarjeta está en rojo o amarillo.</li>
          <li>
            Entregar sin tocar <strong>Entregar kit</strong>: si no lo
            marcas, otro puesto puede volver a entregarlo.
          </li>
          <li>Compartir el enlace de entrega fuera del equipo de voluntarios.</li>
        </ul>
      </section>
    </div>
  );
}

// Calco de la tarjeta verde de EntregaKits.tsx, con datos de ejemplo.
function TarjetaEjemplo() {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-casi-negro/15 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="font-display text-xl font-extrabold uppercase">
            Laura Gómez Ríos
          </span>
          <span className="text-sm text-gris-oscuro">
            Documento terminado en 3456
          </span>
          <span className="text-sm text-gris-oscuro">10K Libre</span>
        </div>
        <span className="rounded-xl bg-casi-negro px-3 py-1 font-mono text-2xl font-bold text-crema">
          128
        </span>
      </div>
      <p>
        Camiseta talla <strong className="font-display text-2xl">M</strong>
      </p>
      <span className="rounded-full bg-green-600 px-5 py-3 text-center font-display font-bold uppercase text-white">
        Entregar kit
      </span>
    </div>
  );
}

// Flujo de decisión: QR o documento → color de la tarjeta → acción.
function DiagramaEntrega() {
  const flecha = "fill-none stroke-gris-oscuro";
  const caja = "fill-white stroke-casi-negro/20";
  const texto = "fill-casi-negro text-[13px] font-semibold";
  const blanco = "fill-white text-[13px] font-bold";
  return (
    <svg
      viewBox="0 0 340 422"
      role="img"
      aria-label="El atleta llega. Si trae QR, escanéalo; si no, búscalo por documento. Luego mira el color de la tarjeta: verde, entrega el kit; rojo porque ya fue entregado, no entregues; amarillo por pago pendiente o rojo porque no aparece, envíalo a la mesa de incidencias."
      className="mx-auto block h-auto w-full max-w-md font-body"
    >
      <defs>
        <marker
          id="punta-guia-kits"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-gris-oscuro" />
        </marker>
      </defs>

      <rect x="90" y="4" width="160" height="36" rx="18" className="fill-naranja" />
      <text x="170" y="27" textAnchor="middle" className={blanco}>
        Llega el atleta
      </text>
      <line x1="170" y1="40" x2="170" y2="62" strokeWidth="1.5" className={flecha} markerEnd="url(#punta-guia-kits)" />

      <polygon points="170,65 240,95 170,125 100,95" strokeWidth="1.5" className={caja} />
      <text x="170" y="99" textAnchor="middle" className={texto}>
        ¿Trae QR?
      </text>

      <path d="M100 95 H85 V148" strokeWidth="1.5" className={flecha} markerEnd="url(#punta-guia-kits)" />
      <text x="78" y="88" textAnchor="middle" className="fill-gris-oscuro text-xs font-bold">
        Sí
      </text>
      <path d="M240 95 H255 V148" strokeWidth="1.5" className={flecha} markerEnd="url(#punta-guia-kits)" />
      <text x="262" y="88" textAnchor="middle" className="fill-gris-oscuro text-xs font-bold">
        No
      </text>

      <rect x="10" y="152" width="150" height="40" rx="10" strokeWidth="1.5" className={caja} />
      <text x="85" y="176" textAnchor="middle" className={texto}>
        Escanear QR
      </text>
      <rect x="180" y="152" width="150" height="40" rx="10" strokeWidth="1.5" className={caja} />
      <text x="255" y="176" textAnchor="middle" className={texto}>
        Buscar por documento
      </text>

      <path d="M85 192 V212 H255 V192" strokeWidth="1.5" className={flecha} />
      <line x1="170" y1="212" x2="170" y2="230" strokeWidth="1.5" className={flecha} markerEnd="url(#punta-guia-kits)" />

      <rect x="60" y="234" width="220" height="36" rx="10" strokeWidth="1.5" className={caja} />
      <text x="170" y="257" textAnchor="middle" className={texto}>
        Mira el color de la tarjeta
      </text>

      <path d="M170 270 V284 M38 284 H302" strokeWidth="1.5" className={flecha} />
      {[38, 126, 214, 302].map((x) => (
        <line key={`a${x}`} x1={x} y1="284" x2={x} y2="300" strokeWidth="1.5" className={flecha} markerEnd="url(#punta-guia-kits)" />
      ))}

      {[
        { x: 0, fondo: "fill-verde", color: "fill-white", titulo: "VERDE", sub: "Sin entregar" },
        { x: 88, fondo: "fill-rojo", color: "fill-white", titulo: "ROJO", sub: "Ya entregado" },
        { x: 176, fondo: "fill-amarillo", color: "fill-casi-negro", titulo: "AMARILLO", sub: "Pago pendiente" },
        { x: 264, fondo: "fill-rojo", color: "fill-white", titulo: "ROJO", sub: "No aparece" },
      ].map((c) => (
        <g key={`c${c.x}`}>
          <rect x={c.x} y="304" width="76" height="46" rx="8" className={c.fondo} />
          <text x={c.x + 38} y="323" textAnchor="middle" className={`${c.color} text-[12.5px] font-bold`}>
            {c.titulo}
          </text>
          <text x={c.x + 38} y="340" textAnchor="middle" className={`${c.color} text-[11.5px] font-medium`}>
            {c.sub}
          </text>
          <line x1={c.x + 38} y1="350" x2={c.x + 38} y2="370" strokeWidth="1.5" className={flecha} markerEnd="url(#punta-guia-kits)" />
        </g>
      ))}

      <rect x="0" y="374" width="76" height="44" rx="8" strokeWidth="1.5" className={caja} />
      <text x="38" y="392" textAnchor="middle" className={texto}>
        Entrega
      </text>
      <text x="38" y="408" textAnchor="middle" className={texto}>
        el kit
      </text>
      <rect x="88" y="374" width="76" height="44" rx="8" strokeWidth="1.5" className={caja} />
      <text x="126" y="392" textAnchor="middle" className={texto}>
        No
      </text>
      <text x="126" y="408" textAnchor="middle" className={texto}>
        entregues
      </text>
      <rect x="176" y="374" width="164" height="44" rx="8" strokeWidth="1.5" className={caja} />
      <text x="258" y="400" textAnchor="middle" className={texto}>
        Mesa de incidencias
      </text>
    </svg>
  );
}
