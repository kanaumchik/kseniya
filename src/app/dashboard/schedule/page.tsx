import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSchedule } from "@/components/AdminSchedule";
import { SignOutButton } from "@/components/SignOutButton";
import { prisma } from "@/lib/prisma";
import { getAdminSlotsForDateKeys, getDateKeysForAdminView } from "@/lib/slots";
import { psychologistTimeZone } from "@/lib/time";

type SchedulePageProps = {
  searchParams: Promise<{
    day?: string;
    month?: string;
    view?: string;
    year?: string;
  }>;
};

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const now = new Date();
  const year = normalizeYear(params.year, now.getFullYear());
  const month = normalizeMonth(params.month, now.getMonth() + 1);
  const day = normalizeDay(params.day, now.getDate());
  const view = normalizeView(params.view);
  const dateKeys = getDateKeysForAdminView(year, month, view, day);
  const [slots, users, dayOffs] = await Promise.all([
    getAdminSlotsForDateKeys(dateKeys),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { email: "asc" },
    }),
    prisma.dayOff.findMany({
      orderBy: { dateKey: "asc" },
      select: {
        id: true,
        dateKey: true,
      },
    }),
  ]);
  const availableSlots = slots.filter((slot) => !slot.isBooked && !slot.isBlocked && !slot.isDayOff);

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="border-b border-[var(--line)] bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/dashboard">
            <p className="font-serif text-lg uppercase tracking-[0.12em] text-[var(--gold-light)]">Ксения Наумчик</p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--muted)]">Мое расписание</p>
          </Link>
          <div className="flex items-center gap-3">
            <Link className="secondary-button px-4 py-2 text-sm" href="/dashboard">
              На главную
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <AdminSchedule
        availableSlots={availableSlots}
        currentUser={{ id: session.user.id, name: session.user.name ?? "Профиль", email: session.user.email ?? "" }}
        dayOffs={dayOffs}
        month={month}
        slots={slots}
        timeZone={psychologistTimeZone}
        users={users}
        view={view}
        year={year}
      />
    </main>
  );
}

function normalizeView(value: string | undefined): "month" | "week" | "day" {
  return value === "week" || value === "day" ? value : "month";
}

function normalizeYear(value: string | undefined, fallback: number) {
  const year = Number(value);

  return Number.isInteger(year) && year >= 2020 && year <= 2100 ? year : fallback;
}

function normalizeMonth(value: string | undefined, fallback: number) {
  const month = Number(value);

  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : fallback;
}

function normalizeDay(value: string | undefined, fallback: number) {
  const day = Number(value);

  return Number.isInteger(day) && day >= 1 && day <= 31 ? day : fallback;
}
