"use client";

import Link from "next/link";
import { useState } from "react";
import { cancelBookingAction } from "@/app/actions";
import { BookingCalendar } from "@/components/BookingCalendar";
import { BookingModal } from "@/components/BookingModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { type Slot } from "@/lib/slots";
import { formatDateTime, formatTimeRange, supportedTimeZones } from "@/lib/time";

const TELEMOST_URL = "https://telemost.360.yandex.ru/j/6430486441";
const JOIN_WINDOW_MS = 10 * 60 * 1000;

export type BookingSummary = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  cancelledAt: string | null;
  type: string;
  diagnosticNumber: number | null;
  rescheduledAt: string | null;
};

type MyBookingsProps = {
  bookings: BookingSummary[];
  availableSlots: Slot[];
  timeZone: string;
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
};

export function MyBookings({ bookings, availableSlots, timeZone, currentUser }: MyBookingsProps) {
  const timeZoneLabel = supportedTimeZones.find((zone) => zone.value === timeZone)?.label ?? timeZone;
  const now = new Date();
  const actualBookings = bookings
    .filter((booking) => booking.status === "ACTIVE" && new Date(booking.endsAt) >= now)
    .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime());
  const archivedBookings = bookings
    .filter((booking) => booking.status !== "ACTIVE" || new Date(booking.endsAt) < now)
    .sort((first, second) => new Date(second.startsAt).getTime() - new Date(first.startsAt).getTime());

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-8">
      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold text-white">Мои записи</h2>
            <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">
              Здесь собраны будущие встречи и история отмененных или прошедших записей.
            </p>
          </div>
          <div className="grid gap-2 text-sm font-medium text-white/86">
            <span>Часовой пояс</span>
            <div className="flex min-h-11 min-w-56 items-center justify-between gap-3 rounded-md border border-[rgba(232,197,122,0.16)] bg-black/28 px-3 py-2">
              <span className="truncate text-sm text-white/86">{timeZoneLabel}</span>
              <Link className="secondary-button inline-flex min-h-8 items-center px-3 py-1 text-xs" href="/profile">
                Изменить
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {actualBookings.length > 0 ? (
            actualBookings.map((booking) => (
              <BookingItem booking={booking} availableSlots={availableSlots} currentUser={currentUser} key={booking.id} timeZone={timeZone} />
            ))
          ) : (
            <p className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-3 text-sm text-[var(--muted)]">
              Актуальных записей пока нет.
            </p>
          )}
        </div>

        <details className="mt-5 rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-3">
          <summary className="cursor-pointer text-sm font-medium text-white">Прошлые и отмененные записи</summary>
          <div className="mt-3 grid gap-2">
            {archivedBookings.length > 0 ? (
              archivedBookings.map((booking) => (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm" key={booking.id}>
                  <div>
                    <p className="font-medium text-white">{formatBookingDate(booking, timeZone)}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{formatBookingType(booking)}</p>
                  </div>
                  <p className="rounded-full border border-white/[0.08] px-2 py-1 text-xs text-[var(--muted)]">
                    {booking.status === "ACTIVE" ? "Прошедшая" : "Отменена"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">Здесь пока пусто</p>
            )}
          </div>
        </details>
      </div>
    </section>
  );
}

function BookingItem({
  booking,
  availableSlots,
  currentUser,
  timeZone,
}: {
  booking: BookingSummary;
  availableSlots: Slot[];
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
  timeZone: string;
}) {
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isJoinNoticeOpen, setIsJoinNoticeOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const startsAt = new Date(booking.startsAt);
  const canChange = startsAt > new Date();
  const timeZoneLabel = supportedTimeZones.find((zone) => zone.value === timeZone)?.label ?? timeZone;

  return (
    <article className="rounded-md border border-[var(--line)] bg-[linear-gradient(135deg,rgba(232,197,122,0.055),rgba(255,255,255,0.025)_42%,rgba(0,0,0,0.12))] px-4 py-4 sm:px-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-[rgba(232,197,122,0.22)] bg-[rgba(232,197,122,0.08)] px-3 py-1 text-xs font-semibold text-[var(--gold-light)]">
            {formatBookingType(booking)}
          </span>
          <p className="mt-4 text-xl font-semibold text-white">{formatDateTime(startsAt, timeZone)}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{booking.type === "SESSION" ? "Продолжительность сессии - 90 минут" : "Продолжительность диагностики - 60 минут"}</p>
        </div>

        {canChange ? (
          <div className="grid gap-3 lg:w-80">
            <div className="flex justify-end">
              <button
                className="w-fit rounded px-1 py-1 text-xs font-medium text-red-300 transition-colors hover:text-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
                type="button"
                onClick={() => setIsCancelConfirmOpen(true)}
              >
                Отменить запись
              </button>
            </div>

            <BookingModal
              buttonClassName="!min-h-16 !w-full !px-6 !py-4 !text-lg"
              buttonLabel="Перенести"
              onOpenChange={setIsRescheduleOpen}
              open={isRescheduleOpen}
              title="Перенос диагностики"
              variant="secondary"
            >
              <p className="mb-4 text-sm text-[var(--muted)]">
                Выберите новую дату. Перед сохранением появится подтверждение переноса.
              </p>
              <BookingCalendar
                currentUser={currentUser}
                bookingType={booking.type === "SESSION" ? "SESSION" : "DIAGNOSTIC"}
                rescheduleBookingId={booking.id}
                role="USER"
                slots={availableSlots}
                submitLabel="Перенести"
                timeZone={timeZone}
                rescheduleFromLabel={formatDateTime(startsAt, timeZone)}
              />
            </BookingModal>

            <button
              className="primary-button inline-flex min-h-16 w-full items-center justify-center px-6 py-4 text-center text-lg"
              type="button"
              onClick={() => {
                if (Date.now() < startsAt.getTime() - JOIN_WINDOW_MS) {
                  setIsJoinNoticeOpen(true);
                  return;
                }

                window.open(TELEMOST_URL, "_blank", "noopener,noreferrer");
              }}
            >
              Подключиться по ссылке
            </button>
          </div>
        ) : null}
      </div>

      {isJoinNoticeOpen ? (
        <ConfirmDialog
          description={
            <>
              Ссылка станет доступна за 10 минут до начала сессии.
              <br />
              Просьба: корректно указать ИМЯ при подключении на встречу
            </>
          }
          onPrimaryClick={() => setIsJoinNoticeOpen(false)}
          onSecondary={() => setIsJoinNoticeOpen(false)}
          primaryLabel="Понятно"
          title="Подключение пока недоступно"
        />
      ) : null}

      {isCancelConfirmOpen ? (
        <ConfirmDialog
          action={cancelBookingAction}
          description="Вы всегда можете перенести встречу на удобное время"
          eyebrow="Отмена записи"
          hiddenFields={[{ name: "bookingId", value: booking.id }]}
          onPrimaryClick={() => {
            setIsCancelConfirmOpen(false);
            setIsRescheduleOpen(true);
          }}
          onSecondary={() => setIsCancelConfirmOpen(false)}
          primaryLabel="Перенести запись"
          secondaryLabel="Отменить запись"
          secondaryFirst
          secondarySubmits
          title="Отменить эту запись?"
        >
          <div className="grid gap-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Запись</p>
              <p className="mt-1 text-lg font-semibold text-white">{formatDateTime(startsAt, timeZone)}</p>
            </div>
            <div className="grid gap-2 border-t border-[var(--line)] pt-3 text-[var(--muted)]">
              <p>
                {formatBookingType(booking)} <span className="text-white/36">·</span> {booking.type === "SESSION" ? "90 минут" : "60 минут"}
              </p>
            </div>
            <p className="border-t border-[var(--line)] pt-3 text-xs leading-5 text-[var(--muted)]/80">
              Время указано для {formatTimeZoneInlineLabel(timeZoneLabel)}
            </p>
          </div>
        </ConfirmDialog>
      ) : null}
    </article>
  );
}

function formatBookingType(booking: BookingSummary) {
  if (booking.type === "SESSION") {
    return "Сессия";
  }

  return "Диагностика";
}

function formatBookingDate(booking: BookingSummary, timeZone: string) {
  const startsAt = new Date(booking.startsAt);
  const endsAt = new Date(booking.endsAt);

  return `${formatDateTime(startsAt, timeZone)}, ${formatTimeRange(startsAt, endsAt, timeZone)}`;
}

function formatTimeZoneInlineLabel(label: string) {
  return label.replace(/^GMT([+-]\d+)\s+/, "GMT$1: ");
}
