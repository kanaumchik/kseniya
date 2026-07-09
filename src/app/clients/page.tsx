import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileMenu } from "@/components/ProfileMenu";
import { prisma } from "@/lib/prisma";

type ClientsPageProps = {
  searchParams: Promise<{
    course?: string;
    email?: string;
    name?: string;
    phone?: string;
  }>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/bookings");
  }

  const params = await searchParams;
  const filters = {
    course: (params.course ?? "").trim().toLowerCase(),
    email: (params.email ?? "").trim().toLowerCase(),
    name: (params.name ?? "").trim().toLowerCase(),
    phone: (params.phone ?? "").trim().toLowerCase(),
  };
  const [clients, adminUser] = await Promise.all([
    getClients(filters),
    prisma.user.findUnique({
      where: { id: Number(session.user.id) },
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
          <h1 className="font-serif text-3xl text-[var(--gold-light)]">Мои клиенты</h1>

          <form className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]" action="/clients">
            <input className="field" name="name" defaultValue={filters.name} placeholder="Имя и фамилия" />
            <input className="field" name="phone" defaultValue={filters.phone} placeholder="Телефон" />
            <input className="field" name="email" defaultValue={filters.email} placeholder="E-mail" />
            <input className="field" name="course" defaultValue={filters.course} placeholder="Активный курс" />
            <button className="primary-button px-5 py-3 text-sm" type="submit">
              Найти
            </button>
          </form>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead className="text-xs uppercase text-[var(--muted)]">
                <tr className="border-b border-[var(--line)]">
                  <th className="py-3 pr-4">Клиент</th>
                  <th className="py-3 pr-4">E-mail</th>
                  <th className="py-3 pr-4">Телефон</th>
                  <th className="py-3 pr-4">Активные курсы</th>
                  <th className="py-3 pr-4">Источник</th>
                  <th className="py-3 pr-4">Пакет сопровождения</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr className="border-b border-white/[0.06]" key={client.id}>
                    <td className="py-3 pr-4">
                      <Link className="font-medium text-[var(--gold-light)] hover:text-[var(--gold)]" href={`/clients/${client.id}`}>
                        {client.name}
                      </Link>
                      <span className="ml-2 text-xs text-[var(--muted)]">ID {client.id}</span>
                    </td>
                    <td className="py-3 pr-4 text-white/82">{client.email}</td>
                    <td className="py-3 pr-4 text-white/82">{client.phone || "Не указан"}</td>
                    <td className="py-3 pr-4 text-white/82">{formatCourses(client.courses)}</td>
                    <td className="py-3 pr-4 text-white/82">{client.source || "Не указан"}</td>
                    <td className="py-3 pr-4 text-white/82">{formatPackage(client.bookings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {clients.length === 0 ? <p className="py-6 text-sm text-[var(--muted)]">Клиенты по выбранным фильтрам не найдены.</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

async function getClients(filters: { course: string; email: string; name: string; phone: string }) {
  const clients = await prisma.user.findMany({
    where: {
      role: "USER",
      ...(filters.email ? { email: { contains: filters.email } } : {}),
      ...(filters.phone ? { phone: { contains: filters.phone } } : {}),
    },
    include: {
      courses: {
        where: { remaining: { gt: 0 } },
        orderBy: { updatedAt: "desc" },
      },
      bookings: {
        where: {
          type: "SESSION",
          packageTitle: { not: null },
        },
        orderBy: { startsAt: "desc" },
        take: 1,
      },
    },
    orderBy: [{ id: "asc" }, { createdAt: "asc" }],
  });

  return clients.filter((client) => {
    const nameMatch = filters.name ? client.name.toLowerCase().includes(filters.name) : true;
    const courseMatch = filters.course ? client.courses.some((course) => course.title.toLowerCase().includes(filters.course)) : true;

    return nameMatch && courseMatch;
  });
}

function formatCourses(courses: { title: string; remaining: number }[]) {
  if (courses.length === 0) {
    return "Нет активных курсов";
  }

  return courses.map((course) => `${course.title} (${course.remaining})`).join(", ");
}

function formatPackage(bookings: { packageTitle: string | null }[]) {
  return bookings[0]?.packageTitle ?? "Не выбран";
}
