import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileMenu } from "@/components/ProfileMenu";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/bookings");
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const [adminUser, aggregates, factEvents, users, hintEvents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: { name: true },
    }),
    prisma.analyticsDailyAggregate.findMany({
      orderBy: [{ dateKey: "desc" }, { count: "desc" }],
      take: 250,
    }),
    prisma.analyticsEvent.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { occurredAt: "desc" },
      take: 250,
    }),
    prisma.user.findMany({
      where: { role: "USER" },
      include: {
        analyticsEvents: {
          orderBy: { occurredAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ id: "asc" }],
    }),
    prisma.analyticsEvent.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { occurredAt: "desc" },
      take: 100,
      where: {
        eventType: "hint_generated",
        occurredAt: { gte: since },
      },
    }),
  ]);

  const topAggregates = aggregates.filter((item) => item.eventType !== "page_duration");
  const durationAggregates = aggregates.filter((item) => item.eventType === "page_duration");

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="border-b border-[var(--line)] bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/">
            <p className="font-serif text-lg uppercase tracking-[0.12em] text-[var(--gold-light)]">Ксения Наумчик</p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--muted)]">Аналитика</p>
          </Link>
          <ProfileMenu name={adminUser?.name ?? session.user.name} role={session.user.role} />
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link className="secondary-button inline-flex w-fit px-4 py-2 text-sm" href="/">
            На главную
          </Link>
          <Link className="secondary-button inline-flex w-fit px-4 py-2 text-sm" href="/clients">
            Пользователи
          </Link>
          <Link className="secondary-button inline-flex w-fit px-4 py-2 text-sm" href="/consents">
            Согласия
          </Link>
        </div>

        <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h1 className="font-serif text-3xl text-[var(--gold-light)]">Аналитика</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-white/68">
            Агрегированные данные считаются отдельно от фактических событий. Фактические события с user ID, IP и user-agent пишутся только при согласии пользователя на аналитические cookie.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <MetricCard label="Агрегированных строк" value={String(aggregates.length)} />
          <MetricCard label="Фактических событий" value={String(factEvents.length)} />
          <MetricCard label="Генераций подсказок за 30 дней" value={String(hintEvents.length)} />
        </section>

        <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="font-serif text-2xl text-[var(--gold-light)]">Агрегированные данные</h2>
          <p className="mt-2 text-sm text-white/62">Сводные счётчики без IP, user ID и user-agent.</p>
          <DataTable
            columns={["Дата", "Тип", "Событие", "Группа", "Элемент", "Страница", "Кол-во"]}
            rows={topAggregates.map((item) => [
              item.dateKey,
              item.eventType,
              item.eventName,
              item.elementGroup ?? "-",
              item.elementText ?? item.elementId ?? "-",
              item.path,
              String(item.count),
            ])}
          />
        </section>

        <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="font-serif text-2xl text-[var(--gold-light)]">Время на страницах</h2>
          <p className="mt-2 text-sm text-white/62">Агрегированная длительность без персональных данных.</p>
          <DataTable
            columns={["Дата", "Страница", "Событий", "Среднее время", "Всего"]}
            rows={durationAggregates.map((item) => [
              item.dateKey,
              item.path,
              String(item.count),
              formatDuration(Math.round(item.totalDurationMs / Math.max(item.count, 1))),
              formatDuration(item.totalDurationMs),
            ])}
          />
        </section>

        <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="font-serif text-2xl text-[var(--gold-light)]">Фактические события</h2>
          <p className="mt-2 text-sm text-white/62">Только события пользователей, которые дали согласие на аналитические cookie.</p>
          <DataTable
            columns={["Время", "Тип", "Событие", "Пользователь", "IP", "Элемент", "Страница"]}
            rows={factEvents.map((event) => [
              formatDateTime(event.occurredAt),
              event.eventType,
              event.eventName,
              event.user ? `${event.user.name} (ID ${event.user.id})` : event.anonymousId ? "Анонимный" : "-",
              event.ipAddress ?? "-",
              event.elementText ?? event.elementId ?? "-",
              event.path,
            ])}
          />
        </section>

        <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="font-serif text-2xl text-[var(--gold-light)]">Подсказки</h2>
          <p className="mt-2 text-sm text-white/62">Фактический список генераций доступен только по пользователям с analytics-согласием; агрегированное количество считается отдельно выше.</p>
          <DataTable
            columns={["Время", "Пользователь", "IP", "Страница"]}
            rows={hintEvents.map((event) => [
              formatDateTime(event.occurredAt),
              event.user ? `${event.user.name} (ID ${event.user.id})` : event.anonymousId ? "Анонимный" : "-",
              event.ipAddress ?? "-",
              event.path,
            ])}
          />
        </section>

        <section className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="font-serif text-2xl text-[var(--gold-light)]">Зарегистрированные пользователи</h2>
          <p className="mt-2 text-sm text-white/62">IP отображается только если он был законно записан в фактической аналитике после analytics-согласия.</p>
          <DataTable
            columns={["ID", "Имя", "Email", "Телефон", "Город", "Создан", "Последний IP", "Последняя активность"]}
            rows={users.map((user) => {
              const lastEvent = user.analyticsEvents[0];

              return [
                String(user.id),
                user.name,
                user.email,
                user.phone ?? "-",
                user.city ?? "-",
                formatDateTime(user.createdAt),
                lastEvent?.ipAddress ?? "-",
                lastEvent ? formatDateTime(lastEvent.occurredAt) : "-",
              ];
            })}
          />
        </section>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
      <p className="text-sm text-white/58">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[var(--gold-light)]">{value}</p>
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <thead className="text-xs uppercase text-[var(--muted)]">
          <tr className="border-b border-[var(--line)]">
            {columns.map((column) => (
              <th className="py-3 pr-4" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr className="border-b border-white/[0.06]" key={`${rowIndex}-${row.join("|")}`}>
              {row.map((cell, cellIndex) => (
                <td className="max-w-[28rem] py-3 pr-4 text-white/78" key={`${cellIndex}-${cell}`}>
                  <span className="line-clamp-3">{cell}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="py-6 text-sm text-[var(--muted)]">Данных пока нет.</p> : null}
    </div>
  );
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Yekaterinburg",
  }).format(value);
}

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} сек.`;
  }

  return `${minutes} мин. ${seconds} сек.`;
}
