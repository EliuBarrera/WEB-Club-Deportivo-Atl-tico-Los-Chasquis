# Plan de desarrollo — Nueva plataforma web Club Atlético Los Chasquis

## Contexto

Club Deportivo Atlético Los Chasquis (Tunja, Boyacá) organiza carreras de
calle y eventos de pista y campo en la región. Actualmente el sitio corre
en WordPress (`clubloschasquis.com`), lento y limitado. Este proyecto lo
reemplaza por una aplicación propia.

*(Nota: versiones anteriores de este documento mencionaban un "Circuito
Pasaporte Runner Boyacá" — era información generada que no corresponde a
nada real del club; se retiró de todo el documento.)*

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
  - `#D1273B` rojo, `#1F9254` verde, `#D1A512` amarillo — estados
    (pendiente/aprobado/rechazado) en el panel admin
- **Estilo visual**: tipografía grande y contundente, poco decorado
  (base brutalista). **Actualizado en Fase 6**: las tarjetas, botones y
  paneles pasaron de bordes gruesos (`border-2`/`border-[3px]
  border-casi-negro`) a sombras suaves difuminadas
  (`shadow-[0_10px_30px_rgba(28,13,10,0.10)]` y variantes) — dirección
  de diseño confirmada con el club, reemplaza la regla anterior de "no
  sombras difuminadas tipo SaaS genérico".

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
- [x] Formulario con los mismos campos del actual (datos del atleta,
      contacto, sección de acudiente si es menor de edad, selección de
      hasta 2 pruebas según categoría/género elegidos)
- [x] Validaciones en servidor con Zod (no confiar solo en las
      validaciones del navegador) — nunca aceptar el precio/total desde
      el cliente, se recalcula siempre en servidor a partir del evento
- [x] CAPTCHA (ej. Cloudflare Turnstile) antes de enviar el formulario,
      para evitar inscripciones automatizadas/spam
- [x] Rate limiting por IP en el endpoint de inscripción
- [x] Al enviar, crear registro `Inscripcion` en estado `PENDIENTE`

**Implementado:** `POST /api/inscripciones` orquesta, en orden: rate
limiting por IP contra la nueva tabla `IntentoInscripcion`
(`lib/rate-limit.ts`, basado en base de datos y no en memoria, porque el
endpoint corre en funciones serverless de Vercel), verificación
server-side de Cloudflare Turnstile (`lib/turnstile.ts`), validación de
forma con Zod (`lib/validation/inscripcion.ts`) y la creación del
registro `Inscripcion` en estado `PENDIENTE`. El evento se recarga fresco
desde la base de datos para recalcular `totalPago` y validar que la
categoría/pruebas/costo enviados pertenecen a ese evento — nunca se
confía en el cliente para precio ni elegibilidad — y la edad se calcula
en servidor (`fechaNacimiento` contra la fecha del evento) para exigir
los datos de acudiente cuando el atleta es menor de edad.

