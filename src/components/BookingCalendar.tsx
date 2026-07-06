"use client";

import { useMemo, useState } from "react";
import { adminCreateBookingAction, createBookingAction, rescheduleBookingAction } from "@/app/actions";
import { type Slot, groupSlotsByDate } from "@/lib/slots";
import { formatTimeOnly, supportedTimeZones } from "@/lib/time";

type UserOption = {
  id: string;
  name: string;
  email: string;
};

type BookingCalendarProps = {
  slots: Slot[];
  role: "USER" | "ADMIN";
  timeZone: string;
  users?: UserOption[];
  currentUser?: UserOption;
  rescheduleBookingId?: string;
  submitLabel?: string;
};

export function BookingCalendar({
  slots,
  role,
  timeZone,
  users = [],
  currentUser,
  rescheduleBookingId,
  submitLabel = rescheduleBookingId ? "Перенести" : "Выбрать",
}: BookingCalendarProps) {
  const [selectedTimeZone, setSelectedTimeZone] = useState(timeZone);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState(currentUser?.id ?? users[0]?.id ?? "");
  const availableSlots = useMemo(
    () => slots.filter((slot) => !slot.isBooked && !slot.isBlocked && !slot.isDayOff),
    [slots],
  );
  const groupedSlots = useMemo(() => groupSlotsByDate(availableSlots, selectedTimeZone), [availableSlots, selectedTimeZone]);
  const days = Object.entries(groupedSlots).sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate));
  const currentDaySlots = selectedDate ? groupedSlots[selectedDate] ?? [] : [];
  const userOptions = useMemo(() => {
    const options = currentUser ? [currentUser, ...users] : users;
    const seen = new Set<string>();

    return options.filter((user) => {
      if (seen.has(user.id)) {
        return false;
      }

      seen.add(user.id);
      return true;
    });
  }, [currentUser, users]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-[var(--gold-light)]">Календарь диагностики</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Сначала выберите дату, затем время начала.</p>
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

      {days.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="gold-card p-4">
            <p className="text-sm font-semibold text-white">Доступные даты</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {days.map(([date, daySlots]) => (
                <button
                  className={selectedDate === date ? "calendar-date calendar-date-active" : "calendar-date"}
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  type="button"
                >
                  <span>{formatDateLabel(date)}</span>
                  <span className="text-xs text-[var(--muted)]">{daySlots.length} сл.</span>
                </button>
              ))}
            </div>
          </div>

          <div className="gold-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Доступное время</p>
              {role === "ADMIN" && !rescheduleBookingId ? (
                <label className="grid gap-1 text-xs font-medium text-white/78">
                  Клиент
                  <select className="field min-w-60 text-sm" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} required>
                    {userOptions.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.id === currentUser?.id ? "Для себя" : user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>

            {selectedDate ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {currentDaySlots.map((slot) => (
                  <SlotSubmitButton
                    currentUserId={currentUser?.id}
                    key={slot.id}
                    role={role}
                    selectedTimeZone={selectedTimeZone}
                    selectedUserId={selectedUserId}
                    slot={slot}
                    submitLabel={submitLabel}
                    rescheduleBookingId={rescheduleBookingId}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-md border border-[var(--line)] bg-black/20 px-3 py-4 text-sm text-[var(--muted)]">
                Выберите дату слева, чтобы увидеть доступное время.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="gold-card p-5 text-sm text-[var(--muted)]">Свободных дат сейчас нет.</div>
      )}
    </section>
  );
}

function SlotSubmitButton({
  slot,
  role,
  selectedTimeZone,
  selectedUserId,
  currentUserId,
  submitLabel,
  rescheduleBookingId,
}: {
  slot: Slot;
  role: "USER" | "ADMIN";
  selectedTimeZone: string;
  selectedUserId: string;
  currentUserId: string | undefined;
  submitLabel: string;
  rescheduleBookingId?: string;
}) {
  const action = rescheduleBookingId ? rescheduleBookingAction : role === "ADMIN" ? adminCreateBookingAction : createBookingAction;

  return (
    <form action={action}>
      {rescheduleBookingId ? <input name="bookingId" type="hidden" value={rescheduleBookingId} /> : null}
      <input name="startsAt" type="hidden" value={slot.startsAt} />
      <input name="endsAt" type="hidden" value={slot.endsAt} />
      <input name="timeZone" type="hidden" value={selectedTimeZone} />
      {role === "ADMIN" && !rescheduleBookingId ? <input name="userId" type="hidden" value={selectedUserId || currentUserId} /> : null}
      <button className="secondary-button flex w-full items-center justify-between px-3 py-2 text-sm" type="submit">
        <span>{formatTimeOnly(new Date(slot.startsAt), selectedTimeZone)}</span>
        <span className="text-[var(--gold-light)]">{submitLabel}</span>
      </button>
    </form>
  );
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const dateValue = new Date(Date.UTC(year, month - 1, day));
  const weekday = new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
    timeZone: "UTC",
  }).format(dateValue);
  const readableDate = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(dateValue);

  return `${weekday}, ${readableDate}`;
}
