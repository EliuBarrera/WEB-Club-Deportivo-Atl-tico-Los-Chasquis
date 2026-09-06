# Plan de desarrollo — Nueva plataforma web Club Atlético Los Chasquis

## Contexto

Club Deportivo Atlético Los Chasquis (Tunja, Boyacá) organiza el circuito
**Pasaporte Runner Boyacá**: carreras de calle y eventos de pista y campo en
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
- [x] Cliente Prisma singleton (`lib/prisma.ts` — no `src/lib/`, ya que
      `app/` vive en la raíz del repo, no en `src/app/`)
- [x] Script `prisma/seed.ts` que carga los eventos existentes. La
      fuente real (`CalendarEvents.js`) tenía 6 eventos, no 4 como
      decía este documento — se migraron los 6.
- [x] Comando `npm run seed` funcionando (`prisma db seed`, idempotente)

**Implementado:** cliente Prisma singleton en `lib/prisma.ts` (adapter
`@prisma/adapter-pg`, fuerza IPv4 para evitar timeouts de conexión).
`prisma/seed.ts` carga los 6 eventos reales tomados de `CalendarEvents.js`
y se ejecuta con `npm run seed`.

### Fase 2 — Sitio público: listado de eventos y vista de detalle
- [x] Página `/eventos` con un **listado tipo carrusel horizontal** de
      tarjetas de evento (flechas `<` `>` para navegar), leído desde la DB.
      Cada tarjeta muestra: imagen, fecha (badge naranja), título,
      ubicación, precio, categoría/badge destacado, lema en cursiva y
      botón **"Inscríbete aquí"**. (Ver referencia visual: imagen 1)
- [x] Al hacer clic en "Inscríbete aquí" de una tarjeta:
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
        - **Columna derecha**: panel con tabs (ver Fase 3). Por ahora es
          un placeholder: los tabs existen y cambian, pero solo
          "Información" muestra datos reales de la DB.
      - Debe existir una forma de volver al listado completo (ej. botón
        "Volver" o cerrar el panel de detalle).
- [x] Ya NO se construye un calendario mensual interactivo tipo
      `CalendarEvents.js` actual (sin selección de día por mes, sin
      indicadores de mes) — esa lógica queda descartada para esta fase.

**Implementado:** `lib/eventos.ts` (`getEventosPublicados`) trae de la DB
los eventos en estado ABIERTO/CERRADO; `app/eventos/page.tsx` los pasa a
`components/eventos/EventosExplorer.tsx`, que alterna entre
`CarruselEventos.tsx` (listado con flechas) y `VistaInscripcion.tsx`
(tarjeta resumida + `MiniCalendario.tsx` + `PanelDetalleTabs.tsx` como
placeholder de tabs). `TarjetaEvento.tsx` es la tarjeta compartida por
ambas vistas.

### Fase 3 — Panel de detalle del evento
- [x] Panel con tabs: Información, Recorridos, Premios, Reglamento,
      Logística, Noticias, Contacto — se muestra en la columna derecha
      descrita en la Fase 2, no como página aparte.
- [x] Todo el contenido viene de la base de datos (categorías, pruebas,
      reglas, servicios, noticias), nada hardcodeado

**Implementado:** `lib/eventos.ts` (`getEventosPublicados`) amplía el
`select` para traer, además de lo de la Fase 2, `categorias` (con
`pruebas`→`PruebaCatalogo`), `costos`, `recorrido` (+`programacion`),
`premios` (+`condiciones`), `reglamento` (+`competencia`, `seguridad`,
`controles`), `logistica` (+`servicios`, `recomendaciones`, `kit`),
`noticias`, y los campos `mapUrl`/`organizador`/`terminosUrl` del
evento — todo en la misma consulta, porque la vista de inscripción
alterna de evento del lado del cliente sin ruta propia por evento.
`components/eventos/PanelDetalleTabs.tsx` reemplaza el placeholder de
la Fase 2: cada tab (`TabInformacion`, `TabRecorridos`, `TabPremios`,
`TabReglamento`, `TabLogistica`, `TabNoticias`, `TabContacto`) renderiza
esos datos reales, con un mensaje "sin datos" cuando una sección viene
vacía para un evento en particular. Verificado con `npx tsc --noEmit`,
`npm run build`, `npm run lint` (los tres sin errores) y un script
puntual que llamó a `getEventosPublicados()` contra la base real,
confirmando categorías/pruebas/recorridos/premios/reglamento/logística/
noticias no vacíos para los eventos migrados en la Fase 1.

### Fase 4 — Formulario de inscripción
- [ ] Formulario con los mismos campos del actual (datos del atleta,
      contacto, sección de acudiente si es menor de edad, selección de
      hasta 2 pruebas según categoría/género elegidos)
- [ ] Validaciones en servidor con Zod (no confiar solo en las
      validaciones del navegador) — nunca aceptar el precio/total desde
      el cliente, se recalcula siempre en servidor a partir del evento
