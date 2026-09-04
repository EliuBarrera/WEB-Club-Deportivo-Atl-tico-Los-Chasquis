import dns from "node:dns";
import net from "node:net";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Node abre conexiones IPv4 e IPv6 en paralelo por defecto ("Happy
// Eyeballs"). En algunas redes eso dispara un bloqueo del router/firewall
// que deja las conexiones siguientes en timeout. Se fuerza una sola
// conexión IPv4 por intento, igual que hace `psql`.
dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
