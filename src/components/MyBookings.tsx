"use client";

import { useState } from "react";
import { cancelBookingAction } from "@/app/actions";
import { BookingCalendar } from "@/components/BookingCalendar";
import { BookingModal } from "@/components/BookingModal";
import { type Slot } from "@/lib/slots";
import { formatDateTime, formatTimeRange, supportedTimeZones } from "@/lib/time";

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
  const [selectedTimeZone, setSelectedTimeZone] = useState(timeZone);
  const now = new Date();
  const actualBookings = bookings
    .filter((booking) => booking.status === "ACTIVE" && new Date(booking.endsAt) >= now)
    .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime());
  const archivedBookings = bookings
    .filter((booking) => booking.status !== "ACTIVE" || new Date(booking.endsAt) < now)
    .sort((first, second) => new Date(second.startsAt).getTime() - new Date(first.startsAt).getTime());

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-8">
      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Мои записи</h2>
          </div>
          <label className="grid gap-2 text-sm font-medium text-white/86">
            Часовой пояс
            <select className="field min-w-64 text-sm" value={selectedTimeZone} onChange={(event) => setSelectedTimeZone(event.target.value)}>
              {supportedTimeZones.map((zone) => (
                <option key={zone.value} value={zone.value}>
                  {zone.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3">
          {actualBookings.length > 0 ? (
            actualBookings.map((booking) => (
              <BookingItem booking={booking} availableSlots={availableSlots} currentUser={currentUser} key={booking.id} timeZone={selectedTimeZone} />
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
                <div className="rounded-md border border-[var(--line)] px-3 py-2 text-sm" key={booking.id}>
                  <p className="font-medium text-white">{formatBookingDate(booking, selectedTimeZone)}</p>
                  <p className="text-xs text-[var(--muted)]">{booking.status === "ACTIVE" ? "Прошедшая" : "Отменена"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">Здесь пока пусто.</p>
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
  const startsAt = new Date(booking.startsAt);
  const endsAt = new Date(booking.endsAt);
  const canChange = startsAt > new Date();

  return (
    <article className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-medium text-white">{formatDateTime(startsAt, timeZone)}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{formatTimeRange(startsAt, endsAt, timeZone)}</p>
          <p className="mt-1 text-xs text-[var(--gold-light)]">{formatBookingType(booking)}</p>
        </div>

        {canChange ? (
          <div className="flex flex-wrap gap-2">
            <button className="secondary-button w-full px-3 py-2 text-sm" type="button" onClick={() => setIsCancelConfirmOpen(true)}>
              Отменить
            </button>

            <BookingModal buttonLabel="Перенести" title="Перенос диагностики" variant="nav">
              <p className="mb-4 text-sm text-[var(--muted)]">
                Выберите новую дату. Перед сохранением появится подтверждение переноса.
              </p>
              <BookingCalendar
                currentUser={currentUser}
                rescheduleBookingId={booking.id}
                role="USER"
                slots={availableSlots}
                submitLabel="Перенести"
                timeZone={timeZone}
                rescheduleFromLabel={formatBookingDate(booking, timeZone)}
              />
            </BookingModal>
          </div>
        ) : null}
      </div>

      {isCancelConfirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl shadow-black">
            <p className="font-serif text-2xl text-[var(--gold-light)]">Вы уверены, что хотите отменить запись?</p>
            <p className="mt-3 text-sm text-[var(--muted)]">{formatBookingDate(booking, timeZone)}</p>
            <form action={cancelBookingAction} className="mt-5 flex flex-wrap gap-3">
              <input name="bookingId" type="hidden" value={booking.id} />
              <button className="primary-button px-5 py-3 text-sm" type="submit">
                Да
              </button>
              <button className="secondary-button px-5 py-3 text-sm" type="button" onClick={() => setIsCancelConfirmOpen(false)}>
                Нет
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function formatBookingType(booking: BookingSummary) {
  if (booking.type === "SESSION") {
    return "Сессия";
  }

  return booking.diagnosticNumber ? `Диагностика Д${booking.diagnosticNumber}` : "Диагностика";
}

function formatBookingDate(booking: BookingSummary, timeZone: string) {
  const startsAt = new Date(booking.startsAt);
  const endsAt = new Date(booking.endsAt);

  return `${formatDateTime(startsAt, timeZone)}, ${formatTimeRange(startsAt, endsAt, timeZone)}`;
}
