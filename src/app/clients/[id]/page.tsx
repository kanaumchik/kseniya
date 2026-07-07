import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileMenu } from "@/components/ProfileMenu";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatTimeRange, psychologistTimeZone } from "@/lib/time";

type ClientProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientProfilePage({ params }: ClientProfilePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/bookings");
  }

  const { id } = await params;
  const [client, adminUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: { updatedAt: "desc" },
        },
        bookings: {
          orderBy: { startsAt: "desc" },
          take: 20,
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    }),
  ]);

  if (!client || client.role !== "USER") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="border-b border-[var(--line)] bg-black/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/">
            <p className="font-serif text-lg uppercase tracking-[0.12em] text-[var(--gold-light)]">Ксения Наумчик</p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--muted)]">Автор трансформационных программ</p>
          </Link>
          <ProfileMenu name={adminUser?.name ?? session.user.name} role={session.user.role} />
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-8">
        <Link className="secondary-button inline-flex w-fit px-4 py-2 text-sm" href="/clients">
          Назад к клиентам
        </Link>

        <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--muted)]">ID {client.publicId ?? "не назначен"}</p>
          <h1 className="mt-2 font-serif text-3xl text-[var(--gold-light)]">{client.name}</h1>
          <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
            <Info label="E-mail" value={client.email} />
            <Info label="Телефон" value={client.phone || "Не указан"} />
            <Info label="Город" value={client.city || "Не указан"} />
            <Info label="Дата рождения" value={client.birthDate || "Не указана"} />
            <Info label="Источник привлечения" value={client.source || "Не указан"} />
            <Info label="Часовой пояс" value={client.timeZone} />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
            <h2 className="font-serif text-2xl text-[var(--gold-light)]">Активные курсы</h2>
            <div className="mt-3 grid gap-2">
              {client.courses.filter((course) => course.remaining > 0).length > 0 ? (
                client.courses
                  .filter((course) => course.remaining > 0)
                  .map((course) => (
                    <div className="rounded-md border border-[var(--line)] px-3 py-2 text-sm text-white/82" key={course.id}>
                      {course.title} ({course.remaining})
                    </div>
                  ))
              ) : (
                <p className="text-sm text-[var(--muted)]">Активных курсов нет.</p>
              )}
            </div>
          </div>

          <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
            <h2 className="font-serif text-2xl text-[var(--gold-light)]">Последние записи</h2>
            <div className="mt-3 grid gap-2">
              {client.bookings.length > 0 ? (
                client.bookings.map((booking) => (
                  <div className="rounded-md border border-[var(--line)] px-3 py-2 text-sm" key={booking.id}>
                    <p className="font-medium text-white">
                      {formatDateTime(booking.startsAt, psychologistTimeZone)}, {formatTimeRange(booking.startsAt, booking.endsAt, psychologistTimeZone)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {booking.type === "SESSION" ? "Сессия" : booking.diagnosticNumber ? `Диагностика Д${booking.diagnosticNumber}` : "Диагностика"} ·{" "}
                      {booking.status === "CANCELLED" ? "Отменена" : "Активна"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">Записей пока нет.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2">
      <p className="text-xs uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-white/86">{value}</p>
    </div>
  );
}
