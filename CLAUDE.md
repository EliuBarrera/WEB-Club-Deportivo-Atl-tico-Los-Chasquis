# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Web platform for **Club Atlético Los Chasquis** (Tunja, Boyacá), replacing a WordPress site (`clubloschasquis.com`) that hosts the club's athletic events (street races, track and field). Two user-facing goals:
1. Athletes: browse the event calendar, view full event details, register and pay online.
2. Admin: create/edit events and manage registrations without touching code.

Full roadmap, phase checklist, and fixed stack/design decisions (payment provider, brand colors, visual style) live in `Documentation/PLAN_DESARROLLO.md` — read it before planning any feature work, since it records decisions ("don't change without asking") that aren't visible in code yet.

**Current state**: early scaffold. `app/page.tsx` and `app/layout.tsx` are still the unmodified `create-next-app` defaults. The Prisma schema and one migration exist and are applied to the database, but no application code (routes, components, `lib/`, Prisma client singleton, seed script) has been written yet.

## Commands

- `npm run dev` — start dev server (Turbopack, via `next dev`)
- `npm run build` — production build
- `npm start` — run production build
- `npm run lint` — ESLint (flat config, `eslint-config-next`)
- `npx prisma migrate dev` — create/apply a migration after editing `prisma/schema.prisma`
- `npx prisma generate` — regenerate the Prisma client after schema changes
- `npx prisma studio` — browse the database

There is no test runner configured in this repo yet.

## Architecture

- **Next.js 16**, App Router, TypeScript, Tailwind CSS v4. The app directory is at the repo root (`app/`), not `src/app/`.
- **This Next.js version has breaking changes vs. training data** — `AGENTS.md` (imported above) requires reading `node_modules/next/dist/docs/` before writing routing/rendering code. Already visible in this repo: `layout.tsx`'s root layout takes a typed `LayoutProps<"/">` prop instead of `{ children: React.ReactNode }`.
- **Database**: PostgreSQL (Neon), via Prisma 7. `prisma.config.ts` loads `DATABASE_URL` from `.env` explicitly (Prisma 7 no longer auto-loads `.env`, and `datasource db` in `schema.prisma` has no inline `url`).
- **Data model** (`prisma/schema.prisma`) centers on `Evento`, with 1:1 relations to `Recorrido`, `Premios`, `Reglamento`, `Logistica`, and 1:N relations to `Categoria` (→ `CategoriaPrueba`, a join table against the global `PruebaCatalogo`), `Noticia`, `Objetivo`, `ConvocatoriaItem`, `Costo`, and `Inscripcion` (event registrations, replacing the old WooCommerce + Google Sheets flow). `Usuario` is the admin-panel account model.
- **Domain language is Spanish** throughout the schema (model/field names) and per `PLAN_DESARROLLO.md`, code and comments should stay in Spanish for consistency with the rest of the club's codebase.
- Prisma reference skills are vendored under `.claude/skills/`, `.agents/skills/`, and `.windsurf/skills/` (same set duplicated per tool: `prisma-cli`, `prisma-client-api`, `prisma-compute`, `prisma-database-setup`, `prisma-postgres`, `prisma-postgres-setup`, `prisma-upgrade-v7`, `prisma-driver-adapter-implementation`, `prisma-mongodb-upgrade`).
