# Plan de desarrollo — Nueva plataforma web Club Atlético Los Chasquis

## Contexto

Club Deportivo Atlético Los Chasquis (Tunja, Boyacá) organiza
**Eventos Atléticos**: carreras de calle y eventos de pista y campo en
la región. Actualmente el sitio corre en WordPress (`clubloschasquis.com`),
lento y limitado. Este proyecto lo reemplaza por una aplicación propia.

Sitio actual de referencia (solo para inspiración visual/UX, no para copiar
código): https://www.clubloschasquis.com/

## Objetivo

Una aplicación web que permita:
1. A los atletas: ver el calendario de eventos, consultar toda la
   información de cada evento y registrarse pagando en línea.
2. Al administrador del club: crear/editar eventos y gestionar las
   inscripciones recibidas, sin tocar código.

## Estado actual (ya hecho, no repetir)

- Proyecto Next.js creado (`create-next-app`, TypeScript, App Router,
  Tailwind CSS, `src/` directory, ESLint).
- Prisma instalado y configurado para Prisma 7 (`prisma.config.ts` +
  `prisma/schema.prisma`, sin `url` en el datasource).
- Base de datos PostgreSQL en Neon, conectada y migrada (`npx prisma
  migrate dev`) — el esquema ya está aplicado.
- El esquema completo está en `prisma/schema.prisma` (adjunto en este
  mismo proyecto). No modificar el modelo de datos salvo que se indique
  explícitamente aquí.

## Stack técnico (definido, no cambiar sin consultar)

- **Frontend + backend**: Next.js (App Router, TypeScript)
- **Estilos**: Tailwind CSS + CSS propio donde se necesite control fino
- **ORM / DB**: Prisma + PostgreSQL (Neon)
- **Pagos**: Wompi (tarjeta, PSE, Nequi) — checkout, no WooCommerce
- **Despliegue**: Vercel
- **Fuentes**: Google Fonts vía `next/font` — Big Shoulders Display y
  Barlow Condensed como tipografías principales (estilo brutalista),
  Space Mono para detalles/monoespaciado
- **Colores de marca**:
  - `#F15808` naranja (color primario/acento)
  - `#353535` gris oscuro
  - `#1C0D0A` casi negro
  - `#F7F4EF` crema cálido (fondo claro)
- **Estilo visual**: brutalista — bordes marcados, tipografía grande y
  contundente, poco decorado. No usar gradientes suaves ni sombras muy
  difuminadas tipo "SaaS genérico".

## Datos existentes a migrar

Hay eventos ya cargados en formato JS plano (objeto `Festivales`, ver
archivo adjunto) con la estructura: categorías, pruebas por categoría,
recorridos, premios, reglamento, logística, noticias. Hay que escribir un
**script de seed** (`prisma/seed.ts`) que tome esos objetos y los inserte
en la base de datos usando el modelo de Prisma. Los eventos existentes son:

- IV Festival Atlético Nuevas Figuras (14 marzo 2026, cerrado)
- XXXIX Festival Atlético Departamental (25 abril 2026)
- III Cronoescalada Atlética Siral–Cruz Blanca–Tres Cruces (18 julio 2026)
- 6K Running de Fuego (5 julio 2026)

También hay un archivo de referencia `CalendarEvents.html/js` con la
versión actual embebida en WordPress: úsalo como referencia de qué
información y flujo debe existir (calendario, tarjeta de evento, tabs de
detalle: información, recorridos, premios, reglamento, logística, galería,
noticias, contacto; formulario de inscripción), pero constrúyelo de nuevo
como componentes de Next.js — no reutilizar el JS de WordPress tal cual.

## Fases de desarrollo

### Fase 1 — Capa de datos
- [ ] Cliente Prisma singleton (`src/lib/prisma.ts`)
- [ ] Script `prisma/seed.ts` que carga los eventos existentes
- [ ] Comando `npm run seed` funcionando

