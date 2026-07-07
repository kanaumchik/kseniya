import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileMenu } from "@/components/ProfileMenu";
import { prisma } from "@/lib/prisma";
import { formatDateKey, formatDateTime, formatTimeRange, makeZonedDateFromKey, psychologistTimeZone } from "@/lib/time";

type HistoryPageProps = {
  searchParams: Promise<{
    client?: string;
    date?: string;
    type?: string;
  }>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/bookings");
  }

  const params = await searchParams;
  const type = params.type === "DIAGNOSTIC" || params.type === "SESSION" ? params.type : "";
  const client = (params.client ?? "").trim();
  const rawDate = params.date ?? "";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : "";
  const [bookings, adminUser] = await Promise.all([
    getHistory({ client, date, type }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="border-b border-[var(--line)] bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/">
            <p className="font-serif text-lg uppercase tracking-[0.12em] text-[var(--gold-light)]">Ксения Наумчик</p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--muted)]">Автор трансформационных программ</p>
          </Link>
          <ProfileMenu name={adminUser?.name ?? session.user.name} role={session.user.role} />
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8">
        <Link className="secondary-button inline-flex w-fit px-4 py-2 text-sm" href="/">
          На главную
        </Link>

        <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl text-[var(--gold-light)]">История</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">Все записи отсортированы по дате и времени.</p>
            </div>
          </div>

          <form className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]" action="/history">
            <label className="grid gap-2 text-sm font-medium text-white/86">
              Дата
              <input className="field" name="date" type="date" defaultValue={date} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-white/86">
              Клиент
              <input className="field" name="client" defaultValue={client} placeholder="Имя или фамилия" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-white/86">
              Тип
              <select className="field" name="type" defaultValue={type}>
                <option value="">Все</option>
                <option value="DIAGNOSTIC">Диагностика</option>
                <option value="SESSION">Сессия</option>
              </select>
            </label>
            <button className="primary-button self-end px-5 py-3 text-sm" type="submit">
              Показать
            </button>
          </form>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="text-xs uppercase text-[var(--muted)]">
                <tr className="border-b border-[var(--line)]">
                  <th className="py-3 pr-4">Дата и время</th>
                  <th className="py-3 pr-4">Клиент</th>
                  <th className="py-3 pr-4">Тип</th>
                  <th className="py-3 pr-4">Статус</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const status = getHistoryStatus(booking);

                  return (
                    <tr className="border-b border-white/[0.06]" key={booking.id}>
                      <td className="py-3 pr-4 text-white/86">
                        {formatDateTime(booking.startsAt, psychologistTimeZone)}, {formatTimeRange(booking.startsAt, booking.endsAt, psychologistTimeZone)}
                      </td>
                      <td className="py-3 pr-4">
                        <Link className="font-medium text-[var(--gold-light)] hover:text-[var(--gold)]" href={`/clients/${booking.user.id}`}>
                          {booking.user.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-white/82">{formatType(booking.type, booking.diagnosticNumber)}</td>
                      <td className={`py-3 pr-4 font-semibold ${status.className}`}>{status.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {bookings.length === 0 ? <p className="py-6 text-sm text-[var(--muted)]">Записей по выбранным фильтрам нет.</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

async function getHistory({ client, date, type }: { client: string; date: string; type: string }) {
  const dateWhere = date
    ? {
        startsAt: {
          gte: makeZonedDateFromKey(date, 0, psychologistTimeZone),
          lt: makeZonedDateFromKey(nextDateKey(date), 0, psychologistTimeZone),
        },
      }
    : {};

  const bookings = await prisma.booking.findMany({
    where: {
      ...(type ? { type } : {}),
      ...dateWhere,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { startsAt: "asc" },
  });
  const normalizedClient = client.toLowerCase();

  return normalizedClient
    ? bookings.filter((booking) => `${booking.user.name} ${booking.user.email}`.toLowerCase().includes(normalizedClient))
    : bookings;
}

function getHistoryStatus(booking: { status: string; endsAt: Date; rescheduledAt: Date | null }) {
  if (booking.status === "CANCELLED") {
    return { label: "Отменена", className: "text-red-300" };
  }

  if (booking.rescheduledAt && booking.endsAt >= new Date()) {
    return { label: "Перенос", className: "text-orange-300" };
  }

  if (booking.endsAt < new Date()) {
    return { label: "Проведена", className: "text-emerald-300" };
  }

  return { label: "Запланирована", className: "text-zinc-300" };
}

function formatType(type: string, diagnosticNumber: number | null) {
  if (type === "SESSION") {
    return "Сессия";
  }

  return diagnosticNumber ? `Диагностика Д${diagnosticNumber}` : "Диагностика";
}

function nextDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + 1));

  return formatDateKey(date, "UTC");
}
