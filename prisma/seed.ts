// ==========================================
// Seed de eventos existentes
// Datos migrados desde el objeto `eventsData` /
// `PRUEBAS_CATALOGO` de CalendarEvents.js (sitio WordPress actual).
// ==========================================

import "dotenv/config";
import dns from "node:dns";
import net from "node:net";
import { PrismaPg } from "@prisma/adapter-pg";
import { EstadoEvento, Genero, PrismaClient } from "@prisma/client";

// Ver nota en lib/prisma.ts: se evita que Node abra conexiones IPv4/IPv6
// en paralelo ("Happy Eyeballs"), que en algunas redes hace que el
// router bloquee las conexiones siguientes.
dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ------------------------------------------
// Catálogo global de pruebas
// ------------------------------------------

const pruebasCatalogo: {
  key: string;
  nombre: string;
  icon: string;
  genero?: Genero;
}[] = [
  { key: "50_m", nombre: "50 m planos", icon: "🏃" },
  { key: "80_m", nombre: "80 m planos", icon: "🏃" },
  { key: "100_m", nombre: "100 m planos", icon: "🏃" },
  { key: "150_m", nombre: "150 m planos", icon: "🏃" },
  { key: "200_m", nombre: "200 m planos", icon: "🏃" },
  { key: "400_m", nombre: "400 m planos", icon: "🏃" },
  { key: "500_m", nombre: "500 m planos", icon: "🏃" },
  { key: "600_m", nombre: "600 m planos", icon: "🏃" },
  { key: "800_m", nombre: "800 m planos", icon: "🏃" },
  { key: "1000_m", nombre: "1.000 m planos", icon: "🏃" },
  { key: "1200_m", nombre: "1.200 m planos", icon: "🏃" },
  { key: "1500_m", nombre: "1.500 m planos", icon: "🏃" },
  { key: "2000_m", nombre: "2.000 m planos", icon: "🏃" },
  { key: "3000_m", nombre: "3.000 m planos", icon: "🏃" },
  { key: "5000_m", nombre: "5.000 m planos", icon: "🏃" },
  { key: "10000_m", nombre: "10.000 m planos", icon: "🏃" },
  { key: "salto_largo", nombre: "Salto largo", icon: "🦘" },
  { key: "bala", nombre: "Impulsión de bala", icon: "⚫" },
  { key: "pelota", nombre: "Lanzamiento de pelota", icon: "🥎" },
  { key: "marcha_400", nombre: "400 m marcha", icon: "🏃‍♂️" },
  { key: "marcha_800", nombre: "800 m marcha", icon: "🏃‍♂️" },
  { key: "marcha_2000", nombre: "2.000 m marcha", icon: "🏃‍♂️" },
  { key: "marcha_3000", nombre: "3.000 m marcha", icon: "🏃‍♂️" },
  { key: "marcha_5000", nombre: "5.000 m marcha", icon: "🏃‍♂️" },
  { key: "marcha_10000", nombre: "10.000 m marcha", icon: "🏃‍♂️" },
  {
    key: "obs_2000",
    nombre: "2.000 m obstáculos",
    icon: "🚧🏃‍♀",
    genero: Genero.FEMENINO,
  },
  {
    key: "obs_3000",
    nombre: "3.000 m obstáculos",
    icon: "🚧🏃‍♂️",
    genero: Genero.MASCULINO,
  },
  {
    key: "cronoescalada_1800",
    nombre: "Cronoescalada 1.8 km (Desnivel +250m)",
    icon: "⛰️",
  },
];

// ------------------------------------------
// Tipos auxiliares para los datos de evento
// ------------------------------------------

type Categoria = { categoria: string; edad: string; nacimiento: string };

type ImagenProgramacion = { url: string; alt: string };

type Noticia = { titulo: string; fecha: string; contenido: string };

type EventoSeed = {
  title: string;
  subtitle: string;
  lema: string;
  price: number;
  descuento: string; // etiqueta del descuento, ej: "Pagando antes del 20 de febrero"
  discount: number;
  status: "open" | "closed";
  date: string; // texto en español, ej: "14 de marzo de 2026"
  location: string;
  mapUrl: string;
  time: string;
  description: string;
  image: string;
  resultados: string;
  terminosYCondiciones: string;
  details: {
    categorias: Categoria[];
    pruebasPorCategoria: Record<string, string[]>;
    cierre: string;
    aval: string;
    recorridos: {
      mapa?: string;
      programacion?: ImagenProgramacion[];
      datos_tecnicos?: {
        distancia?: string;
        desnivel?: string;
        salida?: string;
        meta?: string;
        modalidad?: string;
        terreno?: string;
      };
    };
    premios: {
      efectivo?: string;
      condiciones?: string[];
      ceremonia?: { hora?: string; lugar?: string };
    };
    reglamento: {
      competencia?: string[];
      seguridad?: string[];
      controles?: string[];
    };
    logistica: {
      servicios?: string[];
      recomendaciones?: string[];
      kit?: string[];
    };
    noticias?: Noticia[];
    objetivos?: string[];
    convocatoria?: string[];
    costos?: Record<string, number>;
    organizador?: string;
    lema_institucional?: string;
  };
};

// ------------------------------------------
// Los 6 eventos (fieles a eventsData en CalendarEvents.js)
// ------------------------------------------

