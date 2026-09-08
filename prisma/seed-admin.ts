// Script puntual para crear/actualizar un usuario ADMIN del panel (Fase 6).
// No hay flujo de signup (es un panel interno): se ejecuta a mano.
//
// Uso: npx tsx prisma/seed-admin.ts <email> <password> [nombre]
//
// No se agrega como script `npm run` para no dejarlo en un pipeline
// automatizado: es una operación manual, con la contraseña en argv.

import "dotenv/config";
import dns from "node:dns";
import net from "node:net";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Ver nota en lib/prisma.ts.
dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [, , email, password, nombre = "Administrador"] = process.argv;

  if (!email || !password) {
    console.error("Uso: npx tsx prisma/seed-admin.ts <email> <password> [nombre]");
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: { passwordHash, nombre, rol: "ADMIN" },
    create: { email, passwordHash, nombre, rol: "ADMIN" },
  });

  console.log(`✓ Usuario ADMIN listo: ${usuario.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