- [ ] CAPTCHA (ej. Cloudflare Turnstile) antes de enviar el formulario,
      para evitar inscripciones automatizadas/spam
- [ ] Rate limiting por IP en el endpoint de inscripción
- [ ] Al enviar, crear registro `Inscripcion` en estado `PENDIENTE`

### Fase 5 — Pagos con Wompi
- [ ] Integrar Widget/Checkout de Wompi con el monto calculado en
      **servidor** (precio − descuento si aplica según fecha límite) —
      nunca confiar en un monto enviado desde el navegador
- [ ] Webhook de confirmación de Wompi: **verificar la firma/checksum del
      evento** con el secreto de eventos de Wompi antes de procesar
      cualquier cambio de estado (evita que alguien falsifique un pago
      aprobado llamando directamente al endpoint)
- [ ] El webhook actualiza `estadoPago` a `APROBADO`/`RECHAZADO` y guarda
      `wompiTransactionId`; el endpoint debe ser idempotente (si Wompi
      reenvía el mismo evento, no debe duplicar ni romper nada)
- [ ] Página de confirmación para el atleta

### Fase 6 — Panel de administrador
- [ ] Login con NextAuth (o similar), contraseñas con hash `bcrypt`,
      nunca almacenar contraseñas en texto plano
- [ ] Middleware que protege **todas** las rutas `/admin/*` y sus
      Server Actions/API routes — la protección no puede depender solo
      de ocultar el link en el menú
- [ ] Verificar el rol (`ADMIN`/`EDITOR`) en cada acción sensible, no
      solo al hacer login
- [ ] CRUD de eventos: crear, editar, cambiar estado (abierto/cerrado)
- [ ] Gestión de categorías y pruebas por categoría desde formularios
- [ ] Listado de inscripciones por evento, con filtro y exportar a CSV
      (el CSV incluye datos personales de menores — restringir su
      descarga solo a usuarios autenticados con rol `ADMIN`)