const festivales: EventoSeed[] = [
  {
    title: "IV Festival Atlético Nuevas Figuras del Atletismo",
    subtitle: "Tunjano",
    lema: "Aquí comienza la historia de los campeones",
    price: 30000,
    descuento: "Pagando antes del 20 de febrero",
    discount: 0,
    status: "closed",
    date: "14 de marzo de 2026",
    location: "Estadio de Atletismo de Tunja",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!3d3971.167854786804!2d-73.35712398987052!3d5.542111133766891!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e6a7c3a0b1389db%3A0xf5103e44f30d2237!2sPista%20de%20Atletismo%20Tunja-Boy!5e0!3m2!1ses!2sco!4v1768029372996!5m2!1ses!2sco",
    time: "8:00 AM - 2:00 PM",
    description:
      "El IV Festival Atlético es un evento semillero de talentos y futuras promesas del atletismo boyacense. Un espacio para que los niños y jóvenes demuestren su potencial deportivo.",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
    resultados:
      "https://drive.google.com/file/d/15VjyvaeiIqo91eSNsga9BFaHAPwy7xaL/view?usp=sharing",
    terminosYCondiciones: "",
    details: {
      categorias: [
        { categoria: "SUB 6", edad: "4-5 años", nacimiento: "2022-2021" },
        { categoria: "SUB 8", edad: "6-7 años", nacimiento: "2020-2019" },
        { categoria: "SUB 10", edad: "8-9 años", nacimiento: "2018-2017" },
        { categoria: "SUB 12", edad: "10-11 años", nacimiento: "2016-2015" },
        { categoria: "SUB 14", edad: "12-13 años", nacimiento: "2014-2013" },
        { categoria: "SUB 16", edad: "14-15 años", nacimiento: "2012-2011" },
        { categoria: "SUB 18", edad: "16-17 años", nacimiento: "2010-2009" },
      ],
      pruebasPorCategoria: {
        "SUB 6": ["salto_largo", "50_m", "pelota"],
        "SUB 8": ["marcha_400", "salto_largo", "50_m", "pelota"],
        "SUB 10": ["marcha_400", "salto_largo", "80_m", "pelota", "400_m"],
        "SUB 12": ["marcha_400", "salto_largo", "80_m", "500_m", "bala"],
        "SUB 14": [
          "marcha_800",
          "salto_largo",
          "500_m",
          "100_m",
          "1000_m",
          "bala",
        ],
        "SUB 16": [
          "marcha_2000",
          "salto_largo",
          "100_m",
          "800_m",
          "1500_m",
          "bala",
        ],
        "SUB 18": [
          "marcha_3000",
          "salto_largo",
          "100_m",
          "800_m",
          "2000_m",
          "3000_m",
          "bala",
        ],
      },
      cierre: "20 de febrero de 2026 - 6:00 p.m.",
      aval: "Liga de Atletismo de Boyacá y Comisión Departamental de Juzgamiento",
      recorridos: {
        mapa: "https://www.google.com/maps/d/embed?mid=1ed1kjGhHaakO1HCScb_6aiALdo05Poc&ehbc=2E312F",
        programacion: [
          {
            url: "https://i.ibb.co/TB9mTssW/Programaci-n-y-Horario.png",
            alt: "Programación y Horario",
          },
        ],
      },
      premios: {
        condiciones: [
          "Reclamos antes de la ceremonia",
          "Presentar documento de identidad",
        ],
        ceremonia: {
          hora: "30 min, después de cada prueba",
          lugar: "Podio principal - Estadio de Atletismo",
        },
      },
      reglamento: {
        competencia: [
          "Salida según la programación",
          "Prohibido acompañamientos en la competencia",
          "Seguir recomendaciones de la comisión de juzgamiento",
          "No ocupar la pista y observar las pruebas desde fuera de la baranda a los NO participantes.",
        ],
        seguridad: [
          "Uso obligatorio del número en el pecho.",
          "Seguir indicaciones de los organizadores del evento",
          "Hidratación en puntos autorizados",
          "Reportar emergencias al personal de salud",
        ],
      },
      logistica: {
        servicios: [
          "2 puntos de hidratación [Oficinas de información y punto de llegada]",
          "Baños en el estadio atlético",
          "Zona de calentamiento habilitada [Adyacente a la piscina]",
          "Seguridad en el estadio [Grupo de emergencias boy scout | Grupo de Bomberos]",
          "Parqueadero disponible [capacidad limitada]",
        ],
        recomendaciones: [
          "Llegar 1 hora antes de la prueba.",
          "Traer hidratación personal.",
          "Usar ropa deportiva adecuada.",
        ],
      },
      noticias: [
        {
          titulo: "Inscripciones Abiertas",
          fecha: "15 de enero, 2026",
          contenido:
            "Ya están abiertas las inscripciones para el IV Festival Atlético. ¡No te quedes sin tu cupo!",
        },
        {
          titulo: "Descuento por Pronto Pago",
          fecha: "20 de enero, 2026",
          contenido:
            "Aprovecha $5.000 de descuento si te inscribes antes del 20 de febrero.",
        },
      ],
    },
  },
  {
    title: "XXXIX Festival Atlético Departamental",
    subtitle: "Club Atlético Los Chasquis",
    lema: "Semillero de campeones: el futuro del atletismo colombiano corre en Tunja",
    price: 40000,
    descuento: "Inscripción ordinaria hasta el 10 de abril",
    discount: 10000,
    status: "closed",
    date: "25 de abril de 2026",
    location: "Estadio de Atletismo de Tunja",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!3d3971.167854786804!2d-73.35712398987052!3d5.542111133766891!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e6a7c3a0b1389db%3A0xf5103e44f30d2237!2sPista%20de%20Atletismo%20Tunja-Boy!5e0!3m2!1ses!2sco!4v1768029372996!5m2!1ses!2sco",
    time: "7:00 AM - 5:00 PM",
    description:
      "Con su tradición, historia y vocación deportiva, Tunja será sede de uno de los encuentros más importantes del atletismo formativo en Colombia. Este festival tiene como objetivo fortalecer y promover el atletismo en las categorías formativas, impulsando el talento, la disciplina y los valores deportivos desde la base.",
    image:
      "https://i.ibb.co/5xSZDktr/XXXIX-Festival-Atl-tico-Departamental-Club-Atl-tico-Los-Chasquis.jpg",
    resultados:
      "https://drive.google.com/file/d/1mOuf1VRfT7gncuC00nFuL-HNqltXjDb-/view?usp=sharing",
    terminosYCondiciones:
      "https://drive.google.com/file/d/1vIcNAHUI2lq3DB6upjqumxk2NrbJYeZu/view?usp=sharing",
    details: {
      categorias: [
        { categoria: "SUB 4", edad: "2-3 años", nacimiento: "2024-2023" },
        { categoria: "SUB 6", edad: "4-5 años", nacimiento: "2022-2021" },
        { categoria: "SUB 8", edad: "6-7 años", nacimiento: "2020-2019" },
        { categoria: "SUB 10", edad: "8-9 años", nacimiento: "2018-2017" },
        { categoria: "SUB 12", edad: "10-11 años", nacimiento: "2016-2015" },
        { categoria: "SUB 14", edad: "12-13 años", nacimiento: "2014-2013" },
        { categoria: "SUB 16", edad: "14-15 años", nacimiento: "2012-2011" },
        { categoria: "SUB 18", edad: "16-17 años", nacimiento: "2010-2009" },
        { categoria: "MAYORES", edad: "18-39 años", nacimiento: "2008-1987" },
        { categoria: "MASTER", edad: "40-99 años", nacimiento: "1986-1927" },
      ],
      pruebasPorCategoria: {
        "SUB 4": ["50_m"],
        "SUB 6": ["50_m", "salto_largo", "pelota"],
        "SUB 8": ["50_m", "salto_largo", "pelota"],
        "SUB 10": ["80_m", "600_m", "salto_largo", "pelota"],
        "SUB 12": ["80_m", "150_m", "600_m", "salto_largo", "bala"],
        "SUB 14": ["150_m", "1200_m", "marcha_3000", "salto_largo", "bala"],
        "SUB 16": [
          "100_m",
          "200_m",
          "400_m",
          "800_m",
          "1200_m",
          "1500_m",
          "marcha_3000",
          "marcha_5000",
          "salto_largo",
          "bala",
          "obs_3000",
        ],
        "SUB 18": [
          "100_m",
          "200_m",
          "400_m",
          "800_m",
          "1500_m",
          "5000_m",
          "10000_m",
          "marcha_5000",
          "marcha_10000",
          "salto_largo",
          "bala",
          "obs_3000",
        ],
        MAYORES: [
          "100_m",
          "200_m",
          "400_m",
          "800_m",
          "1500_m",
          "5000_m",
          "10000_m",
          "marcha_10000",
          "salto_largo",
          "bala",
          "obs_3000",
        ],
        MASTER: ["1500_m", "5000_m", "10000_m"],
      },
      cierre: "10 de abril de 2026 - Inscripciones ordinarias",
      aval: "Liga de Atletismo de Boyacá, Federación Colombiana de Atletismo y World Athletics",
      recorridos: {
        mapa: "https://www.google.com/maps/d/embed?mid=1ed1kjGhHaakO1HCScb_6aiALdo05Poc&ehbc=2E312F",
        programacion: [
          {
            url: "https://i.ibb.co/HpzNm4KD/1era-Jornada.png",
            alt: "Programación y Horario - AM",
          },
          {
            url: "https://i.ibb.co/TMWgV0hK/2da-Jornada.png",
            alt: "Programación y Horario - PM",
          },
        ],
      },
      premios: {
        condiciones: [
          "Medalla de oro, plata y bronce a los tres primeros de cada prueba",
          "Presentar documento de identidad o registro civil original",
          "La premiación hace parte integral de la prueba",
        ],
        ceremonia: {
          hora: "20 minutos después de finalizada cada prueba",
          lugar: "Podio principal - Estadio de Atletismo",
        },
      },
      reglamento: {
        competencia: [
          "Cada atleta podrá participar en máximo dos (2) pruebas",
          "Salida según la programación establecida",
          "Prohibido acompañamiento durante la competencia",
          "Una vez cumplida su prueba, el deportista debe abandonar el escenario",
          "Seguir las normas de World Athletics, Federación Colombiana de Atletismo y Liga de Atletismo de Boyacá",
          "El número debe portarse en el pecho sin doblar ni recortar",
        ],
        seguridad: [
          "Uso obligatorio del número en el pecho",
          "Seguir indicaciones de los organizadores",
          "Servicio de primeros auxilios disponible",
          "El deportista declara encontrarse en condiciones físicas y de salud adecuadas",
          "Exoneración de responsabilidad por accidentes o lesiones",
        ],
      },
      logistica: {
        servicios: [
          "Servicio de primeros auxilios durante el evento",
          "Oficina de información en Liga de Atletismo",
          "Entrega de números y ganchos",
          "Baños en el estadio atlético",
          "Zona de calentamiento habilitada",
          "Parqueadero disponible [capacidad limitada]",
        ],
        recomendaciones: [
          "Llegar con anticipación para recoger el número desde las 6:00 a.m.",
          "Traer documento de identidad o registro civil original",
          "Usar ropa deportiva adecuada",
          "Traer hidratación personal",
          "Estar atento al llamado a pódium 15-20 minutos después de la prueba",
        ],
      },
      noticias: [
        {
          titulo: "Inscripciones Abiertas - XXXIX Festival",
          fecha: "20 de enero, 2026",
          contenido:
            "Ya están abiertas las inscripciones para el XXXIX Festival Atlético Departamental. ¡Inscríbete antes del 10 de abril y evita el recargo!",
        },
        {
          titulo: "Participantes de Todo el País",
          fecha: "25 de enero, 2026",
          contenido:
            "Este año esperamos recibir delegaciones de todo Colombia. El evento consolidará a Tunja como semillero de campeones del atletismo nacional.",
        },
        {
          titulo: "Inscripciones Extraordinarias",
          fecha: "11 de abril, 2026",
          contenido:
            "Si no alcanzaste a inscribirte, aún puedes hacerlo hasta el 18 de abril con un recargo de $10.000. El día del evento NO se recibirán inscripciones.",
        },
      ],
    },
  },
  {
    title: "III Cronoescalada Atlética",
    subtitle: "Siral - Cruz Blanca - Tres Cruces",
    lema: "Superando límites, alcanzando cumbres",
    price: 50000,
    descuento: "Inscripción ordinaria hasta el 30 de junio",
    discount: 0,
    status: "closed",
    // El objeto original tiene la clave de fecha "2026-07-12" pero el
    // texto "date" dice 19 de julio, consistente con la entrega de
    // dorsales el sábado 18 (noticia "Entrega de Dorsales"). Se usa el
    // texto explícito por ser el dato más consistente internamente.
    date: "19 de julio de 2026",
    location: "Chivatá, Boyacá",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.5!2d-73.4!3d5.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sChivat%C3%A1%2C%20Boyac%C3%A1!5e0!3m2!1ses!2sco!4v1234567890!5m2!1ses!2sco",
    time: "7:00 AM - 2:00 PM",
    description:
      "Evento deportivo de alta exigencia en modalidad de contrarreloj individual, donde cada paso cuenta y la cima se conquista con esfuerzo y determinación. Un recorrido exigente de 1.8 km con 250m+ de desnivel, paisajes imponentes y la mística de Tres Cruces invitan a corredores locales y visitantes a poner a prueba sus límites.",
    image: "https://i.ibb.co/hxrfz9HF/Portada.jpg",
    resultados: "",
    terminosYCondiciones: "",
    details: {
      categorias: [
        { categoria: "ÉLITE", edad: "18-39 años", nacimiento: "2008-1987" },
        { categoria: "JUVENIL", edad: "16-17 años", nacimiento: "2010-2009" },
        {
          categoria: "MASTER A",
          edad: "40-49 años",
          nacimiento: "1986-1977",
        },
        {
          categoria: "MASTER B",
          edad: "50+ años",
          nacimiento: "1976 o anterior",
        },
      ],
      pruebasPorCategoria: {
        ÉLITE: ["cronoescalada_1800"],
        JUVENIL: ["cronoescalada_1800"],
        "MASTER A": ["cronoescalada_1800"],
        "MASTER B": ["cronoescalada_1800"],
      },
      cierre: "30 de junio de 2026 o hasta agotar cupos",
      aval: "Liga de Atletismo de Boyacá y Alcaldía Municipal de Chivatá",
      recorridos: {
        mapa: "https://www.google.com/maps/d/embed?mid=MAPA_CRONOESCALADA",
        programacion: [
          {
            url: "https://i.ibb.co/nqH9CzQZ/imagen.png",
            alt: "Datos del recorrido",
          },
        ],
        datos_tecnicos: {
          distancia: "1.8 kilómetros",
          desnivel: "+250 metros",
          salida: "Mina del Siral",
          meta: "Sector Tres Cruces",
          modalidad: "Contrarreloj Individual (CRI)",
          terreno: "Montaña con ascenso continuo",
        },
      },
      premios: {
        efectivo: "https://i.ibb.co/gbQ5LyLB/imagen.png",
        condiciones: [
          "Medalla a todos los participantes que cumplan el recorrido.",
          "Premiación a los 5 primeros en cada categoría y rama, según tabla oficial.",
          "Presentar documento de identidad.",
          "La premiación se realizará en el sector Tres Cruces.",
        ],
        ceremonia: {
          hora: "Una vez finalizadas las pruebas",
          lugar: "Sector Tres Cruces",
        },
      },
      reglamento: {
        competencia: [
          "Salida individual con intervalos de 15 segundos entre participantes",
          "Si una categoría tiene más de 50 atletas, se autoriza salida simultánea de 2 deportistas",
          "Uso obligatorio del dorsal visible en el pecho durante toda la carrera",
          "Prohibido el acompañamiento durante la prueba",
          "Respetar la señalización y las indicaciones del personal organizador",
          "El incumplimiento de normas será causal de sanción o descalificación",
          "Edad mínima: 16 años cumplidos a la fecha del evento",
        ],
        seguridad: [
          "Cada participante asume plena responsabilidad sobre su estado de salud",
          "Indumentaria adecuada para atletismo de montaña obligatoria",
          "No se hace responsable por objetos perdidos durante el evento",
          "Exoneración de responsabilidad a la organización por accidentes",
        ],
        controles: [
          "Prohibido recibir ayuda o avituallamiento fuera de puntos establecidos",
          "Cada atleta debe portar su propio recipiente (no se entregan vasos)",
          "Arrojar residuos al entorno es causal de descalificación inmediata",
          "Dirección de Carrera y Comisión de Juzgamiento: máxima autoridad",
          "Decisiones del jurado son inapelables",
        ],
      },
      logistica: {
        servicios: [
          "Cronometraje oficial",
          "Marcaje del recorrido",
          "Avituallamiento líquido en Cruz Blanca y meta",
          "Asistencia médica y primeros auxilios",
          "Póliza de seguro",
          "Puntos de control en el recorrido",
        ],
        recomendaciones: [
          "Llegar el sábado 18 de julio para recoger el dorsal",
          "Presentar documento de identidad original",
          "Portar indumentaria adecuada para atletismo de montaña",
          "Llevar recipiente propio para hidratación",
          "Respetar el medio ambiente - no arrojar residuos",
          "Contar con condición física adecuada para prueba de montaña",
        ],
      },
      noticias: [
        {
          titulo: "Inscripciones Abiertas - III Cronoescalada",
          fecha: "1 de mayo, 2026",
          contenido:
            "¡Chivatá vuelve a retar a la montaña! Ya están abiertas las inscripciones para la III Cronoescalada Atlética. Inscríbete antes del 30 de junio.",
        },
        {
          titulo: "Un Desafío en las Alturas",
          fecha: "15 de mayo, 2026",
          contenido:
            "El recorrido combina pendiente, técnica y fortaleza mental. 1.8 km con 250m+ de desnivel desde la Mina del Siral hasta Tres Cruces. ¿Estás listo para conquistar la cima?",
        },
        {
          titulo: "Entrega de Dorsales",
          fecha: "1 de julio, 2026",
          contenido:
            "Recordatorio: La entrega de dorsales será el sábado 18 de julio en la Oficina de Deportes de la Alcaldía de Chivatá de 8:00 a.m. a 12:00 m. y de 2:00 p.m. a 5:00 p.m.",
        },
      ],
      objetivos: [
        "Fomentar la práctica del atletismo y el deporte de montaña",
        "Promover hábitos de vida saludable y el espíritu de superación",
        "Fortalecer el turismo deportivo en el municipio de Chivatá",
        "Integrar a la comunidad alrededor de un evento deportivo seguro y organizado",
      ],
      convocatoria: [
        "Corredores locales y regionales",
        "Atletas nacionales y visitantes",
        "Clubes deportivos y deportistas independientes",
        "Mínimo 16 años cumplidos a la fecha del evento",
      ],
    },
  },
  {
    title: "6K Running de Fuego",
    subtitle: "Carrera Atlética Recreativa",
    lema: "60 años protegiendo vidas",
    price: 90000,
    descuento: "Preventa del 6 de abril al 15 de mayo",
    discount: 10000, // (implícito: niños pagan 80.000, ver costos)
    status: "open",
    date: "5 de julio de 2026",
    location: "Tunja, Boyacá",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63538.988885760715!2d-73.39744091156842!3d5.539292576812422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e6a7c2e897fba5b%3A0xac9fda7e6b9aa68c!2zVHVuamEsIEJveWFjw6E!5e0!3m2!1ses-419!2sco!4v1776563708826!5m2!1ses-419!2sco",
    time: "7:00 AM",
    description:
      "Prepárate para vivir una experiencia que va más allá de una carrera. Este es un encuentro donde la energía, la solidaridad y el espíritu de servicio se unen para encender el corazón de Tunja. Cada paso que des será un homenaje al valor, disciplina y entrega de nuestros Bomberos, quienes día a día corren hacia el peligro para protegernos. Hoy, tú corres con ellos… y por ellos.",
    image: "https://i.ibb.co/7t4d8NZv/Portada.jpg",
    resultados: "",
    terminosYCondiciones: "",
    details: {
      categorias: [], // No especificadas en la fuente original
      pruebasPorCategoria: {},
      cierre: "15 de mayo de 2026 (fin de preventa)",
      aval: "",
      recorridos: {
        datos_tecnicos: {
          distancia: "6 kilómetros",
          modalidad: "Carrera recreativa",
          terreno: "Urbano",
        },
      },
      premios: {
        efectivo: "https://i.ibb.co/pB17HZw2/image.png",
        condiciones: [
          "USO DE FOTOS, VIDEOS Y MATERIAL AUDIOVISUAL",
          "Protección de datos personales y Términos y condiciones de la competencia",
        ],
        ceremonia: {
          lugar: "Meta - Llegada",
        },
      },
      reglamento: {},
      logistica: {
        servicios: ["Servicio médico", "Hidratación en ruta y zona de meta"],
        kit: [
          "Visera",
          "Tula deportiva",
          "Medalla de participación",
          "Camiseta conmemorativa",
        ],
        recomendaciones: [
          "Llega con al menos 1 hora de anticipación para evitar contratiempos en la salida.",
          "Hidrátate adecuadamente antes, durante y después de la competencia.",
          "Realiza un calentamiento previo para prevenir lesiones.",
          "Utiliza ropa y calzado adecuados según las condiciones del terreno y el clima.",
          "Respeta las indicaciones de la organización y el personal logístico durante todo el evento.",
        ],
      },
      noticias: [
        {
          titulo: "Inscripciones abiertas",
          fecha: "6 de abril, 2026",
          contenido:
            "Se abre la preventa para el evento Running de Fuego 6K organizado por Bomberos de Tunja.",
        },
      ],
      objetivos: [
        "Conmemorar los 60 años del Cuerpo de Bomberos",
        "Promover el deporte y la recreación",
        "Fortalecer la integración comunitaria",
      ],
      convocatoria: ["Adultos", "Niños", "Público en general"],
      costos: {
        adultos: 90000,
        ninos: 80000,
      },
      organizador: "Cuerpo de Bomberos Voluntarios de Tunja",
      lema_institucional: "Honor, Abnegación y Disciplina",
    },
  },
  {
    title: "XXXIX Carrera Atlética Ciudad de Tunja",
    subtitle: "",
    lema: "",
    price: 30000,
    descuento: "Primer plazo hasta el 25 de julio",
    discount: 0,
    status: "open",
    date: "9 de agosto de 2026",
    location: "Tunja, Boyacá",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63538.988885760715!2d-73.39744091156842!3d5.539292576812422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e6a7c2e897fba5b%3A0xac9fda7e6b9aa68c!2zVHVuamEsIEJveWFjw6E!5e0!3m2!1ses-419!2sco!4v1776563708826!5m2!1ses-419!2sco",
    time: "7:00 AM",
    description: "",
    image:
      "https://assets.grupify.com/events/115848ed-f5c5-4fde-a8a2-504aeba21b2c/recap/1780585659866-Cover_Ciudad_de_Tunja.png",
    resultados: "",
    terminosYCondiciones: "",
    details: {
      categorias: [
        { categoria: "SUB 8", edad: "6-7 años", nacimiento: "2020-2019" },
        { categoria: "SUB 10", edad: "8-9 años", nacimiento: "2018-2017" },
        { categoria: "SUB 12", edad: "10-11 años", nacimiento: "2016-2015" },
        { categoria: "SUB 14", edad: "12-13 años", nacimiento: "2014-2013" },
        { categoria: "SUB 16", edad: "14-15 años", nacimiento: "2012-2011" },
        { categoria: "SUB 18", edad: "16-17 años", nacimiento: "2010-2009" },
        { categoria: "MAYORES", edad: "20-39 años", nacimiento: "2006-1987" },
        {
          categoria: "VETERANOS A",
          edad: "40-49 años",
          nacimiento: "1986-1977",
        },
        {
          categoria: "VETERANOS B",
          edad: "50-59 años",
          nacimiento: "1976-1967",
        },
        {
          categoria: "VETERANOS C",
          edad: "60-99 años",
          nacimiento: "1966-1927",
        },
        {
          categoria: "RECREATIVA",
          edad: "18-99 años",
          nacimiento: "2008-1927",
        },
      ],
      pruebasPorCategoria: {},
      cierre: "4 de agosto de 2026 - 6:00 p.m.",
      aval: "Liga de Atletismo de Boyacá y Federación Colombiana de Atletismo",
      recorridos: {
        mapa: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63538.988885760715!2d-73.39744091156842!3d5.539292576812422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e6a7c2e897fba5b%3A0xac9fda7e6b9aa68c!2zVHVuamEsIEJveWFjw6E!5e0!3m2!1ses-419!2sco!4v1776563708826!5m2!1ses-419!2sco",
        programacion: [
          {
            url: "https://i.ibb.co/997hMjtc/Categor-as.png",
            alt: "Datos del recorrido",
          },
        ],
      },
      premios: {
        efectivo: "https://i.ibb.co/PZBtV629/Premiaci-n.png",
        condiciones: [
          "La premiación en efectivo se entrega según tabla de premiación publicada",
          "Obligatorio firmar las planillas oficiales de premiación",
          "Presentarse al podio 20 minutos después de finalizada la prueba",
          "En caso de no presentarse, el premio se entrega al finalizar el evento",
          "La premiación hace parte integral de la competencia",
          "Presentar fotocopia del documento de identidad",
        ],
        ceremonia: {
          hora: "20 minutos después de finalizada cada prueba",
          lugar: "Podio principal",
        },
      },
      reglamento: {
        competencia: [
          "En el desarrollo de las pruebas, no se permitirá el acompañamiento",
          "El deportista declara encontrarse en óptimas condiciones físicas, médicas y de salud",
          "El deportista acepta las Políticas de Participación y Exoneración de Responsabilidad disponibles en www.clubloschasquis.com/eventos",
          "El Club Los Chasquis, el comité organizador y entidades vinculadas quedan exonerados de responsabilidad civil, penal o administrativa por accidentes o lesiones",
          "El deportista se compromete a cumplir los reglamentos de World Athletics, la Federación Colombiana de Atletismo y la Liga de Atletismo de Boyacá",
          "El número de competencia es obligatorio y debe portarse visible en el pecho durante toda la prueba",
        ],
        seguridad: [
          "Uso obligatorio del número en el pecho durante toda la prueba",
          "Servicio de primeros auxilios disponible durante el evento",
          "El deportista o su representante legal asume plena responsabilidad sobre su estado de salud",
        ],
      },
      logistica: {
        servicios: [
          "Servicio de primeros auxilios durante el evento",
          "Entrega de kits el 8 de agosto desde las 8:00 a.m. (lugar por confirmar)",
        ],
        recomendaciones: [
          "Llegar con anticipación para calentamiento y ubicación en zona de salida",
          "Presentar documento de identidad y comprobante de inscripción para reclamar el kit",
          "Portar número de competencia visible en el pecho durante toda la prueba",
          "Kit adicional (tula + camiseta oficial): pago adicional de $40.000 al WhatsApp 3112644205",
          "Grupos de 10 deportistas inscritos: un (1) cupo adicional gratuito",
        ],
      },
      noticias: [
        {
          titulo:
            "Inscripciones Abiertas - XXXIX Carrera Atlética Ciudad de Tunja",
          fecha: "1 de julio, 2026",
          contenido:
            "Ya están abiertas las inscripciones para la XXXIX Carrera Atlética Ciudad de Tunja. Primer plazo hasta el 25 de julio: $90.000 (Mayores, Recreativa, Veteranos A-B-C) y $30.000 (Sub 12 – Sub 14 – Sub 16).",
        },
        {
          titulo: "Segundo Plazo de Inscripción",
          fecha: "26 de julio, 2026",
          contenido:
            "Del 26 de julio al 4 de agosto: $100.000 (Mayores, Recreativa, Veteranos A-B-C) y $40.000 (Sub 12 – Sub 14 – Sub 16). ¡No te quedes por fuera!",
        },
        {
          titulo: "Pasaporte Runner Boyacá 2026",
          fecha: "1 de julio, 2026",
          contenido:
            "Inscríbete en las 3 carreras del circuito (Ciudad de Tunja, Chiquinquirá y Villa de Leyva) y recibe un 10% de descuento en el valor total. Información: 311 264 4205 / chasquis1981@gmail.com",
        },
      ],
    },
  },
  {
    title: 'III Carrera Atlética Chiquinquirá "Villa Republicana"',
    subtitle: "",
    lema: "Donde la historia corre hacia la gloria",
    price: 30000,
    descuento: "Primer plazo hasta el 20 de agosto",
    discount: 0,
    status: "open",
    date: "6 de septiembre de 2026",
    location: "Parque Julio Flórez, Chiquinquirá, Boyacá",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0!2d-73.8169!3d5.6195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e40e1b2c3d4e5f6%3A0x0!2sParque+Julio+Fl%C3%B3rez%2C+Chiquinquir%C3%A1!5e0!3m2!1ses!2sco!4v1234567890!5m2!1ses!2sco",
    time: "7:00 AM",
    description: "",
    image:
      "https://assets.grupify.com/events/932bc42b-32cc-4042-a4f7-dd4f269628d3/recap/1780770074786-portada_chiquinqura.png",
    resultados: "",
    terminosYCondiciones: "",
    details: {
      categorias: [
        { categoria: "SUB 8", edad: "6-7 años", nacimiento: "2020-2019" },
        { categoria: "SUB 10", edad: "8-9 años", nacimiento: "2018-2017" },
        { categoria: "SUB 12", edad: "10-11 años", nacimiento: "2016-2015" },
        { categoria: "SUB 14", edad: "12-13 años", nacimiento: "2014-2013" },
        { categoria: "SUB 16", edad: "14-15 años", nacimiento: "2012-2011" },
        { categoria: "SUB 18", edad: "16-17 años", nacimiento: "2010-2009" },
        { categoria: "MAYORES", edad: "20-39 años", nacimiento: "2006-1987" },
        {
          categoria: "VETERANOS A",
          edad: "40-49 años",
          nacimiento: "1986-1977",
        },
        {
          categoria: "VETERANOS B",
          edad: "50-59 años",
          nacimiento: "1976-1967",
        },
        {
          categoria: "VETERANOS C",
          edad: "60-99 años",
          nacimiento: "1966-1927",
        },
        {
          categoria: "RECREATIVA",
          edad: "18-99 años",
          nacimiento: "2008-1927",
        },
      ],
      pruebasPorCategoria: {},
      cierre: "2 de septiembre de 2026 - 6:00 p.m.",
      aval: "Liga de Atletismo de Boyacá y Federación Colombiana de Atletismo",
      recorridos: {
        mapa: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0!2d-73.8169!3d5.6195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e40e1b2c3d4e5f6%3A0x0!2sParque+Julio+Fl%C3%B3rez%2C+Chiquinquir%C3%A1!5e0!3m2!1ses!2sco!4v1234567890!5m2!1ses!2sco",
        programacion: [
          {
            url: "https://i.ibb.co/997hMjtc/Categor-as.png",
            alt: "Datos del recorrido",
          },
        ],
      },
      premios: {
        efectivo: "https://i.ibb.co/PZBtV629/Premiaci-n.png",
        condiciones: [
          "La premiación en efectivo se entrega según tabla de premiación publicada",
          "Obligatorio firmar las planillas oficiales de premiación",
          "Presentarse al podio 20 minutos después de finalizada la prueba",
          "En caso de no presentarse, el premio se entrega al finalizar el evento",
          "La premiación hace parte integral de la competencia",
          "Presentar fotocopia del documento de identidad",
        ],
        ceremonia: {
          hora: "20 minutos después de finalizada cada prueba",
          lugar: "Podio principal - Parque Julio Flórez",
        },
      },
      reglamento: {
        competencia: [
          "En el desarrollo de las pruebas, no se permitirá el acompañamiento",
          "El deportista declara encontrarse en óptimas condiciones físicas, médicas y de salud",
          "El deportista acepta las Políticas de Participación y Exoneración de Responsabilidad disponibles en www.clubloschasquis.com/eventos",
          "El Club Los Chasquis, el comité organizador y entidades vinculadas quedan exonerados de responsabilidad civil, penal o administrativa por accidentes o lesiones",
          "El deportista se compromete a cumplir los reglamentos de World Athletics, la Federación Colombiana de Atletismo y la Liga de Atletismo de Boyacá",
          "El número de competencia es obligatorio y debe portarse visible durante toda la prueba",
        ],
        seguridad: [
          "Uso obligatorio del número de competencia en lugar visible durante toda la prueba",
          "Servicio de primeros auxilios disponible durante el evento",
          "El deportista o su representante legal asume plena responsabilidad sobre su estado de salud",
        ],
      },
      logistica: {
        servicios: [
          "Servicio de primeros auxilios durante el evento",
          "Entrega de kits el 7 de agosto desde las 8:00 a.m. (lugar por confirmar)",
        ],
        recomendaciones: [
          "Llegar con anticipación para calentamiento y ubicación en zona de salida",
          "Presentar documento de identidad y comprobante de inscripción para reclamar el kit",
          "Portar número de competencia en lugar visible durante toda la prueba",
          "Kit adicional (tula + camiseta oficial): pago adicional de $40.000 al WhatsApp 3112644205",
          "Grupos de 10 deportistas inscritos: un (1) cupo adicional gratuito",
        ],
      },
      noticias: [
        {
          titulo:
            "Inscripciones Abiertas - III Carrera Atlética Chiquinquirá",
          fecha: "1 de agosto, 2026",
          contenido:
            'Ya están abiertas las inscripciones para la III Carrera Atlética Chiquinquirá "Villa Republicana". Primer plazo hasta el 20 de agosto: $90.000 (Mayores, Recreativa, Veteranos A-B-C) y $30.000 (Sub 12 – Sub 14 – Sub 16).',
        },
        {
          titulo: "Segundo Plazo de Inscripción",
          fecha: "21 de agosto, 2026",
          contenido:
            "Del 21 de agosto al 2 de septiembre: $100.000 (Mayores, Recreativa, Veteranos A-B-C) y $40.000 (Sub 12 – Sub 14 – Sub 16). ¡No te quedes por fuera de la fiesta atlética de Chiquinquirá!",
        },
        {
          titulo: "Pasaporte Runner Boyacá 2026",
          fecha: "1 de agosto, 2026",
          contenido:
            "Inscríbete en las 3 carreras del circuito (Ciudad de Tunja, Chiquinquirá y Villa de Leyva) y recibe un 10% de descuento en el valor total. Información: 311 264 4205 / chasquis1981@gmail.com",
        },
      ],
    },
  },
];

