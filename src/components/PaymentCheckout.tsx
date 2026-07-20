"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createPaymentAction, validatePromoCodeAction } from "@/app/actions";

type PaymentMethod = "card" | "sbp";

export function PaymentCheckout({ amount, amountLabel, bookingLabel, packageTitle, receiptEmail, serviceTitle, startsAt, timeZone }: { amount: number; amountLabel: string; bookingLabel: string; packageTitle?: string; receiptEmail: string; serviceTitle: string; startsAt: string; timeZone: string }) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [promoCode, setPromoCode] = useState("");
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [paymentError, paymentAction, isPaymentPending] = useActionState(createPaymentAction, undefined);
  const [promoState, promoAction, isPromoPending] = useActionState(validatePromoCodeAction, {});
  const normalizedPromoCode = promoCode.trim().toLocaleUpperCase("ru-RU");
  const appliedPromoAmount = !packageTitle && promoState.code === normalizedPromoCode ? promoState.amount : undefined;
  const payableAmount = appliedPromoAmount ?? amount;
  const payableLabel = formatRubles(payableAmount);

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="gold-card p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">Шаг 1 из 2</p>
          <h1 className="mt-3 font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">Выберите способ оплаты</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Оплата выбранной психологической услуги</p>

          <div className="mt-7 grid gap-3">
            <PaymentOption active={method === "card"} description="Картой любого российского банка" label="Банковская карта" onClick={() => setMethod("card")}>
              <CardIcon />
            </PaymentOption>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between">
            <button className="secondary-button inline-flex min-h-12 items-center justify-center px-5" onClick={() => setShowLeaveConfirmation(true)} type="button">Вернуться в мои записи</button>
            <form action={paymentAction} className="sm:max-w-sm">
              <input name="startsAt" type="hidden" value={startsAt} />
              <input name="timeZone" type="hidden" value={timeZone} />
              <input name="paymentMethod" type="hidden" value={method} />
              {packageTitle ? <input name="packageTitle" type="hidden" value={packageTitle} /> : null}
              {!packageTitle ? (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-white" htmlFor="promoCode">Промокод</label>
                  <div className="mt-2 flex gap-2">
                    <input className="min-h-12 min-w-0 flex-1 rounded-md border border-[var(--line)] bg-black/30 px-4 text-white outline-none transition focus:border-[var(--gold)]" id="promoCode" maxLength={80} name="promoCode" onChange={(event) => setPromoCode(event.target.value)} placeholder="Введите промокод" value={promoCode} />
                    <button className="secondary-button min-h-12 px-4 disabled:cursor-wait disabled:opacity-70" disabled={isPromoPending || !promoCode.trim()} formAction={promoAction} type="submit">{isPromoPending ? "Проверяем…" : "Применить"}</button>
                  </div>
                  {promoState.message ? <p className={`mt-2 text-xs ${appliedPromoAmount ? "text-emerald-300" : "text-red-300"}`}>{promoState.message}</p> : null}
                </div>
              ) : null}
              <label className="mb-4 block text-sm text-[var(--muted)]">
                <span className="mb-2 block font-semibold text-white">Email для получения чека</span>
                <input className="min-h-12 w-full rounded-md border border-[var(--line)] bg-black/30 px-4 text-white outline-none transition focus:border-[var(--gold)]" defaultValue={receiptEmail} maxLength={254} name="receiptEmail" required type="email" />
                <span className="mt-2 block text-xs leading-5">Можно указать другой адрес. Email профиля не изменится.</span>
              </label>
              <button className="primary-button min-h-12 w-full px-8 disabled:cursor-wait disabled:opacity-70" disabled={isPaymentPending} type="submit">{isPaymentPending ? "Переходим к оплате…" : `Оплатить ${payableLabel}`}</button>
              {paymentError ? <p className="mt-3 text-center text-sm text-red-300" role="alert">{paymentError}</p> : null}
              <p className="mt-3 text-center text-xs leading-5 text-[var(--muted)]">После оплаты ссылка для подключения к онлайн-встрече появится в личном кабинете.</p>
            </form>
          </div>
        </section>

        <aside className="gold-card h-fit p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">Ваша запись</p>
          <h2 className="mt-3 text-xl font-semibold text-white">{serviceTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{bookingLabel}</p>
          <div className="mt-5 border-t border-[var(--line)] pt-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-[var(--muted)]">К оплате</span>
              <strong className="text-xl text-[var(--gold-light)]">
                {appliedPromoAmount ? <><span className="mr-2 text-sm font-normal text-[var(--muted)] line-through">{amountLabel}</span>{payableLabel}</> : amountLabel}
              </strong>
            </div>
          </div>
        </aside>
      </div>

      {showLeaveConfirmation ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-md border border-[rgba(232,197,122,0.24)] bg-[#10100f] p-6 text-center shadow-2xl shadow-black sm:p-8">
            <h2 className="font-serif text-2xl leading-tight text-[var(--gold-light)]">Вернуться?</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Вы уверены, что хотите вернуться в «Мои записи» без оплаты? Запись на выбранное время не сохранится.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button className="secondary-button min-h-12 px-5" onClick={() => setShowLeaveConfirmation(false)} type="button">Остаться</button>
              <Link className="primary-button inline-flex min-h-12 items-center justify-center px-5" href="/bookings">Вернуться без сохранения</Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function PaymentOption({ active, children, description, label, onClick }: { active: boolean; children: React.ReactNode; description: string; label: string; onClick: () => void }) {
  return (
    <button aria-pressed={active} className={`flex min-h-24 items-center gap-4 rounded-md border p-4 text-left transition sm:p-5 ${active ? "border-[var(--gold)] bg-[rgba(232,197,122,0.08)]" : "border-[var(--line)] bg-black/20 hover:border-[rgba(232,197,122,0.42)]"}`} onClick={onClick} type="button">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-md bg-[rgba(232,197,122,0.1)] text-[var(--gold-light)]">{children}</span>
      <span className="min-w-0 flex-1"><strong className="block text-base text-white">{label}</strong><span className="mt-1 block text-sm text-[var(--muted)]">{description}</span></span>
      <span className={`size-5 shrink-0 rounded-full border-2 p-1 ${active ? "border-[var(--gold)]" : "border-white/30"}`}><span className={`block size-full rounded-full ${active ? "bg-[var(--gold)]" : ""}`} /></span>
    </button>
  );
}

function CardIcon() { return <svg aria-hidden="true" className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 9.5h19M6 15h4"/></svg>; }

function formatRubles(amount: number) {
  return `${new Intl.NumberFormat("ru-RU").format(amount)} ₽`;
}
