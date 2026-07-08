import { auth } from "@/auth";
import { DashboardHome } from "@/components/DashboardHome";
import { prisma } from "@/lib/prisma";
import { getClientSlots } from "@/lib/slots";
import { psychologistTimeZone } from "@/lib/time";

export default async function Home() {
  const session = await auth();
  const now = new Date();
  const isAdmin = session?.user.role === "ADMIN";
  const role = session?.user.role ?? null;
  const slots = session?.user ? await getClientSlots() : [];
  const [currentUser, users] = await Promise.all([
    session?.user
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, email: true, timeZone: true },
        })
      : null,
    isAdmin
      ? prisma.user.findMany({
        where: { role: "USER" },
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { email: "asc" },
      })
      : [],
  ]);
  const timeZone = session?.user ? (isAdmin ? psychologistTimeZone : (currentUser?.timeZone ?? session.user.timeZone)) : psychologistTimeZone;

  return (
    <DashboardHome
      email={currentUser?.email ?? session?.user.email}
      id={session?.user.id}
      month={now.getMonth() + 1}
      name={currentUser?.name ?? session?.user.name}
      role={role}
      slots={slots}
      timeZone={timeZone}
      users={users}
      year={now.getFullYear()}
    />
  );
}