### Fase 2 — Sitio público: listado de eventos y vista de detalle
- [ ] Página `/eventos` con un **listado tipo carrusel horizontal** de
      tarjetas de evento (flechas `<` `>` para navegar), leído desde la DB.
      Cada tarjeta muestra: imagen, fecha (badge naranja), título,
      ubicación, precio, categoría/badge destacado, lema en cursiva y
      botón **"Inscríbete aquí"**. (Ver referencia visual: imagen 1)
- [ ] Al hacer clic en "Inscríbete aquí" de una tarjeta:
      - Ocultar las demás tarjetas del carrusel.
      - Pasar a un layout de dos columnas (Ver referencia visual: imagen 2):
        - **Columna izquierda**: tarjeta resumida del evento elegido
          (imagen, fecha, título, ubicación, precio/categoría), botón
          "Inscríbete" (abre el formulario de inscripción de la Fase 4),
          y debajo un **mini calendario NO interactivo** que solo resalta
          el día del evento y muestra fecha/hora en grande, con un botón
          verde **"Agendar"** que genera un enlace a Google Calendar
          (`https://calendar.google.com/calendar/render?action=TEMPLATE...`
          con título, fecha/hora, ubicación y descripción del evento
          precargados) — no requiere login ni API de Google, es solo un
          link.
        - **Columna derecha**: panel con tabs (ver Fase 3).
      - Debe existir una forma de volver al listado completo (ej. botón
        "Volver" o cerrar el panel de detalle).
- [ ] Ya NO se construye un calendario mensual interactivo tipo
      `CalendarEvents.js` actual (sin selección de día por mes, sin
      indicadores de mes) — esa lógica queda descartada para esta fase.

### Fase 3 — Panel de detalle del evento
- [ ] Panel con tabs: Información, Recorridos, Premios, Reglamento,
      Logística, Noticias, Contacto — se muestra en la columna derecha
      descrita en la Fase 2, no como página aparte.
- [ ] Todo el contenido viene de la base de datos (categorías, pruebas,
      reglas, servicios, noticias), nada hardcodeado

### Fase 4 — Formulario de inscripción
- [ ] Formulario con los mismos campos del actual (datos del atleta,
      contacto, sección de acudiente si es menor de edad, selección de
      hasta 2 pruebas según categoría/género elegidos)
- [ ] Validaciones en servidor (no solo en cliente)
- [ ] Al enviar, crear registro `Inscripcion` en estado `PENDIENTE`

### Fase 5 — Pagos con Wompi
- [ ] Integrar Widget/Checkout de Wompi con el monto calculado
      (precio − descuento si aplica según fecha límite)
- [ ] Webhook de confirmación de Wompi que actualiza `estadoPago` a
      `APROBADO`/`RECHAZADO` y guarda `wompiTransactionId`
- [ ] Página de confirmación para el atleta

### Fase 6 — Panel de administrador
- [ ] Login simple (NextAuth o similar) protegiendo `/admin`
- [ ] CRUD de eventos: crear, editar, cambiar estado (abierto/cerrado)
- [ ] Gestión de categorías y pruebas por categoría desde formularios
- [ ] Listado de inscripciones por evento, con filtro y exportar a CSV
- [ ] Editor de noticias por evento

### Fase 7 — Despliegue y QA
- [ ] Variables de entorno en Vercel (`DATABASE_URL`, credenciales Wompi)
- [ ] Prueba de flujo completo: ver evento → inscribirse → pagar → admin
      ve la inscripción
- [ ] Revisión responsive (móvil) — el sitio actual tiene mucho tráfico
      desde celular

## Fuera de alcance por ahora

- No migrar contenido histórico de WordPress (noticias viejas, galerías
  antiguas) — solo los eventos activos/futuros
- No construir app móvil nativa
- No tocar el WordPress actual hasta que la nueva plataforma esté probada

## Convenciones de trabajo

- Todo el código y comentarios en español, consistente con el resto del
  proyecto del club.
- Commits pequeños y descriptivos, uno por tarea del checklist de arriba.
- No inventar campos ni contenido que no esté en los datos entregados —
  si falta un dato para un evento, dejarlo vacío o marcado como
  `TODO`, nunca inventarlo.
