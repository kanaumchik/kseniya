import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PaymentCheckout } from "@/components/PaymentCheckout";
import { ProfileMenu } from "@/components/ProfileMenu";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/time";

const packagePrices: Record<string, number> = {
  "Запуск трансформации": 10000,
  "Глубина и поддержка": 20000,
  "От хаоса к гармонии и порядку": 24000,
};

export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ bookingId?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (session.user.role === "ADMIN") redirect("/history");

  const { bookingId } = await searchParams;
  const id = Number(bookingId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const booking = await prisma.booking.findFirst({
    where: { id, userId: Number(session.user.id), type: "SESSION" },
    select: { startsAt: true, clientTimeZone: true, packageTitle: true, user: { select: { name: true } } },
  });
  if (!booking) notFound();

  const serviceTitle = booking.packageTitle ?? "Индивидуальная психологическая сессия";
  const amount = booking.packageTitle ? packagePrices[booking.packageTitle] ?? 4000 : 4000;
  const amountLabel = `${new Intl.NumberFormat("ru-RU").format(amount)} ₽`;
  const bookingLabel = `${formatDateTime(booking.startsAt, booking.clientTimeZone)} · 90 минут`;

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="border-b border-[var(--line)] bg-black/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/">
            <p className="font-serif text-lg uppercase tracking-[0.12em] text-[var(--gold-light)]">Ксения Наумчик</p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--muted)]">Автор трансформационных программ</p>
          </Link>
          <ProfileMenu name={booking.user.name} role={session.user.role} />
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <PaymentCheckout amountLabel={amountLabel} bookingLabel={bookingLabel} serviceTitle={serviceTitle} />
      </div>
    </main>
  );
}