- [ ] **Carga de imágenes**: usar **Cloudinary** para que el admin suba
      imágenes desde el formulario (portada del evento, imágenes de
      programación/recorrido, tabla de premios en efectivo) en vez de
      pegar links de ibb.co a mano. El upload se hace desde una Server
      Action que llama a `cloudinary.uploader.upload(...)` importando el
      cliente ya configurado en `lib/cloudinary.ts` (no `src/lib/`, mismo
      criterio que `lib/prisma.ts` de la Fase 1), y guarda la URL que
      devuelve tal cual en los campos que ya existen (`imagenUrl`,
      `ImagenProgramacion.url`, `Premios.efectivoUrl`) — no requiere
      cambiar el modelo de datos.
  - [x] `lib/cloudinary.ts` creado: configura el SDK (`cloudinary.v2`)
        con `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
        `CLOUDINARY_API_SECRET` leídas de variables de entorno
        (locales y pendientes de agregar en Vercel al desplegar). Solo
        se importa desde código de servidor, nunca desde un componente
        `"use client"`, para no exponer el `api_secret` al navegador.
  - [ ] Validar en servidor el tipo de archivo (solo `image/jpeg`,
        `image/png`, `image/webp`) y un tamaño máximo (ej. 5 MB) antes
        de subir, para no permitir subir cualquier archivo
  - [ ] Usar transformaciones de Cloudinary vía parámetros de URL (ej.
        `c_fill,w_400,h_300` para tarjetas, `c_fill,w_1200,h_400` para
        banners) en vez de guardar varias copias de la misma imagen
  - [ ] **Migrar las imágenes ya sembradas en Fase 1** (URLs de
        `ibb.co`/`unsplash` que vienen del `Festivales` original) a
        Cloudinary, para no seguir dependiendo de `ibb.co` como
        almacenamiento — puede ser un script puntual que recorra los
        eventos, suba cada imagen a Cloudinary con
        `cloudinary.uploader.upload(url_externa)` y actualice el campo
        con la nueva URL

**Nota (detectado en Fase 3):** el componente `<Image>` de Next.js
intenta optimizar toda imagen externa pasando por `/_next/image`, y
`ibb.co` responde demasiado lento para eso — resultado: error `500`
después de ~8 segundos. Arreglo inmediato mientras se completa la
migración a Cloudinary: agregar `unoptimized` a los `<Image>` que
muestran URLs externas, para que carguen directo sin pasar por el
optimizador de Next.js.
- [ ] Editor de noticias por evento — si se permite pegar HTML/rich
      text, sanitizarlo (ej. con `DOMPurify`) antes de guardarlo o
      mostrarlo, para evitar XSS

### Fase 7 — Seguridad (transversal, revisar antes de producción)

- [ ] **Secretos y variables de entorno**: `DATABASE_URL`, credenciales
      de Wompi, secreto de NextAuth, etc. solo en variables de entorno
      de Vercel — nunca en el código ni commiteados en `.env` al repo
      (agregar `.env` a `.gitignore` desde el inicio)
- [ ] **Prisma solo en servidor**: el cliente de Prisma nunca se importa
      en componentes cliente (`"use client"`); todo acceso a datos pasa
      por Server Components, Server Actions o API routes
- [ ] **Validación de entradas**: todo dato que llega del usuario
      (formulario de inscripción, login admin, creación de eventos) se
      valida con Zod en el servidor antes de tocar la base de datos
- [ ] **Cabeceras de seguridad HTTP** en `next.config.ts` o middleware:
      `Content-Security-Policy`, `X-Frame-Options: DENY`,
      `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`
- [ ] **HTTPS**: Vercel lo da automático; si se usa dominio propio
      (`clubloschasquis.com`), confirmar el certificado SSL activo antes
      de apagar WordPress
- [ ] **Protección de datos personales (Ley 1581 de 2012 – Colombia)**:
      el formulario ya tiene checkbox de autorización de datos e
      imágenes; agregar una página de "Política de tratamiento de
      datos personales" enlazada desde ahí, y un correo/proceso para que
      alguien pueda pedir que se eliminen sus datos
- [ ] **No exponer errores internos**: las páginas de error no deben
      mostrar stacks de Prisma ni mensajes técnicos al usuario final;
      loguear el detalle solo del lado del servidor (sin datos sensibles
      como número de documento en logs de producción)
- [ ] **Dependencias**: correr `npm audit` antes del primer despliegue y
      periódicamente después; mantener Next.js y Prisma actualizados
- [ ] **Backups**: confirmar que el plan de Neon usado tenga backups /
      point-in-time recovery activo para la base de datos de producción

### Fase 8 — Despliegue y QA
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

## Cómo verificar que cada tarea quedó realmente hecha

No basta con que Claude Code diga "listo, ya quedó implementado" —
pídele siempre evidencia concreta: el comando que corrió y su salida
real, o que abra el archivo modificado y muestre el fragmento. Reglas
generales para trabajar con Claude Code en este proyecto:

- Después de cada tarea del checklist, pídele que corra `npm run build`
  y pegue la salida completa — si hay un error, no está terminada.
- Pídele `git diff` o `git status` antes de dar por buena una tarea, para
  ver exactamente qué archivos tocó (a veces "arregla" algo sin cambiar
  nada, o cambia más de lo pedido).
- Un commit por tarea del checklist (no un solo commit gigante al final)
  — así puedes revisar el historial y revertir algo puntual si falla.
- Para lo de seguridad en particular, esto NO se verifica leyendo el
  código, se verifica probándolo. Pídele a Claude Code que ejecute estas
  pruebas y te muestre el resultado real:

| Qué se agregó | Cómo comprobar que sí funciona |
|---|---|
| `.env` no se sube al repo | `git ls-files \| grep .env` → no debe aparecer nada |
| Cabeceras de seguridad HTTP | `curl -I http://localhost:3000` (o la URL de producción) → deben verse `X-Frame-Options`, `Strict-Transport-Security`, etc. |
| `/admin` protegido | `curl -I http://localhost:3000/admin` sin sesión iniciada → debe responder `302` (redirección a login), no `200` |
| Contraseñas con hash | Abrir `npx prisma studio`, tabla `Usuario`, columna `passwordHash` → debe verse un hash largo tipo `$2b$...`, nunca la contraseña en texto plano |
| Webhook de Wompi valida firma | Simular una petición POST al endpoint del webhook con una firma inventada → debe responder `401`/`403`, no procesar el pago |
| Monto no viene del cliente | Revisar el código del endpoint de inscripción/pago: el precio debe calcularse consultando el evento en la base de datos, no leerse del `body` de la petición |
| Validación con Zod en servidor | Probar enviar el formulario de inscripción con un campo inválido usando `curl` o Postman directo al endpoint (sin pasar por el formulario) → debe rechazarlo igual |
| `npm audit` sin vulnerabilidades altas/críticas | `npm audit` → pegar la salida completa |

- Para las partes más críticas (login admin, webhook de pagos, cálculo
  de montos), vale la pena pedirle a Claude Code que escriba **pruebas
  automatizadas** (Vitest para lógica de validación/cálculo, Playwright
  para el flujo de inscripción de punta a punta) que corran con
  `npm test` — así cada cambio futuro se revalida solo, no depende de
  que alguien se acuerde de probar a mano.

## Convenciones de trabajo

- Todo el código y comentarios en español, consistente con el resto del
  proyecto del club.
- Commits pequeños y descriptivos, uno por tarea del checklist de arriba.
- No inventar campos ni contenido que no esté en los datos entregados —
  si falta un dato para un evento, dejarlo vacío o marcado como
  `TODO`, nunca inventarlo.
