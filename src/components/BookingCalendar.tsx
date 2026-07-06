"use client";

import { useMemo, useState } from "react";
import {
  adminCreateBookingAction,
  createBookingAction,
  updateDayDurationAction,
} from "@/app/actions";
import { allowedSlotDurations, type Slot, groupSlotsByDate } from "@/lib/slots";
import { formatTimeRange } from "@/lib/time";

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
  year: number;
  month: number;
};

export function BookingCalendar({ slots, role, timeZone, users = [], year, month }: BookingCalendarProps) {
  const groupedSlots = useMemo(() => groupSlotsByDate(slots, timeZone), [slots, timeZone]);
  const days = Object.entries(groupedSlots);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-[var(--gold-light)]">Календарь консультаций</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Время показано в часовом поясе: {timeZone}</p>
        </div>
        {role === "ADMIN" ? <MonthPicker month={month} year={year} /> : null}
      </div>

      {days.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {days.map(([date, daySlots]) => (
            <article className="gold-card p-4" key={date}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-white">{formatDateLabel(date)}</h3>
                {role === "ADMIN" ? <DayDurationForm dateKey={daySlots[0].dateKey} value={daySlots[0].durationMinutes} /> : null}
              </div>
              <div className="mt-3 grid gap-2">
                {daySlots.map((slot) => (
                  <SlotRow key={slot.id} role={role} slot={slot} timeZone={timeZone} users={users} />
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="gold-card p-5 text-sm text-[var(--muted)]">
          Свободных слотов сейчас нет.
        </div>
      )}
    </section>
  );
}

function SlotRow({
  slot,
  role,
  timeZone,
  users,
}: {
  slot: Slot;
  role: "USER" | "ADMIN";
  timeZone: string;
  users: UserOption[];
}) {
  const startsAt = new Date(slot.startsAt);
  const endsAt = new Date(slot.endsAt);

  return (
    <div className="flex min-h-16 flex-col gap-3 rounded-md border border-[var(--line)] bg-[rgba(255,255,255,0.03)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-white">{formatTimeRange(startsAt, endsAt, timeZone)}</p>
        <p className={slot.isBooked ? "text-xs text-[var(--danger)]" : "text-xs text-[var(--gold)]"}>
          {slot.isBooked ? "Занято" : "Свободно"}
        </p>
        {role === "ADMIN" && slot.bookedBy ? <p className="mt-1 text-xs text-[var(--muted)]">{slot.bookedBy}</p> : null}
      </div>

      {role === "USER" && !slot.isBooked ? (
        <form action={createBookingAction}>
          <input name="startsAt" type="hidden" value={slot.startsAt} />
          <input name="endsAt" type="hidden" value={slot.endsAt} />
          <button className="primary-button w-full px-3 py-2 text-sm sm:w-auto" type="submit">
            Выбрать
          </button>
        </form>
      ) : null}

      {role === "ADMIN" && !slot.isBooked ? (
        <form action={adminCreateBookingAction} className="grid gap-2 sm:min-w-56">
          <input name="startsAt" type="hidden" value={slot.startsAt} />
          <input name="endsAt" type="hidden" value={slot.endsAt} />
          <select className="field text-sm" name="userId" required>
            <option value="">Пользователь</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <button className="primary-button px-3 py-2 text-sm" type="submit">
            Забронировать
          </button>
        </form>
      ) : null}
    </div>
  );
}

function DayDurationForm({ dateKey, value }: { dateKey: string; value: number }) {
  return (
    <form action={updateDayDurationAction} className="flex items-center gap-2">
      <input name="dateKey" type="hidden" value={dateKey} />
      <select className="field h-9 text-xs" defaultValue={value} name="durationMinutes" aria-label="Длительность консультации">
        {allowedSlotDurations.map((duration) => (
          <option key={duration} value={duration}>
            {duration / 60 === 1.5 ? "1,5 часа" : `${duration / 60} ч`}
          </option>
        ))}
      </select>
      <button className="secondary-button h-9 px-3 text-xs" type="submit">
        OK
      </button>
    </form>
  );
}

function MonthPicker({ year, month }: { year: number; month: number }) {
  const [value, setValue] = useState(`${year}-${String(month).padStart(2, "0")}`);

  function updateMonth(nextValue: string) {
    setValue(nextValue);
    const url = new URL(window.location.href);
    const [nextYear, nextMonth] = nextValue.split("-");
    url.searchParams.set("year", nextYear);
    url.searchParams.set("month", nextMonth);
    window.location.href = url.toString();
  }

  return (
    <label className="text-sm font-medium text-white">
      Месяц и год
      <input className="field ml-3" onChange={(event) => updateMonth(event.target.value)} type="month" value={value} />
    </label>
  );
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
