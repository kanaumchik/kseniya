import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "k.a.naumchik@gmail.com" },
    update: {
      publicId: 1,
      name: "Ксения Наумчик",
      passwordHash: await hashPassword("1234"),
      role: "ADMIN",
      timeZone: "Asia/Yekaterinburg",
    },
    create: {
      publicId: 1,
      email: "k.a.naumchik@gmail.com",
      name: "Ксения Наумчик",
      passwordHash: await hashPassword("1234"),
      role: "ADMIN",
      timeZone: "Asia/Yekaterinburg",
    },
  });

  await prisma.user.upsert({
    where: { email: "basov.o.p@gmail.com" },
    update: {
      publicId: 2,
      name: "Олег Басов",
      passwordHash: await hashPassword("8765"),
      role: "USER",
      timeZone: "Europe/Moscow",
    },
    create: {
      publicId: 2,
      email: "basov.o.p@gmail.com",
      name: "Олег Басов",
      passwordHash: await hashPassword("8765"),
      role: "USER",
      timeZone: "Europe/Moscow",
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
