import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD is required to seed the admin account.");
  }

  await prisma.user.upsert({
    where: { id: 1 },
    update: {
      email: "naumchik.psy@yandex.ru",
      name: "Ксения Наумчик",
      passwordHash: await hashPassword(adminPassword),
      role: "ADMIN",
      timeZone: "Asia/Yekaterinburg",
    },
    create: {
      id: 1,
      email: "naumchik.psy@yandex.ru",
      name: "Ксения Наумчик",
      passwordHash: await hashPassword(adminPassword),
      role: "ADMIN",
      timeZone: "Asia/Yekaterinburg",
    },
  });

  await prisma.$executeRaw`
    SELECT setval(pg_get_serial_sequence('"User"', 'id'), COALESCE((SELECT MAX(id) FROM "User"), 1))
  `;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
