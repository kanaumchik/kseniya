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
  const timeZone = session?.user ? (isAdmin ? psychologistTimeZone : session.user.timeZone) : psychologistTimeZone;
  const slots = session?.user ? await getClientSlots() : [];
  const users = isAdmin
    ? await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { email: "asc" },
      })
    : [];

  return (
    <DashboardHome
      email={session?.user.email}
      id={session?.user.id}
      month={now.getMonth() + 1}
      name={session?.user.name}
      role={role}
      slots={slots}
      timeZone={timeZone}
      users={users}
      year={now.getFullYear()}
    />
  );
}