// ------------------------------------------
// Helpers
// ------------------------------------------

function orNull(value: string | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

const MESES: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

// Convierte "14 de marzo de 2026" -> Date UTC del día indicado
function parseFechaEs(texto: string): Date {
  const match = texto
    .toLowerCase()
    .match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+de\s+(\d{4})/);
  if (!match) {
    throw new Error(`No se pudo interpretar la fecha: "${texto}"`);
  }
  const [, dia, mesTexto, anio] = match;
  const mes = MESES[mesTexto];
  if (mes === undefined) {
    throw new Error(`Mes desconocido en la fecha: "${texto}"`);
  }
  return new Date(Date.UTC(Number(anio), mes, Number(dia)));
}

const ESTADO_POR_STATUS: Record<"open" | "closed", EstadoEvento> = {
  open: EstadoEvento.ABIERTO,
  closed: EstadoEvento.CERRADO,
};

// ------------------------------------------
// Documentos legales (Fase 9) — transparencia institucional
// ------------------------------------------

// Lista real tomada de Documentation/reglamento-legal-section.html (HTML
// de referencia subido por Alejandro, con enlaces reales a Google Drive del
// club) — no se inventan documentos ni URLs.
const documentosLegales = [
  {
    nombre: "Certificación de cargos directivos",
    url: "https://drive.google.com/file/d/1-E_Bq9DPALRPSL1uJBqxb8wrquFA1OXS/view?usp=drive_link",
  },
  {
    nombre: "Certificación de Representante Legal sobre antecedentes",
    url: "https://drive.google.com/file/d/1UBahXiKxg0UBEns-5cCVNVaDo-2b_mHF/view?usp=drive_link",
  },
  {
    nombre: "Estatutos",
    url: "https://drive.google.com/file/d/124OerS9HtJOvQH_LcdCuHlshhSWlZ5zU/view?usp=drive_link",
  },
  {
    nombre: "Certificación de requisitos",
    url: "https://drive.google.com/file/d/1EuxQnRtO0DEj3CHjHgvXNLHnbTUa3Y-u/view?usp=drive_link",
  },
  {
    nombre: "Certificado existencia y representante legal",
    url: "https://drive.google.com/file/d/1F4mkkAorbir9GzOrrXphKEFwmw-5SjnR/view?usp=drive_link",
  },
  {
    nombre: "Estados financieros",
    url: "https://drive.google.com/file/d/1iMcavB_4UEf_28w9OepaWF1jGdbxc0rc/view?usp=drive_link",
  },
  {
    nombre: "Acta de Asamblea",
    url: "https://drive.google.com/file/d/1K31fOIjt9q7hXjyI6SlBS_INtqqN4nWg/view?usp=drive_link",
  },
  {
    nombre: "Informe presidencial",
    url: "https://drive.google.com/file/d/1-hGt3SxaigLaEx29RJuemlYpHIp8grXC/view?usp=drive_link",
  },
  {
    nombre: "Renta 2025",
    url: "https://drive.google.com/file/d/1MQjlLG9N72PaiJD6GiVZ2juC3GrcPMGO/view?usp=drive_link",
  },
  {
    nombre: "Historial",
    url: "https://drive.google.com/drive/folders/1pXnOYxWcLwcoKlVCkzuyuTUCzbh2QO1E?usp=drive_link",
  },
];

