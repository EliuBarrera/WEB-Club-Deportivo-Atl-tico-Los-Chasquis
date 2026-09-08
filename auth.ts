import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { RolUsuario } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const credencialesSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// Hash bcrypt "señuelo" (de un valor fijo que no corresponde a ninguna
// contraseña real) usado únicamente para igualar tiempos de respuesta
// cuando el email no existe: así el tiempo que tarda el login no delata
// si un email está o no registrado (mitigación de "user enumeration").
const HASH_SENUELO =
  "$2b$12$ZZ77lfaAdgJspTlFuKPX3.p94m4SRmMaTKDqbJ73WYaWe0n.09nmK";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Sesión corta por inactividad: si no hay actividad en 2h la cookie expira
  // sola (Auth.js siempre pone una fecha de expiración fija en la cookie de
  // sesión JWT, no existe opción soportada para que dure solo "hasta cerrar
  // el navegador"). `updateAge` controla cada cuánto se reescribe la cookie
  // mientras hay actividad, para no reescribirla en cada request.
  session: { strategy: "jwt", maxAge: 2 * 60 * 60, updateAge: 30 * 60 },
  pages: { signIn: "/admin/login" },
  // Confirmado explícitamente (no depende de que Auth.js detecte solo que
  // corre en Vercel): sin esto, los redirects de login/logout en
  // producción pueden armarse contra el host equivocado detrás del proxy.
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, request) {
        // El provider de Credentials no trae rate limiting propio (así lo
        // advierte la propia doc de Auth.js): se reutiliza el limitador por
        // IP de Fase 4 para frenar fuerza bruta contra el login.
        const ip = getClientIp(request);
        const puedeIntentar = await checkRateLimit(ip);
        if (!puedeIntentar) return null;

        const datos = credencialesSchema.safeParse(credentials);
        if (!datos.success) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: datos.data.email },
        });

        const passwordValida = await bcrypt.compare(
          datos.data.password,
          usuario?.passwordHash ?? HASH_SENUELO
        );
        if (!usuario || !passwordValida) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          rol: usuario.rol,
        };
      },
    }),
  ],
  callbacks: {
    // Primera capa de protección de /admin/* y /api/admin/* (ver proxy.ts).
    // Solo decodifica el JWT de la cookie de sesión, sin consultar la base
    // de datos, tal como recomienda la documentación de Next.js para Proxy.
    // No distingue rol (ADMIN/EDITOR): eso lo hace la segunda capa
    // (obligatoria, no opcional), que vive en lib/admin/dal.ts y se invoca
    // dentro de cada Server Component/Route Handler del panel admin.
    authorized({ request, auth }) {
      if (request.nextUrl.pathname === "/admin/login") return true;
      return Boolean(auth?.user);
    },
    jwt({ token, user }) {
      if (user) {
        token.rol = (user as { rol: RolUsuario }).rol;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.rol = token.rol as RolUsuario;
      }
      return session;
    },
  },
});

// No hace falta augmentar "next-auth/jwt": el tipo `JWT` de @auth/core ya
// extiende `Record<string, unknown>`, así que `token.rol` es válido sin
// declaración adicional.
declare module "next-auth" {
  interface User {
    rol: RolUsuario;
  }
  interface Session {
    user: {
      rol: RolUsuario;
    } & DefaultSession["user"];
  }
}