`Inscripcion.categoriaId` pasó a opcional y se agregó `costoId`
(relación a `Costo`) porque algunos eventos ya `ABIERTO` (ej. "6K Running
de Fuego") no tienen ninguna `Categoria` en la base, solo una lista de
`Costo` por tipo ("adultos"/"ninos") — con el esquema anterior nadie
podría inscribirse a esos eventos reales. `FormularioInscripcion.tsx`
(en `VistaInscripcion.tsx`, reemplazando el panel de tabs al hacer clic
en "Inscríbete") soporta ambos flujos: categoría + pruebas cuando el
evento tiene categorías, o un selector de tipo de costo cuando no las
tiene, incluyendo el widget de Turnstile.

Probado end-to-end con `curl` directo al endpoint (sin pasar por el
formulario): body inválido (`400`), CAPTCHA inválido con el secret real
de Turnstile (`403`), rate limit tras 5 intentos desde la misma IP
(`429`), evento `CERRADO` (`400`, usando el secret de pruebas de
Cloudflare para superar el CAPTCHA), menor de edad sin datos de
acudiente (`400`), y el flujo completo tanto de categoría como de costo
(`201`), verificando en la base de datos que `edad` y `totalPago`
quedaron recalculados en servidor y no con lo que hubiera enviado el
cliente.

- [x] **Modal reutilizable de Términos y Condiciones** (agregado después
      de ver el archivo de referencia
      `Politicas-Obligatorias-Participacion-2026.html`, de un evento real
      del club — generalizado para que sirva para todos los eventos, sin
      la información específica de esa carrera en particular: precios,
      fechas y el "Circuito Pasaporte Runner Boyacá" que mencionaba, que
      ya no existe)
  - [x] El texto "términos y condiciones" del checkbox de aceptación deja
        de ser un link `href="#"` y pasa a abrir un **modal** (no navega
        a otra página), reutilizable para cualquier evento — no crear un
        modal distinto por evento
  - [x] El modal se compone de dos tipos de contenido:
    - **Bloque genérico institucional** (igual para todos los eventos):
      reglamento general, normas de seguridad, tratamiento de datos /
      habeas data, exoneración de responsabilidad, declaración de
      aceptación. Guardarlo en un modelo nuevo y simple, ej.
      `TerminosBase { id, contenido, version, vigenteDesde }`, editable
      desde el admin — así el club lo puede actualizar sin tocar código
    - **Bloques condicionales**, derivados de datos que **ya existen**
      en el evento — no duplicar información, solo mostrar/ocultar
      secciones según lo que ese evento tenga:
      - Sección "Entrega de Kits" → solo si `logistica.kit` tiene
        elementos (ej. 6K Running de Fuego sí, otros eventos no)
      - Sección "Premiación en efectivo" → solo si `premios.efectivo`
        tiene valor
  - [x] **Trazabilidad legal:** al aceptar y enviar el formulario, guardar
        en `Inscripcion` qué versión del `TerminosBase` aceptó el atleta
        y en qué momento (ej. `terminosVersion`, `terminosAceptadosEn`).
        Es relevante porque se recolectan datos de menores y se acepta
        una exoneración de responsabilidad — si el texto cambia después,
        debe quedar registro de cuál versión aceptó cada quién
  - [x] Enlace del mismo modal también accesible desde el footer del
        sitio ("Ver términos y condiciones generales"), no solo desde el
        formulario

**Implementado:** modelo `TerminosBase { id, version, contenido,
vigenteDesde }` (migración `20260908044725_fase4_terminos_base`) — nunca
se edita una fila existente, cada cambio desde el admin
(`app/admin/(panel)/terminos/`) crea una versión nueva, así
`Inscripcion.terminosVersion` sigue apuntando a un texto inmutable aunque
el club actualice el contenido después. La versión 1 se sembró
generalizando el bloque institucional (reglamento general, normas de
seguridad, reglas de premiación, exoneración de responsabilidad,
declaración de aceptación) del documento de referencia de un evento real
(`Documentation/Politicas-Obligatorias-Participacion-2026.html`), quitando
lo específico de esa carrera. La sección de **tratamiento de datos
personales queda como `[TODO]`** dentro del contenido: ese documento no
traía ese texto y el proyecto no inventa contenido legal — el club debe
redactarlo y actualizarlo desde `/admin/terminos`.

`components/eventos/ModalTerminos.tsx` es el único componente de modal,
usado tanto desde el checkbox de `FormularioInscripcion.tsx` (con las
secciones condicionales de kit/premiación del evento en curso) como desde
`components/Footer.tsx` (sin secciones condicionales, ya que no hay un
evento específico). En `POST /api/inscripciones` el servidor —nunca el
cliente— resuelve cuál era la versión vigente de `TerminosBase` en el
momento de crear la inscripción y la guarda junto con la marca de tiempo.

`components/Footer.tsx` es un footer mínimo, solo con este enlace: el
footer completo (contacto, redes, ubicación, demás políticas) es alcance
de la Fase 9.

### Fase 5 — Pagos con Wompi
- [x] Integrar Widget/Checkout de Wompi con el monto calculado en
      **servidor** (precio − descuento si aplica según fecha límite) —
      nunca confiar en un monto enviado desde el navegador
- [x] Webhook de confirmación de Wompi: **verificar la firma/checksum del
      evento** con el secreto de eventos de Wompi antes de procesar
      cualquier cambio de estado (evita que alguien falsifique un pago
      aprobado llamando directamente al endpoint)
- [x] El webhook actualiza `estadoPago` a `APROBADO`/`RECHAZADO` y guarda
      `wompiTransactionId`; el endpoint debe ser idempotente (si Wompi
      reenvía el mismo evento, no debe duplicar ni romper nada)
- [x] Página de confirmación para el atleta

**Implementado:** `lib/wompi.ts` calcula la firma de integridad del
widget y expone `verificarFirmaEvento`/`mapEstadoPago` para el webhook;
`FormularioInscripcion.tsx` abre el widget de Wompi con el monto
recalculado en servidor y muestra en la misma tarjeta los estados
pendiente/aprobado/rechazado (con botón "Reintentar pago"), sin
necesidad de una ruta aparte. `app/api/webhooks/wompi/route.ts`
rechaza cualquier evento con firma inválida antes de tocar la base de
datos, y el `update` de `Inscripcion` es idempotente por construcción
(reenviar el mismo evento dos veces no duplica ni rompe nada).

### Fase 6 — Panel de administrador
- [x] Login con NextAuth (o similar), contraseñas con hash `bcrypt`,
      nunca almacenar contraseñas en texto plano
- [x] Middleware que protege **todas** las rutas `/admin/*` y sus
      Server Actions/API routes — la protección no puede depender solo
      de ocultar el link en el menú
- [x] Verificar el rol (`ADMIN`/`EDITOR`) en cada acción sensible, no
      solo al hacer login
- [x] Mitigar "user enumeration" por tiempo de respuesta en el login: si
      el email no existe, hoy se responde antes (nunca se llega a
      `bcrypt.compare`) que si existe pero la contraseña es incorrecta —
      comparar siempre contra un hash dummy cuando el usuario no existe,
      para que el tiempo de respuesta no delate si un email está
      registrado
- [x] Confirmar `AUTH_TRUST_HOST` (o el equivalente que use la versión
      de Auth.js instalada) al desplegar en Vercel, para que los
      redirects de login funcionen detrás del proxy de producción
- [x] CRUD de eventos: crear, editar, cambiar estado (abierto/cerrado)
- [x] Gestión de categorías y pruebas por categoría desde formularios
- [x] Listado de inscripciones por evento, con filtro y exportar a CSV
      (el CSV incluye datos personales de menores — restringir su
      descarga solo a usuarios autenticados con rol `ADMIN`)

**Implementado (autenticación y CRUD):** `auth.ts` (NextAuth v5,
Credentials + bcrypt, hash señuelo contra "user enumeration",
`trustHost: true`) y `proxy.ts` (reemplazo de `middleware.ts` en
Next.js 16) como primera capa sobre `/admin/*` y `/api/admin/*`;
`lib/admin/dal.ts` repite la verificación de sesión/rol en cada
función como segunda capa, porque las Server Actions viajan como POST
a la misma ruta que las invoca y un matcher de proxy que excluya una
ruta las deja sin protección. `app/admin/(panel)/eventos/` (editor por
pestañas en `EventoEditor.tsx`, con `CategoriaModal.tsx` y
`NoticiaModal.tsx`) cubre crear/editar evento, cambiar estado,
categorías + pruebas por categoría, y noticias — todo validado con Zod
en servidor (`lib/validation/{evento,categoria,listaTexto,noticia}.ts`).
`app/admin/(panel)/inscripciones/page.tsx` trae el listado con filtro
por evento/estado de pago, y `app/api/admin/inscripciones/export/route.ts`
genera el CSV protegido con `requireAdmin()` (401/403 explícito en vez
de redirigir, ya que es un Route Handler de descarga).
- [x] **Carga de imágenes**: usar **Cloudinary** para que el admin suba
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
  - [x] Validar en servidor el tipo de archivo (solo `image/jpeg`,
        `image/png`, `image/webp`) y un tamaño máximo (ej. 5 MB) antes
        de subir, para no permitir subir cualquier archivo
  - [x] Usar transformaciones de Cloudinary vía parámetros de URL (ej.
        `c_fill,w_400,h_300` para tarjetas, `c_fill,w_1200,h_400` para
        banners) en vez de guardar varias copias de la misma imagen
  - [ ] **Migrar las imágenes ya sembradas en Fase 1** (URLs de
        `ibb.co`/`unsplash` que vienen del `Festivales` original) a
        Cloudinary, para no seguir dependiendo de `ibb.co` como
        almacenamiento — puede ser un script puntual que recorra los
        eventos, suba cada imagen a Cloudinary con
        `cloudinary.uploader.upload(url_externa)` y actualice el campo
        con la nueva URL

**Implementado (Cloudinary):** `actualizarEvento` en
`app/admin/(panel)/eventos/actions.ts` valida `IMAGEN_TIPOS_PERMITIDOS`
y `IMAGEN_TAMANO_MAXIMO` (de `lib/validation/evento.ts`) en servidor
antes de subir. `cloudinaryThumb()` en `lib/cloudinary.ts` aplica
transformaciones por URL (usado, ej., para las miniaturas del listado
de eventos). **Pendiente de ejecutar** (no de escribir):
`prisma/migrar-imagenes-cloudinary.ts` ya existe y es idempotente,
pero correrlo contra la base de producción — y confirmar las
credenciales de Cloudinary en Vercel — se deja como paso explícito
antes de apagar la dependencia de `ibb.co`/`unsplash`.

**Nota (detectado en Fase 3):** el componente `<Image>` de Next.js
intenta optimizar toda imagen externa pasando por `/_next/image`, y
`ibb.co` responde demasiado lento para eso — resultado: error `500`
después de ~8 segundos. Arreglo inmediato mientras se completa la
migración a Cloudinary: agregar `unoptimized` a los `<Image>` que
muestran URLs externas, para que carguen directo sin pasar por el
optimizador de Next.js.
- [x] Editor de noticias por evento — si se permite pegar HTML/rich
      text, sanitizarlo (ej. con `DOMPurify`) antes de guardarlo o
      mostrarlo, para evitar XSS

**Implementado:** `NoticiaModal.tsx` + `noticiaSchema` (campo
`contenido` en texto plano, sin editor rich-text). Se renderiza como
`{noticia.contenido}` (`PanelDetalleTabs.tsx`), nunca con
`dangerouslySetInnerHTML` — no hay HTML/rich text involucrado en este
incremento, así que `DOMPurify` no aplica todavía. Si en el futuro se
agrega un editor rich-text, sanitizar en ese momento.

- [x] **Dashboard de ingresos**
  - [x] Vista general: ingresos totales acumulados de **todos** los
        eventos (suma de `totalPago` de las `Inscripcion` con
        `estadoPago = APROBADO`) — nunca sumar inscripciones pendientes
        o rechazadas
  - [x] Vista por evento: selector/filtro para ver el ingreso de un solo
        evento a la vez
  - [x] Tarjeta pequeña por evento (mismo formato/tamaño visual que el
        `MiniCalendario.tsx` de la Fase 2): muestra el monto recaudado de
        ese evento y, debajo, el número total de inscritos (conteo de
        `Inscripcion` con `estadoPago = APROBADO` para ese evento)
  - [x] Botón "Ver en Wompi" en cada tarjeta/vista que abra en una
        pestaña nueva el dashboard de comercios de Wompi
        (`https://comercios.wompi.co`), para que el admin pueda
        contrastar el número contra el estado real de la pasarela
  - [x] Estos números se calculan siempre desde la base de datos local
        (no se le pide nada a la API de Wompi en cada carga) — el
        webhook de la Fase 5 ya mantiene `estadoPago` sincronizado, así
        que el dashboard solo lee lo que ya está guardado

**Implementado:** `getDashboardIngresos()` en `lib/admin/dal.ts`
(`aggregate` + `groupBy` sobre `Inscripcion` filtrado a
`estadoPago: "APROBADO"`) y la sección "Dashboard de ingresos" al
inicio de `app/admin/(panel)/inscripciones/page.tsx`: tarjeta de total
general + una tarjeta por evento con recaudado/inscritos y enlace
"Ver en Wompi" a `comercios.wompi.co`. No vive en una vista separada
por selector — comparte página con el listado/filtro de inscripciones,
que ya tiene su propio filtro por evento.

### Fase 7 — Seguridad (transversal, revisar antes de producción)

- [x] **Secretos y variables de entorno**: `DATABASE_URL`, credenciales
      de Wompi, secreto de NextAuth, etc. solo en variables de entorno
      de Vercel — nunca en el código ni commiteados en `.env` al repo
      (agregar `.env` a `.gitignore` desde el inicio)
- [x] **Prisma solo en servidor**: el cliente de Prisma nunca se importa
      en componentes cliente (`"use client"`); todo acceso a datos pasa
      por Server Components, Server Actions o API routes
- [x] **Validación de entradas**: todo dato que llega del usuario
      (formulario de inscripción, login admin, creación de eventos) se
      valida con Zod en el servidor antes de tocar la base de datos
- [x] **Cabeceras de seguridad HTTP** en `next.config.ts` o middleware:
      `Content-Security-Policy`, `X-Frame-Options: DENY`,
      `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`
- [ ] **HTTPS**: Vercel lo da automático; si se usa dominio propio
      (`clubloschasquis.com`), confirmar el certificado SSL activo antes
      de apagar WordPress
- [x] **Protección de datos personales (Ley 1581 de 2012 – Colombia)**:
      el formulario ya tiene checkbox de autorización de datos e
      imágenes; agregar una página de "Política de tratamiento de
      datos personales" enlazada desde ahí, y un correo/proceso para que
      alguien pueda pedir que se eliminen sus datos
- [x] **No exponer errores internos**: las páginas de error no deben
      mostrar stacks de Prisma ni mensajes técnicos al usuario final;
      loguear el detalle solo del lado del servidor (sin datos sensibles
      como número de documento en logs de producción)
- [x] **Dependencias**: correr `npm audit` antes del primer despliegue y
      periódicamente después; mantener Next.js y Prisma actualizados
- [ ] **Backups**: confirmar que el plan de Neon usado tenga backups /
      point-in-time recovery activo para la base de datos de producción

**Implementado:**
- `.env*` ya estaba en `.gitignore` y nunca se commiteó (`git ls-files |
  grep .env` no devuelve nada).
- Ningún archivo `"use client"` importa `lib/prisma` ni `@prisma/client`
  (verificado con grep sobre todo `app/`, `components/`, `lib/`) — el
  acceso a datos siempre pasa por Server Components/Actions/Route
  Handlers, ya venía siendo así desde fases anteriores.
- Todas las mutaciones desde el cliente (inscripción, login, CRUD de
  eventos/categorías/noticias, edición de términos) ya pasaban por un
  schema de Zod en servidor antes de tocar la base — verificado, no
  hizo falta agregar nada nuevo.
- `next.config.ts` agrega `headers()` con `Content-Security-Policy`
  (sin nonces — la alternativa con nonces obliga a renderizar
  dinámicamente todo el sitio, incluida la portada estática — restringida
  a los orígenes que la app realmente usa: Cloudinary/ibb.co/Unsplash/
  Grupify para imágenes, Cloudflare Turnstile y el widget de Wompi para
  scripts/frames, Google Maps para el iframe de ubicación),
  `X-Frame-Options: DENY`, `Strict-Transport-Security`,
  `X-Content-Type-Options: nosniff` y `Referrer-Policy`. Verificado con
  `curl -I` en `/eventos`, `/admin/login` y `/api/inscripciones`.
- Nueva página pública `/politica-datos-personales` (responsable,
  derechos del titular, cómo ejercerlos) enlazada desde el checkbox de
  aceptación del formulario y desde el footer; el correo de contacto
  real del club (`chasquis1981@gmail.com`, ya usado en los datos
  migrados en Fase 1) sirve como canal para solicitudes de eliminación
  de datos. **Los compromisos específicos del club (qué se recolecta,
  para qué, por cuánto tiempo, con quién se comparte) quedan marcados
  como `[TODO]`** dentro de esa página — es contenido legal que el club
  debe redactar, el proyecto no lo inventa.
- Revisado: ningún endpoint devuelve `error.message`/stack al cliente,
  todos los `catch` responden con un mensaje genérico fijo y solo
  loguean el detalle con `console.error` del lado del servidor; no hay
  `numeroDocumento` ni otros datos sensibles en esos logs. Next.js ya
  oculta por defecto los stacks de errores no capturados en producción
  (Server Components/Actions/Route Handlers), tanto en páginas propias
  como en la de error por defecto (no se creó `error.tsx` custom porque
  el comportamiento por defecto ya cumple esto).
- `npm audit fix` corrigió `fast-uri` (alto, sin cambios de breaking).
  Quedan 4 vulnerabilidades altas (`deepmerge-ts`, `mysql2` vía
  `@prisma/config`/`prisma`) que solo se pueden resolver con
  `npm audit fix --force`, el cual **degradaría Prisma a 6.19.3** — no
  se aplicó porque el proyecto migró deliberadamente a Prisma 7. Además
  `mysql2` es una dependencia del CLI de Prisma para el *provider*
  MySQL, que este proyecto no usa (`datasource db { provider =
  "postgresql" }`), y ninguna de las dos rutas de esa cadena de
  dependencias se ejecuta en el runtime desplegado (`@prisma/client` +
  `@prisma/adapter-pg`, no el paquete `prisma` completo). Se deja para
  revisar cuando haya un release de `prisma`/`@prisma/config` sobre
  Prisma 7 que no dependa de esas versiones vulnerables.
  `@prisma/client`/`prisma` se actualizaron de 7.9.1 a 7.10.0 (dentro
  del rango ya declarado en `package.json`).

**Pendiente (requiere acceso a Vercel/Neon, no es código):** confirmar
el certificado SSL del dominio propio al desplegar, y confirmar que el
plan de Neon usado tenga backups/point-in-time recovery activo.

### Fase 8 — Despliegue y QA
- [ ] Variables de entorno en Vercel (`DATABASE_URL`, credenciales Wompi)
- [ ] Prueba de flujo completo: ver evento → inscribirse → pagar → admin
      ve la inscripción
- [ ] Revisión responsive (móvil) — el sitio actual tiene mucho tráfico
      desde celular

### Fase 9 — Página de Inicio (Landing)

**Objetivo:** es la primera impresión del club para un atleta que no lo
conoce todavía. Tiene que lograr dos cosas al mismo tiempo: transmitir
que Los Chasquis llevan más de 40 años organizando eventos serios (
confianza), y llevar al visitante a inscribirse en un evento activo
(conversión). No es un blog ni un archivo histórico completo — es una
puerta de entrada.

**Secciones sugeridas, en orden:**

1. **Hero** — imagen fuerte de carrera (real, no genérica de banco de
   imágenes si es posible), título de impacto en Big Shoulders Display,
   lema del club, y dos botones: uno primario ("Ver próximos eventos",
   naranja, lleva al listado de la Fase 2) y uno secundario ("Conoce
   nuestra historia", ancla a la sección 3).
2. **Barra de cifras de confianza** — franja angosta con 3-4 números
   grandes en Space Mono: años de trayectoria, eventos realizados,
   atletas que han participado en total, entidades que avalan al club.
   *(Ver nota de contenido pendiente abajo — estas cifras deben ser
   reales, no inventadas.)*
3. **Nuestra historia / línea de tiempo** — recorrido cronológico por
   las ediciones anteriores de los festivales y carreras ya realizados
   (foto + año + nombre del evento + un dato destacado, ej. "180
   atletas"). Es el corazón de "dar a conocer el recorrido" que pediste.
4. **Próximos eventos** — reutiliza tal cual el carrusel de eventos ya
   construido en la Fase 2, filtrado a `status: 'open'`. No duplicar
   componente.
5. **Aval institucional** — logos de la Liga de Atletismo de Boyacá,
   Federación Colombiana de Atletismo, alcaldías, etc. (ya existen como
   imágenes en el detalle de evento — reutilizar, no rehacer).
6. **Testimonios** — atletas, padres de familia o entrenadores dando fe
   de la experiencia. Requiere contenido nuevo (ver abajo).
7. **Galería de momentos** — grid de fotos de eventos pasados vía
   Cloudinary, o reutilizar el widget de Elfsight/Instagram que ya está
   integrado en el detalle de evento.
8. **CTA final** — última invitación a inscribirse, antes del footer.
9. **Documentos legales y transparencia** — sección pública con enlace
   a los documentos institucionales del club (estatutos, certificación
   de representante legal, actas de asamblea, estados financieros,
   renta, etc.). **Ya existe un HTML construido para esto**
   (`reglamento-legal-section.html`, subido por Alejandro) con el estilo
   brutalista correcto — dos columnas: lista de documentos a la
   izquierda (cada uno linkeando a Google Drive) y panel de título a la
   derecha. No rediseñar, solo integrarlo como componente.
   - [ ] Pasar la lista de documentos (hoy hardcodeada en el HTML) a un
         modelo simple `DocumentoLegal { id, nombre, url, orden }`
         editable desde el admin — estos documentos se actualizan una
         vez al año (renta, estados financieros, acta de asamblea) y no
         debería requerir un despliegue nuevo cada vez
   - [ ] Confirmar si esta sección vive dentro del home (como scroll
         final antes del footer) o como página aparte enlazada desde el
         footer (`/transparencia`) — dado que es contenido de
         cumplimiento más que de atracción, una página aparte puede
         ordenar mejor la página de inicio
10. **Footer** — contacto, redes, ubicación, enlaces a políticas de
    datos (Fase 7) y al modal de términos y condiciones generales
    (Fase 4).

**⚠️ Contenido real que falta recopilar antes de maquetar (no inventar
cifras ni citas):**
- [ ] Números exactos o aproximados: año de fundación, total de eventos
      realizados, total acumulado de atletas participantes
- [ ] Fotos de buena resolución de ediciones anteriores, para la línea
      de tiempo y la galería
- [ ] Testimonios reales (nombre, cita corta, foto) — confirmar que se
      tiene autorización de uso de imagen para esas personas
- [ ] Confirmar qué avales institucionales siguen vigentes hoy, para no
      mostrar el logo de una entidad que ya no respalda al club

**Modelo de datos — a decidir antes de tocar `schema.prisma`:**
- Para la línea de tiempo: evaluar si conviene un modelo nuevo y
  liviano tipo `HitoHistorico` (año, título, foto, cifra destacada,
  descripción corta) en vez de mezclar hitos puramente narrativos con
  el modelo `Evento` operativo (que tiene inscripción/pago). Mantiene
  las cosas separadas y más simples de administrar.
- Para testimonios: modelo `Testimonio` (nombre, rol, cita, fotoUrl,
  destacado, orden).
- Para las cifras de confianza: si son solo 3-4 números, puede bastar
  con campos simples editables desde el admin en vez de una tabla
  relacional completa.

**Pasos de construcción:**
1. Copy y wireframe de baja fidelidad — validar contigo el orden y los
   mensajes clave antes de maquetar en código
2. Recopilar el contenido real listado arriba
3. Definir el modelo de datos (según lo anotado)
4. Construir los componentes de UI siguiendo la identidad brutalista ya
   establecida (bordes gruesos, sombras duras, tipografías del sistema)
5. SEO y performance: metadatos Open Graph, datos estructurados
   schema.org (`SportsOrganization`), imágenes vía Cloudinary
6. QA responsive — es la página con más tráfico de celular

**Fuera de alcance de esta fase:** blog/noticias generales del club más
allá de las noticias por evento ya existentes (Fase 3), soporte
multi-idioma.

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