// ------------------------------------------
// Cifras de confianza (Fase 9) — franja de la home
// ------------------------------------------

// Cifras reales entregadas por el club (2026-09-08) para la franja de
// confianza de la home — no se inventan, se guardan tal cual se dieron.
const cifrasConfianza = [
  { etiqueta: "Años de historia", valor: "45+" },
  { etiqueta: "Eventos organizados", valor: "100+" },
  { etiqueta: "Atletas participantes", valor: "5.000+" },
  { etiqueta: "Categorías para participar", valor: "15+" },
];

// ------------------------------------------
// Testimonios (Fase 9) — sección de la home
// ------------------------------------------

// Fotos reales (2026-09-08), autorizadas por las personas para su uso en
// el sitio, anónimas a pedido del club. Las citas son las frases que ya
// vienen sobreimpresas en cada foto (no se redactó texto nuevo). La foto 1
// es de un atleta de otro club que participa en eventos de Los Chasquis
// (confirmado por el club) — se deja el rol así, no se asume que sea
// socio del club.
const testimonios = [
  {
    rol: "Atleta invitado de otro club",
    cita: "Hoy celebramos el esfuerzo de todos los que aceptaron el reto.",
    fotoUrl: "/Testimonio1.jpg",
  },
  {
    rol: "Atleta participante",
    cita: "Cada paso puso a prueba la fuerza y la determinación.",
    fotoUrl: "/Testimonio2.jpg",
  },
  {
    rol: "Atleta participante",
    cita: "La montaña exigió lo mejor de cada corredor.",
    fotoUrl: "/Testimonio3.jpg",
  },
];

