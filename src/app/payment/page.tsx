import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PaymentCheckout } from "@/components/PaymentCheckout";
import { ProfileMenu } from "@/components/ProfileMenu";
import { getPaymentOffer } from "@/lib/payment-catalog";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/time";

export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ startsAt?: string; endsAt?: string; timeZone?: string; packageTitle?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (session.user.role === "ADMIN") redirect("/history");

  const { startsAt, endsAt, timeZone, packageTitle } = await searchParams;
  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) }, select: { email: true } });
  if (!user) redirect("/");
  const startsAtDate = new Date(startsAt ?? "");
  const endsAtDate = new Date(endsAt ?? "");
  if (!startsAt || !endsAt || !timeZone || Number.isNaN(startsAtDate.getTime()) || Number.isNaN(endsAtDate.getTime())) notFound();

  const offer = getPaymentOffer(packageTitle);
  const normalizedPackageTitle = offer.packageTitle ?? undefined;
  const serviceTitle = offer.title;
  const amount = offer.amount;
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
        <PaymentCheckout amountLabel={amountLabel} bookingLabel={bookingLabel} packageTitle={normalizedPackageTitle} receiptEmail={user.email} serviceTitle={serviceTitle} startsAt={startsAtDate.toISOString()} timeZone={timeZone} />
      </div>
    </main>
  );
}
