import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { synchronizePaymentByAttempt } from "@/lib/payment-service";
import { prisma } from "@/lib/prisma";

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ attempt?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { attempt: attemptId } = await searchParams;
  if (!attemptId) notFound();
  const userId = Number(session.user.id);

  let payment;
  let synchronizationFailed = false;
  try {
    payment = await synchronizePaymentByAttempt(attemptId, userId);
  } catch (error) {
    synchronizationFailed = true;
    console.error("Не удалось проверить результат платежа YooKassa:", error instanceof Error ? error.message : error);
    payment = await prisma.payment.findFirst({ where: { id: attemptId, userId } });
  }
  if (!payment) notFound();

  const succeeded = payment.status === "SUCCEEDED" && payment.bookingId;
  const slotConflict = payment.status === "PAID_SLOT_CONFLICT";
  const canceled = payment.status === "CANCELED" || payment.status === "FAILED";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-white">
      <section className="gold-card w-full max-w-xl p-6 text-center sm:p-9">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-[var(--line)] text-2xl text-[var(--gold-light)]">
          {succeeded ? "✓" : slotConflict || canceled ? "!" : "i"}
        </div>
        <h1 className="mt-5 font-serif text-3xl text-[var(--gold-light)]">
          {succeeded ? "Оплата прошла успешно" : slotConflict ? "Оплата получена, нужна помощь" : canceled ? "Оплата не завершена" : "Проверяем оплату"}
        </h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          {succeeded
            ? "Запись подтверждена и появилась в разделе «Мои записи»."
            : slotConflict
              ? "За время оплаты выбранное время стало недоступно. Деньги не потеряны — свяжитесь с нами для переноса или возврата."
              : canceled
                ? "Платёж отменён или не был завершён. Вы можете вернуться и попробовать ещё раз."
                : synchronizationFailed
                  ? "Сейчас не удалось получить статус платежа. Обновите страницу через несколько секунд."
                  : "YooKassa ещё обрабатывает платёж. Обновите страницу через несколько секунд."}
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link className="secondary-button inline-flex min-h-12 items-center justify-center px-5" href="/schedule">Вернуться к расписанию</Link>
          <Link className="primary-button inline-flex min-h-12 items-center justify-center px-5" href="/bookings">Мои записи</Link>
        </div>
      </section>
    </main>
  );
}