// ------------------------------------------
// Socios / respaldo institucional (Fase 9) — sección de la home
// ------------------------------------------

// Logos reales entregados por el club (carpeta public/Socios/,
// 2026-09-08). "SQ" y "EJC" se guardan con las iniciales tal como
// aparecen impresas en su propio logo — no se inventó ni se expandió el
// nombre completo de esas dos entidades.
const socios = [
  { nombre: "Liga de Atletismo de Boyacá", logoUrl: "/Socios/liga-atletismo-boyaca.png" },
  { nombre: "Indeportes Boyacá", logoUrl: "/Socios/indeportes.png" },
  { nombre: "IRDET", logoUrl: "/Socios/irdet.png" },
  { nombre: "Alcaldía de Chivatá", logoUrl: "/Socios/alcaldia-chivata.png" },
  { nombre: "Comisión Departamental de Juzgamiento", logoUrl: "/Socios/comision-departamental-juzgamiento.png" },
  { nombre: "Bomberos Tunja", logoUrl: "/Socios/bomberos-tunja.png" },
  { nombre: "Policía Nacional", logoUrl: "/Socios/policia-nacional.png" },
  { nombre: "EJC", logoUrl: "/Socios/ejc.png" },
  { nombre: "Financiera Comultrasan", logoUrl: "/Socios/financiera-comultrasan.png" },
  { nombre: "Central Colombiana de Aseo", logoUrl: "/Socios/central-colombiana-de-aseo.png" },
  { nombre: "Urbaser", logoUrl: "/Socios/urbaser.png" },
  { nombre: "Veolia", logoUrl: "/Socios/veolia.png" },
  { nombre: "DC Investigaciones", logoUrl: "/Socios/dc-investigaciones.png" },
  { nombre: "Distribucarnes Normandía", logoUrl: "/Socios/distribucarnes-normandia.png" },
  { nombre: "Las Hinojosas", logoUrl: "/Socios/las-hinojosas.png" },
  { nombre: "Minas El Siral", logoUrl: "/Socios/minas-el-siral.png" },
  { nombre: "Panadería mi Soffi", logoUrl: "/Socios/panaderia-mi-soffi.png" },
  { nombre: "SQ", logoUrl: "/Socios/sq.png" },
];

