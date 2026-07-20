import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createPromoCodeAction, togglePromoCodeAction } from "@/app/actions";
import { ProfileMenu } from "@/components/ProfileMenu";
import { prisma } from "@/lib/prisma";

export default async function PromoCodesPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (session.user.role !== "ADMIN") redirect("/bookings");

  const [promoCodes, admin] = await Promise.all([
    prisma.promoCode.findMany({ orderBy: [{ isActive: "desc" }, { createdAt: "desc" }] }),
    prisma.user.findUnique({ where: { id: Number(session.user.id) }, select: { name: true } }),
  ]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="border-b border-[var(--line)] bg-black/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/">
            <p className="font-serif text-lg uppercase tracking-[0.12em] text-[var(--gold-light)]">Ксения Наумчик</p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--muted)]">Автор трансформационных программ</p>
          </Link>
          <ProfileMenu name={admin?.name ?? session.user.name} role={session.user.role} />
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-8">
        <Link className="secondary-button inline-flex w-fit px-4 py-2 text-sm" href="/">На главную</Link>
        <div className="gold-card p-5 sm:p-7">
          <h1 className="font-serif text-3xl text-[var(--gold-light)]">Промокоды</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Промокоды действуют только на разовую психологическую сессию стоимостью 4 000 ₽.</p>

          <form action={createPromoCodeAction} className="mt-6 grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
            <label className="grid gap-2 text-sm font-medium">Код<input className="field" maxLength={80} name="code" required /></label>
            <label className="grid gap-2 text-sm font-medium">Новая цена, ₽<input className="field" max={3999} min={1} name="discountedAmount" required type="number" /></label>
            <button className="primary-button min-h-12 px-5" type="submit">Добавить</button>
          </form>
        </div>

        <div className="grid gap-3">
          {promoCodes.map((promoCode) => (
            <article className="gold-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" key={promoCode.id}>
              <div>
                <strong className="text-lg text-white">{promoCode.code}</strong>
                <p className="mt-1 text-sm text-[var(--muted)]">Цена: {new Intl.NumberFormat("ru-RU").format(promoCode.discountedAmount)} ₽ · {promoCode.isActive ? "активен" : "отключён"}</p>
              </div>
              <form action={togglePromoCodeAction}>
                <input name="id" type="hidden" value={promoCode.id} />
                <input name="isActive" type="hidden" value={String(!promoCode.isActive)} />
                <button className={promoCode.isActive ? "secondary-button min-h-11 px-4" : "primary-button min-h-11 px-4"} type="submit">{promoCode.isActive ? "Отключить" : "Включить"}</button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
