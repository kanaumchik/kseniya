import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "basov.o.p@gmail.com" },
    update: {
      name: "Тестовый пользователь",
      passwordHash: await hashPassword("8765"),
      role: "USER",
      timeZone: "Europe/Moscow",
    },
    create: {
      email: "basov.o.p@gmail.com",
      name: "Тестовый пользователь",
      passwordHash: await hashPassword("8765"),
      role: "USER",
      timeZone: "Europe/Moscow",
    },
  });

  await prisma.user.upsert({
    where: { email: "k.a.naumchik@gmail.com" },
    update: {
      name: "Администратор",
      passwordHash: await hashPassword("1234"),
      role: "ADMIN",
      timeZone: "Asia/Yekaterinburg",
    },
    create: {
      email: "k.a.naumchik@gmail.com",
      name: "Администратор",
      passwordHash: await hashPassword("1234"),
      role: "ADMIN",
      timeZone: "Asia/Yekaterinburg",
    },
  });
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