// ------------------------------------------
// Términos y Condiciones (Fase 4) — versión 1
// ------------------------------------------

// Generalizado a partir de "Políticas Obligatorias de Participación 2026"
// (documento real de un evento del club, ver Documentation/), quitando lo
// específico de esa carrera (fechas, precios, nombre del evento): esto es
// el bloque institucional común a todos los eventos. Las secciones que sí
// varían por evento (kit, premiación en efectivo) se arman en el modal a
// partir de Logistica/Premios, no van acá. El bloque de tratamiento de
// datos queda como TODO: el documento de referencia no incluye ese texto,
// y el proyecto no inventa contenido legal — el club debe redactarlo y
// editarlo desde el panel admin.
const CONTENIDO_TERMINOS_V1 = `REGLAMENTO GENERAL DEL EVENTO

1. La participación en el evento solo será válida para personas debidamente inscritas.
2. El número de competencia es obligatorio y debe portarse visible durante toda la prueba.
3. En el desarrollo de las pruebas no se permitirá el acompañamiento.
4. El deportista declara encontrarse en óptimas condiciones físicas, médicas y de salud.
5. El deportista se compromete a cumplir los reglamentos de World Athletics, la Federación Colombiana de Atletismo y la Liga de Atletismo de Boyacá.
6. El deportista acepta estas Políticas de Participación y Exoneración de Responsabilidad.

NORMAS DE SEGURIDAD

1. Uso obligatorio del número de competencia en lugar visible durante toda la prueba.
2. Servicio de primeros auxilios disponible durante el evento.
3. El deportista, o su representante legal en caso de menores de edad, asume plena responsabilidad sobre su estado de salud.

PREMIACIÓN

1. La premiación en efectivo, cuando aplique, se entrega según la tabla de premiación publicada para el evento.
2. Es obligatorio firmar las planillas oficiales de premiación.
3. El deportista debe presentarse al podio 20 minutos después de finalizada la prueba.
4. En caso de no presentarse, el premio se entrega al finalizar el evento.
5. La premiación hace parte integral de la competencia.
6. Se debe presentar fotocopia del documento de identidad.

TRATAMIENTO DE DATOS PERSONALES

[TODO: pendiente de redacción legal del club — completar y actualizar desde el panel admin. Debe cubrir a qué se autoriza el tratamiento de datos personales del deportista (y de su acudiente, si es menor de edad) conforme a la Ley 1581 de 2012.]

EXONERACIÓN DE RESPONSABILIDAD

El deportista declara encontrarse en óptimas condiciones físicas, médicas y de salud, y acepta estas Políticas de Participación y Exoneración de Responsabilidad. El Club Deportivo Atlético Los Chasquis, el comité organizador y las entidades vinculadas quedan exonerados de responsabilidad civil, penal o administrativa por accidentes o lesiones ocurridos antes, durante o después del evento.

DECLARACIÓN DE ACEPTACIÓN

Al formalizar su inscripción, el participante declara haber leído, entendido y aceptado en su totalidad el reglamento, las condiciones de participación y la exoneración de responsabilidad aquí establecidas. La participación se hace bajo absoluta responsabilidad del atleta. La aceptación de estas políticas es obligatoria para formalizar la inscripción.`;

