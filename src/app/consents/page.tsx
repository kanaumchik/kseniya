import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileMenu } from "@/components/ProfileMenu";
import { prisma } from "@/lib/prisma";
import { psychologistTimeZone } from "@/lib/time";

export default async function ConsentEventsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/bookings");
  }

  const [events, adminUser] = await Promise.all([
    prisma.consentEvent.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
      take: 200,
    }),
    prisma.user.findUnique({
      where: { id: Number(session.user.id) },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="border-b border-[var(--line)] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]">Админка</p>
            <h1 className="mt-1 font-serif text-3xl text-[var(--gold-light)]">Журнал согласий</h1>
          </div>
          <ProfileMenu name={adminUser?.name ?? session.user.name} role={session.user.role} />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="overflow-x-auto rounded-md border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full min-w-[82rem] border-collapse text-left text-sm">
            <thead className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              <tr>
                <th className="px-3 py-3">Когда</th>
                <th className="px-3 py-3">Пользователь</th>
                <th className="px-3 py-3">Этап</th>
                <th className="px-3 py-3">Тип</th>
                <th className="px-3 py-3">Документ</th>
                <th className="px-3 py-3">Действие</th>
                <th className="px-3 py-3">Страница</th>
                <th className="px-3 py-3">Хеш события</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr className="border-b border-white/[0.06] align-top last:border-0" key={event.id}>
                  <td className="px-3 py-3 text-white/78">{formatDateTime(event.occurredAt)}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-white/88">{event.user?.name ?? "Анонимный пользователь"}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{event.user?.email ?? event.anonymousId ?? "Без идентификатора"}</p>
                  </td>
                  <td className="px-3 py-3 text-white/78">{event.stage}</td>
                  <td className="px-3 py-3 text-white/78">{event.consentType}</td>
                  <td className="px-3 py-3">
                    <p className="text-white/82">{event.documentCode ?? "Без документа"}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{event.documentVersion ?? ""}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-white/82">{event.buttonLabel ?? event.action}</p>
                    <p className="mt-1 max-w-xs text-xs leading-5 text-[var(--muted)]">{event.checkboxLabel ?? ""}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="max-w-xs break-all text-xs leading-5 text-white/70">{event.pageUrl}</p>
                  </td>
                  <td className="px-3 py-3">
                    <code className="break-all text-xs text-[var(--gold-light)]">{event.eventHash.slice(0, 16)}...</code>
                    <p className="mt-1 text-xs text-[var(--muted)]">prev: {event.previousEventHash ? `${event.previousEventHash.slice(0, 12)}...` : "нет"}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 ? <p className="px-4 py-8 text-sm text-[var(--muted)]">Событий согласий пока нет.</p> : null}
        </div>
      </section>
    </main>
  );
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    timeZone: psychologistTimeZone,
    year: "numeric",
  }).format(value);
}
