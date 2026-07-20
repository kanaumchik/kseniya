import "server-only";

import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { recordConsentEvent } from "@/lib/consent-audit";
import { notifyAppointmentSafely } from "@/lib/notifications";
import { getPaymentOffer } from "@/lib/payment-catalog";
import { prisma } from "@/lib/prisma";
import { getActiveSlotConflict, isGeneratedSlot, isWithinUserBookingWindow, bookingDurations } from "@/lib/slots";
import { addMinutes, formatDateKey, psychologistTimeZone, supportedTimeZones } from "@/lib/time";
import { createYooKassaPayment, getYooKassaPayment, type YooKassaPayment } from "@/lib/yookassa";

export type PaymentMethod = "card" | "sbp";

export async function startPayment({
  clientTimeZone,
  packageTitle,
  paymentMethod,
  startsAt,
  userId,
}: {
  clientTimeZone: string;
  packageTitle?: string;
  paymentMethod: PaymentMethod;
  startsAt: Date;
  userId: number;
}) {
  const endsAt = addMinutes(startsAt, bookingDurations.SESSION);
  await assertSlotAvailable(startsAt, endsAt);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { timeZone: true } });
  if (!user) throw new Error("Пользователь не найден.");

  const timeZone = supportedTimeZones.some((item) => item.value === clientTimeZone) ? clientTimeZone : user.timeZone;
  const offer = getPaymentOffer(packageTitle);
  const idempotenceKey = randomUUID();
  const attempt = await prisma.payment.create({
    data: {
      amount: offer.amount,
      clientTimeZone: timeZone,
      endsAt,
      idempotenceKey,
      packageTitle: offer.packageTitle,
      paymentMethod,
      startsAt,
      userId,
    },
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://kseniyanaumchik.ru").replace(/\/$/, "");

  try {
    const payment = await createYooKassaPayment({
      amount: offer.amount,
      description: offer.title,
      idempotenceKey,
      metadata: { paymentAttemptId: attempt.id, userId: String(userId) },
      paymentMethod: paymentMethod === "card" ? "bank_card" : "sbp",
      returnUrl: `${appUrl}/payment/result?attempt=${attempt.id}`,
    });
    const confirmationUrl = payment.confirmation?.confirmation_url;

    if (!confirmationUrl) throw new Error("YooKassa не вернула ссылку для оплаты.");

    await prisma.payment.update({
      where: { id: attempt.id },
      data: { confirmationUrl, providerPaymentId: payment.id, status: payment.status.toUpperCase() },
    });

    return confirmationUrl;
  } catch (error) {
    await prisma.payment.update({ where: { id: attempt.id }, data: { status: "FAILED" } });
    throw error;
  }
}

export async function synchronizePaymentByAttempt(attemptId: string, userId?: number) {
  const attempt = await prisma.payment.findFirst({
    where: { id: attemptId, ...(userId ? { userId } : {}) },
  });
  if (!attempt?.providerPaymentId) return attempt;

  const providerPayment = await getYooKassaPayment(attempt.providerPaymentId);
  await applyProviderPayment(providerPayment);
  return prisma.payment.findUnique({ where: { id: attempt.id }, include: { booking: true } });
}

export async function synchronizePaymentByProviderId(providerPaymentId: string) {
  const providerPayment = await getYooKassaPayment(providerPaymentId);
  return applyProviderPayment(providerPayment);
}

async function applyProviderPayment(providerPayment: YooKassaPayment) {
  const attempt = await prisma.payment.findUnique({ where: { providerPaymentId: providerPayment.id } });
  if (!attempt) return null;

  if (
    providerPayment.metadata?.paymentAttemptId !== attempt.id ||
    providerPayment.amount.currency !== attempt.currency ||
    providerPayment.amount.value !== `${attempt.amount}.00`
  ) {
    throw new Error("Данные платежа YooKassa не совпадают с заказом.");
  }

  if (providerPayment.status !== "succeeded" || !providerPayment.paid) {
    return prisma.payment.update({
      where: { id: attempt.id },
      data: { status: providerPayment.status.toUpperCase() },
    });
  }

  if (attempt.bookingId) return attempt;

  let finalized;
  try {
    finalized = await prisma.$transaction(
      async (tx) => {
        const current = await tx.payment.findUnique({ where: { id: attempt.id } });
        if (!current || current.bookingId) return current;

        const conflict = await tx.booking.findFirst({
          where: {
            status: "ACTIVE",
            startsAt: { lt: current.endsAt },
            endsAt: { gt: current.startsAt },
          },
        });
        if (conflict) {
          return tx.payment.update({ where: { id: current.id }, data: { status: "PAID_SLOT_CONFLICT" } });
        }

        const booking = await tx.booking.create({
          data: {
            clientTimeZone: current.clientTimeZone,
            endsAt: current.endsAt,
            packageTitle: current.packageTitle,
            startsAt: current.startsAt,
            status: "ACTIVE",
            type: "SESSION",
            userId: current.userId,
          },
        });
        return tx.payment.update({
          where: { id: current.id },
          data: { bookingId: booking.id, status: "SUCCEEDED" },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2034"].includes(error.code)) {
      return prisma.payment.findUnique({ where: { id: attempt.id }, include: { booking: true } });
    }
    throw error;
  }

  if (finalized?.bookingId) {
    const user = await prisma.user.findUnique({ where: { id: finalized.userId }, select: { name: true } });
    await Promise.allSettled([
      recordPaymentConsents(finalized.userId, finalized.bookingId, finalized.clientTimeZone, finalized.packageTitle),
      notifyAppointmentSafely({
        clientName: user?.name ?? "Клиент",
        event: "booked",
        startsAt: finalized.startsAt,
        type: "SESSION",
      }),
    ]);
  }

  return finalized;
}

async function assertSlotAvailable(startsAt: Date, endsAt: Date) {
  if (!isWithinUserBookingWindow(startsAt) || !(await isGeneratedSlot(startsAt, endsAt))) {
    throw new Error("Выбранный слот недоступен для записи.");
  }

  const dateKey = formatDateKey(startsAt, psychologistTimeZone);
  const [hiddenSlot, dayOff, conflict] = await Promise.all([
    prisma.hiddenSlot.findUnique({ where: { startsAt } }),
    prisma.dayOff.findUnique({ where: { dateKey } }),
    getActiveSlotConflict(startsAt, endsAt),
  ]);
  if (hiddenSlot || dayOff || conflict) throw new Error("Этот слот уже занят или недоступен.");
}

async function recordPaymentConsents(userId: number, bookingId: number, timeZone: string, packageTitle: string | null) {
  const common = {
    action: "accepted",
    appointmentId: bookingId,
    bookingKind: "session" as const,
    eventPayload: { packageTitle },
    stage: "payment" as const,
    timezone: timeZone,
    userId,
  };
  await Promise.all([
    recordConsentEvent({ ...common, consentType: "offer_acceptance", documentCode: "offer", checkboxLabel: "Принимаю публичную оферту" }),
    recordConsentEvent({ ...common, consentType: "booking_rules_acceptance", documentCode: "booking_rules", checkboxLabel: "Принимаю правила записи" }),
    recordConsentEvent({ ...common, consentType: "informed_psychological_services", documentCode: "informed_consent", checkboxLabel: "Принимаю информированное согласие" }),
    recordConsentEvent({ ...common, consentType: "special_category_data_processing", documentCode: "special_category_data_consent", checkboxLabel: "Даю согласие на обработку специальных категорий данных" }),
  ]);
}