// ------------------------------------------
// Seed
// ------------------------------------------

async function main() {
  console.log("Sembrando catálogo global de pruebas...");
  for (const prueba of pruebasCatalogo) {
    await prisma.pruebaCatalogo.upsert({
      where: { key: prueba.key },
      update: { nombre: prueba.nombre, icon: prueba.icon, genero: prueba.genero },
      create: prueba,
    });
  }

  console.log("Eliminando eventos existentes (reseed idempotente)...");
  await prisma.evento.deleteMany();

  console.log(`Creando ${festivales.length} eventos...`);
  for (const festival of festivales) {
    const d = festival.details;

    await prisma.evento.create({
      data: {
        titulo: festival.title,
        subtitulo: orNull(festival.subtitle),
        lema: orNull(festival.lema),
        precio: festival.price,
        descuento: festival.discount,
        descuentoLabel: orNull(festival.descuento),
        estado: ESTADO_POR_STATUS[festival.status],
        fecha: parseFechaEs(festival.date),
        horario: orNull(festival.time),
        ubicacion: festival.location,
        mapUrl: orNull(festival.mapUrl),
        descripcion: orNull(festival.description),
        imagenUrl: orNull(festival.image),
        resultadosUrl: orNull(festival.resultados),
        terminosUrl: orNull(festival.terminosYCondiciones),
        cierreInscripciones: orNull(d.cierre),
        aval: orNull(d.aval),
        organizador: orNull(d.organizador),
        lemaInstitucional: orNull(d.lema_institucional),

        categorias: {
          create: d.categorias.map((cat, index) => ({
            nombre: cat.categoria,
            edad: cat.edad,
            nacimiento: cat.nacimiento,
            orden: index,
            pruebas: {
              create: (d.pruebasPorCategoria[cat.categoria] ?? []).map(
                (pruebaKey) => ({
                  prueba: { connect: { key: pruebaKey } },
                })
              ),
            },
          })),
        },

        recorrido: {
          create: {
            mapaUrl: orNull(d.recorridos.mapa),
            distancia: orNull(d.recorridos.datos_tecnicos?.distancia),
            desnivel: orNull(d.recorridos.datos_tecnicos?.desnivel),
            salida: orNull(d.recorridos.datos_tecnicos?.salida),
            meta: orNull(d.recorridos.datos_tecnicos?.meta),
            modalidad: orNull(d.recorridos.datos_tecnicos?.modalidad),
            terreno: orNull(d.recorridos.datos_tecnicos?.terreno),
            programacion: {
              create: (d.recorridos.programacion ?? []).map((img, index) => ({
                url: img.url,
                alt: img.alt,
                orden: index,
              })),
            },
          },
        },

        premios: {
          create: {
            efectivoUrl: orNull(d.premios.efectivo),
            ceremoniaHora: orNull(d.premios.ceremonia?.hora),
            ceremoniaLugar: orNull(d.premios.ceremonia?.lugar),
            condiciones: {
              create: (d.premios.condiciones ?? []).map((texto, index) => ({
                texto,
                orden: index,
              })),
            },
          },
        },

        reglamento: {
          create: {
            competencia: {
              create: (d.reglamento.competencia ?? []).map((texto, index) => ({
                texto,
                orden: index,
              })),
            },
            seguridad: {
              create: (d.reglamento.seguridad ?? []).map((texto, index) => ({
                texto,
                orden: index,
              })),
            },
            controles: {
              create: (d.reglamento.controles ?? []).map((texto, index) => ({
                texto,
                orden: index,
              })),
            },
          },
        },

        logistica: {
          create: {
            servicios: {
              create: (d.logistica.servicios ?? []).map((texto, index) => ({
                texto,
                orden: index,
              })),
            },
            recomendaciones: {
              create: (d.logistica.recomendaciones ?? []).map(
                (texto, index) => ({ texto, orden: index })
              ),
            },
            kit: {
              create: (d.logistica.kit ?? []).map((texto, index) => ({
                texto,
                orden: index,
              })),
            },
          },
        },

        noticias: {
          create: (d.noticias ?? []).map((noticia, index) => ({
            titulo: noticia.titulo,
            fecha: noticia.fecha,
            contenido: noticia.contenido,
            orden: index,
          })),
        },

        objetivos: {
          create: (d.objetivos ?? []).map((texto, index) => ({
            texto,
            orden: index,
          })),
        },

        convocatoria: {
          create: (d.convocatoria ?? []).map((texto, index) => ({
            texto,
            orden: index,
          })),
        },

        costos: {
          create: Object.entries(d.costos ?? {}).map(([tipo, valor]) => ({
            tipo,
            valor,
          })),
        },
      },
    });

    console.log(`  ✓ ${festival.title}`);
  }

  // A diferencia de los eventos, TerminosBase NO se borra/recrea en cada
  // corrida: es contenido editable desde el admin (Fase 4), así que un
  // reseed no debe pisar ediciones reales del club. Solo siembra la
  // versión 1 si la tabla está vacía.
  const yaHayTerminos = await prisma.terminosBase.count();
  if (yaHayTerminos === 0) {
    console.log("Sembrando Términos y Condiciones (versión 1)...");
    await prisma.terminosBase.create({
      data: { version: 1, contenido: CONTENIDO_TERMINOS_V1 },
    });
  }

  // Documentos legales (Fase 9): igual que TerminosBase, se usa `upsert` por
  // `url` (no delete+recreate) para no pisar ediciones que el admin ya haya
  // hecho desde /admin/documentos. Lista real tomada de
  // Documentation/reglamento-legal-section.html (subido por Alejandro).
  console.log("Sembrando documentos legales...");
  for (const [index, documento] of documentosLegales.entries()) {
    await prisma.documentoLegal.upsert({
      where: { url: documento.url },
      update: { nombre: documento.nombre, orden: index },
      create: { nombre: documento.nombre, url: documento.url, orden: index },
    });
  }

  // Cifras de confianza (Fase 9): mismo criterio que documentos legales —
  // `upsert` por `etiqueta` para no pisar ediciones que el admin ya haya
  // hecho desde /admin/cifras.
  console.log("Sembrando cifras de confianza...");
  for (const [index, cifra] of cifrasConfianza.entries()) {
    await prisma.cifraConfianza.upsert({
      where: { etiqueta: cifra.etiqueta },
      update: { valor: cifra.valor, orden: index },
      create: { etiqueta: cifra.etiqueta, valor: cifra.valor, orden: index },
    });
  }

  // Testimonios (Fase 9): mismo criterio que documentos legales y cifras —
  // `upsert` por `cita` para no pisar ediciones del admin.
  console.log("Sembrando testimonios...");
  for (const [index, testimonio] of testimonios.entries()) {
    await prisma.testimonio.upsert({
      where: { cita: testimonio.cita },
      update: {
        rol: testimonio.rol,
        fotoUrl: testimonio.fotoUrl,
        orden: index,
      },
      create: { ...testimonio, orden: index },
    });
  }

  // Socios (Fase 9): mismo criterio que documentos legales/cifras/
  // testimonios — `upsert` por `logoUrl` para no pisar ediciones del admin.
  console.log("Sembrando socios...");
  for (const [index, socio] of socios.entries()) {
    await prisma.socio.upsert({
      where: { logoUrl: socio.logoUrl },
      update: { nombre: socio.nombre, orden: index },
      create: { nombre: socio.nombre, logoUrl: socio.logoUrl, orden: index },
    });
  }

  console.log("Seed completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
