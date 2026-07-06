import { cancelBookingAction } from "@/app/actions";
import { BookingCalendar } from "@/components/BookingCalendar";
import { BookingModal } from "@/components/BookingModal";
import { type Slot } from "@/lib/slots";
import { formatDateTime, formatTimeRange } from "@/lib/time";

export type BookingSummary = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  cancelledAt: string | null;
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
            <p className="mt-1 text-sm text-[var(--muted)]">Время показано в часовом поясе: {timeZone}</p>
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
                <div className="rounded-md border border-[var(--line)] px-3 py-2 text-sm" key={booking.id}>
                  <p className="font-medium text-white">{formatBookingDate(booking, timeZone)}</p>
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
  const startsAt = new Date(booking.startsAt);
  const endsAt = new Date(booking.endsAt);
  const canChange = startsAt > new Date();

  return (
    <article className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-medium text-white">{formatDateTime(startsAt, timeZone)}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{formatTimeRange(startsAt, endsAt, timeZone)}</p>
        </div>

        {canChange ? (
          <div className="flex flex-wrap gap-2">
            <form action={cancelBookingAction}>
              <input name="bookingId" type="hidden" value={booking.id} />
              <button className="secondary-button w-full px-3 py-2 text-sm" type="submit">
                Отменить
              </button>
            </form>

            <BookingModal buttonLabel="Перенести" title="Перенос диагностики" variant="nav">
              <BookingCalendar
                currentUser={currentUser}
                rescheduleBookingId={booking.id}
                role="USER"
                slots={availableSlots}
                submitLabel="Перенести"
                timeZone={timeZone}
              />
            </BookingModal>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function formatBookingDate(booking: BookingSummary, timeZone: string) {
  const startsAt = new Date(booking.startsAt);
  const endsAt = new Date(booking.endsAt);

  return `${formatDateTime(startsAt, timeZone)}, ${formatTimeRange(startsAt, endsAt, timeZone)}`;
}
