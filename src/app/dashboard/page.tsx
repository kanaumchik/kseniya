import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHome } from "@/components/DashboardHome";
import { prisma } from "@/lib/prisma";
import { getClientSlots, getSlotsForMonth } from "@/lib/slots";
import { psychologistTimeZone } from "@/lib/time";

type DashboardPageProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const now = new Date();
  const params = await searchParams;
  const year = normalizeYear(params.year, now.getFullYear());
  const month = normalizeMonth(params.month, now.getMonth() + 1);
  const isAdmin = session.user.role === "ADMIN";
  const timeZone = isAdmin ? psychologistTimeZone : session.user.timeZone;
  const slots = isAdmin ? await getSlotsForMonth(year, month) : await getClientSlots();
  const users = isAdmin
    ? await prisma.user.findMany({
        where: { role: "USER" },
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
      month={month}
      name={session.user.name}
      role={session.user.role}
      slots={slots}
      timeZone={timeZone}
      users={users}
      year={year}
    />
  );
}

function normalizeYear(value: string | undefined, fallback: number) {
  const year = Number(value);

  return Number.isInteger(year) && year >= 2020 && year <= 2100 ? year : fallback;
}

function normalizeMonth(value: string | undefined, fallback: number) {
  const month = Number(value);

  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : fallback;
}
