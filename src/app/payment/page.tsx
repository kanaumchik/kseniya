import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PaymentCheckout } from "@/components/PaymentCheckout";
import { ProfileMenu } from "@/components/ProfileMenu";
import { formatDateTime } from "@/lib/time";

const packagePrices: Record<string, number> = {
  "Запуск трансформации": 10000,
  "Глубина и поддержка": 20000,
  "От хаоса к гармонии и порядку": 24000,
};

export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ startsAt?: string; timeZone?: string; packageTitle?: string; paymentNotice?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (session.user.role === "ADMIN") redirect("/history");

  const { startsAt, timeZone, packageTitle, paymentNotice } = await searchParams;
  const startsAtDate = new Date(startsAt ?? "");
  if (!startsAt || !timeZone || Number.isNaN(startsAtDate.getTime())) notFound();

  const normalizedPackageTitle = packageTitle && packagePrices[packageTitle] ? packageTitle : undefined;
  const serviceTitle = normalizedPackageTitle ?? "Индивидуальная психологическая сессия";
  const amount = normalizedPackageTitle ? packagePrices[normalizedPackageTitle] : 4000;
  const amountLabel = `${new Intl.NumberFormat("ru-RU").format(amount)} ₽`;
  let bookingLabel: string;
  try {
    bookingLabel = `${formatDateTime(startsAtDate, timeZone)} · 90 минут`;
  } catch {
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
          <ProfileMenu name={session.user.name ?? "Профиль"} role={session.user.role} />
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <PaymentCheckout amountLabel={amountLabel} bookingLabel={bookingLabel} packageTitle={normalizedPackageTitle} paymentNotice={paymentNotice === "shown"} serviceTitle={serviceTitle} startsAt={startsAtDate.toISOString()} timeZone={timeZone} />
      </div>
    </main>
  );
}
