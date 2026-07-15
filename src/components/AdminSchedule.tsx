"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  adminCreateBookingAction,
  cancelBookingAction,
  createCustomSlotAction,
  hideSlotAction,
  restoreSlotAction,
  setDayOffsAction,
} from "@/app/actions";
import { BookingCalendar } from "@/components/BookingCalendar";
import { BookingModal } from "@/components/BookingModal";
import { DatePicker } from "@/components/DatePicker";
import { TimePicker } from "@/components/TimePicker";
import { type Slot } from "@/lib/slots";
import { formatDateKey, formatTimeOnly, supportedTimeZones } from "@/lib/time";

type UserOption = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type AdminScheduleProps = {
  availableSlots: Slot[];
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
  day: number;
  dayOffs: { id: string; dateKey: string }[];
  month: number;
  notice: string;
  slots: Slot[];
  timeZone: string;
  users: UserOption[];
  view: "week" | "day";
  year: number;
};

export function AdminSchedule({ availableSlots, currentUser, day, dayOffs, month, notice, slots, timeZone, users, view, year }: AdminScheduleProps) {
  const [selectedTimeZone, setSelectedTimeZone] = useState(timeZone);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
  const [clientQuery, setClientQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const groupedSlots = useMemo(() => groupSlots(slots, selectedTimeZone), [slots, selectedTimeZone]);
  const dateKeys = Object.keys(groupedSlots).sort();
  const visibleDateKeys = view === "day" ? dateKeys.slice(0, 1) : dateKeys;
  const timeLabels = Array.from(new Set(slots.map((slot) => formatTimeOnly(new Date(slot.startsAt), selectedTimeZone)))).sort();
  const filteredUsers = users.filter((user) => {
    const haystack = `${user.name} ${user.email} ${user.phone}`.toLowerCase();
    return haystack.includes(clientQuery.toLowerCase());
  });
  const period = getPeriodNavigation(year, month, day, view);
  const currentDateKey = formatDateKey(currentTime, selectedTimeZone);

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  async function hideSelectedSlot(formData: FormData) {
    await hideSlotAction(formData);
    setSelectedSlot(null);
  }

  async function restoreSelectedSlot(formData: FormData) {
    await restoreSlotAction(formData);
    setSelectedSlot(null);
  }

  async function cancelSelectedBooking(formData: FormData) {
    await cancelBookingAction(formData);
    setSelectedSlot(null);
  }

  async function createSelectedBooking(formData: FormData) {
    await adminCreateBookingAction(formData);
    setBookingSlot(null);
    setSelectedSlot(null);
    setClientQuery("");
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[var(--gold-light)]">Мое расписание</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Календарь записей</p>
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

      {notice ? <div className="rounded-md border border-[var(--danger)]/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">{notice}</div> : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-[var(--surface)] p-3">
        <div className="flex flex-wrap gap-2">
          <ViewLink active={view === "week"} href={`/schedule?view=week&year=${year}&month=${month}&day=${day}`} label="Неделя" />
          <ViewLink active={view === "day"} href={`/schedule?view=day&year=${year}&month=${month}&day=${day}`} label="День" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link aria-label="Назад" className="secondary-button flex size-11 items-center justify-center px-0 py-0 text-2xl" href={period.prev} title="Назад">
            ‹
          </Link>
          <Link className="secondary-button px-4 py-2 text-sm" href={period.today}>
            Сегодня
          </Link>
          <Link aria-label="Вперёд" className="secondary-button flex size-11 items-center justify-center px-0 py-0 text-2xl" href={period.next} title="Вперёд">
            ›
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-[var(--line)] bg-[var(--surface)]">
        <div
          className="grid min-w-[920px]"
          style={{
            gridTemplateColumns: `5.5rem repeat(${visibleDateKeys.length}, minmax(8.5rem, 1fr))`,
          }}
        >
          <div className="border-b border-r border-[var(--line)] bg-black/24 p-3 text-xs uppercase text-[var(--muted)]">Время</div>
          {visibleDateKeys.map((dateKey) => (
            <div className={dateKey === currentDateKey ? "border-b border-r border-t-2 border-[var(--line)] border-t-blue-500 bg-blue-500/[0.1] p-3" : "border-b border-r border-[var(--line)] p-3"} key={dateKey}>
              <p className="font-serif text-lg text-[var(--gold-light)]">{formatDateLabel(dateKey)}</p>
              {dateKey === currentDateKey ? <span className="mt-1 inline-flex rounded-full bg-blue-600 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-white">Сегодня</span> : null}
            </div>
          ))}

          {timeLabels.map((timeLabel) => (
            <div className="contents" key={timeLabel}>
              <div className="border-r border-t border-[var(--line)] bg-black/18 p-3 text-sm text-[var(--muted)]">{timeLabel}</div>
              {visibleDateKeys.map((dateKey) => {
                const slot = groupedSlots[dateKey]?.find((candidate) => formatTimeOnly(new Date(candidate.startsAt), selectedTimeZone) === timeLabel);
                const slotStart = slot ? new Date(slot.startsAt) : null;
                const slotEnd = slot ? new Date(slot.endsAt) : null;
                const showCurrentTime = Boolean(dateKey === currentDateKey && slotStart && slotEnd && currentTime >= slotStart && currentTime < slotEnd);
                const currentTimePosition = showCurrentTime && slotStart && slotEnd
                  ? ((currentTime.getTime() - slotStart.getTime()) / (slotEnd.getTime() - slotStart.getTime())) * 100
                  : 0;

                return (
                  <div className={dateKey === currentDateKey ? "relative min-h-16 border-r border-t border-blue-500/20 bg-blue-500/[0.025] p-1.5" : "relative min-h-16 border-r border-t border-[var(--line)] p-1.5"} key={`${dateKey}-${timeLabel}`}>
                    {showCurrentTime ? (
                      <span className="pointer-events-none absolute inset-x-0 z-20 h-0.5 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]" style={{ top: `${currentTimePosition}%` }}>
                        <span className="absolute -left-1.5 -top-[5px] size-3 rounded-full bg-red-500" />
                      </span>
                    ) : null}
                    {slot ? (
                      <div
                        className={getSlotClassName(slot)}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedSlot(slot)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            setSelectedSlot(slot);
                          }
                        }}
                      >
                        <span className="block text-left text-sm font-semibold">{getSlotTitle(slot)}</span>
                        {slot.bookedUserId ? (
                          <Link
                            className="mt-0.5 block text-left text-xs text-[var(--gold-light)] hover:text-[var(--gold)]"
                            href={`/clients/${slot.bookedUserId}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {slot.bookedBy?.replace(/\s*\(.+\)$/, "")}
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <DayOffPanel dayOffs={dayOffs} />
      <NewSlotPanel />

      {selectedSlot ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl shadow-black">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-serif text-2xl text-[var(--gold-light)]">{getSlotTitle(selectedSlot)}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{formatSlotFullDate(selectedSlot, selectedTimeZone)}</p>
                {selectedSlot.packageTitle ? <p className="mt-2 text-sm text-[var(--gold-light)]">Пакет: {selectedSlot.packageTitle}</p> : null}
              </div>
              <button className="icon-button" type="button" aria-label="Закрыть" onClick={() => setSelectedSlot(null)}>
                ×
              </button>
            </div>

            {selectedSlot.isBlocked && !selectedSlot.isBooked && !selectedSlot.isDayOff && new Date(selectedSlot.endsAt) > new Date() ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <form
                  action={restoreSelectedSlot}
                  onSubmit={(event) => {
                    if (!window.confirm("Вы уверены, что хотите восстановить слот?")) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input name="startsAt" type="hidden" value={selectedSlot.startsAt} />
                  <input name="endsAt" type="hidden" value={selectedSlot.endsAt} />
                  <button className="primary-button px-4 py-2 text-sm" type="submit">
                    Восстановить слот
                  </button>
                </form>
              </div>
            ) : null}

            {!selectedSlot.isBooked && !selectedSlot.isBlocked && !selectedSlot.isDayOff && new Date(selectedSlot.endsAt) > new Date() ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <form
                  action={hideSelectedSlot}
                  onSubmit={(event) => {
                    if (!window.confirm("Вы уверены, что хотите удалить слот?")) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input name="startsAt" type="hidden" value={selectedSlot.startsAt} />
                  <input name="endsAt" type="hidden" value={selectedSlot.endsAt} />
                  <button className="secondary-button px-4 py-2 text-sm" type="submit">
                    Удалить слот
                  </button>
                </form>
                {new Date(selectedSlot.startsAt) > new Date() ? (
                  <button className="primary-button px-4 py-2 text-sm" type="button" onClick={() => setBookingSlot(selectedSlot)}>
                    Записать клиента
                  </button>
                ) : null}
              </div>
            ) : null}

            {selectedSlot.isBooked && selectedSlot.bookingId ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <form
                  action={cancelSelectedBooking}
                  onSubmit={(event) => {
                    if (!window.confirm("Вы уверены, что хотите отменить запись?")) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input name="bookingId" type="hidden" value={selectedSlot.bookingId} />
                  <button className="secondary-button px-4 py-2 text-sm" type="submit">
                    Отменить
                  </button>
                </form>
                <BookingModal buttonLabel="Перенести" title="Перенос записи" variant="nav">
                  <BookingCalendar
                    bookingType={selectedSlot.bookingType === "SESSION" ? "SESSION" : "DIAGNOSTIC"}
                    currentUser={currentUser}
                    rescheduleBookingId={selectedSlot.bookingId}
                    rescheduleFromLabel={formatSlotFullDate(selectedSlot, selectedTimeZone)}
                    role="ADMIN"
                    slots={availableSlots}
                    submitLabel="Перенести"
                    timeZone={selectedTimeZone}
                    users={users}
                  />
                </BookingModal>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {bookingSlot ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl shadow-black">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-serif text-2xl text-[var(--gold-light)]">Записать клиента</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{formatSlotFullDate(bookingSlot, selectedTimeZone)}</p>
              </div>
              <button className="icon-button" type="button" aria-label="Закрыть" onClick={() => setBookingSlot(null)}>
                ×
              </button>
            </div>

            <form
              action={createSelectedBooking}
              className="mt-5 grid gap-4"
              onSubmit={(event) => {
                const form = event.currentTarget;
                const formData = new FormData(form);
                const user = users.find((candidate) => candidate.id === formData.get("userId"));
                const type = formData.get("type") === "SESSION" ? "Сессия" : "Диагностика";

                if (!window.confirm(`Вы уверены, что хотите записать ${user?.name ?? "клиента"} на ${formatDateLabel(bookingSlot.dateKey)} в ${formatTimeOnly(new Date(bookingSlot.startsAt), selectedTimeZone)} на ${type}?`)) {
                  event.preventDefault();
                }
              }}
            >
              <input name="startsAt" type="hidden" value={bookingSlot.startsAt} />
              <input name="endsAt" type="hidden" value={bookingSlot.endsAt} />
              <input name="timeZone" type="hidden" value={selectedTimeZone} />
              <label className="grid gap-2 text-sm font-medium text-white/86">
                Тип
                <select className="field" name="type" defaultValue="DIAGNOSTIC">
                  <option value="DIAGNOSTIC">Диагностика</option>
                  <option value="SESSION">Сессия</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-white/86">
                Поиск клиента
                <input className="field" value={clientQuery} onChange={(event) => setClientQuery(event.target.value)} placeholder="Имя, email или телефон" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-white/86">
                Клиент
                <select className="field" name="userId" required>
                  {filteredUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} · {user.phone || "телефон не указан"} · {user.email}
                    </option>
                  ))}
                </select>
              </label>
              <button className="primary-button w-fit px-5 py-3 text-sm" type="submit" disabled={filteredUsers.length === 0}>
                Записать клиента
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function NewSlotPanel() {
  return (
    <details className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
      <summary className="cursor-pointer font-semibold text-white">Открыть новый слот</summary>
      <form action={createCustomSlotAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="grid gap-2 text-sm font-medium text-white/86">
          Дата
          <DatePicker min={new Date().toISOString().slice(0, 10)} name="dateKey" required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-white/86">
          Время
          <TimePicker name="time" required />
        </label>
        <button className="primary-button self-end px-5 py-3 text-sm" type="submit">
          Создать
        </button>
      </form>
    </details>
  );
}

function DayOffPanel({ dayOffs }: { dayOffs: { id: string; dateKey: string }[] }) {
  const today = formatDateKey(new Date(), "Asia/Yekaterinburg");
  const [visibleMonth, setVisibleMonth] = useState(today.slice(0, 7));
  const [selectedDateKeys, setSelectedDateKeys] = useState(() => new Set(dayOffs.map((dayOff) => dayOff.dateKey)));
  const [year, month] = visibleMonth.split("-").map(Number);
  const calendarDays = useMemo(() => getDayOffCalendarDays(year, month), [month, year]);
  const monthDateKeys = useMemo(() => getMonthDateKeys(year, month), [month, year]);
  const availableYears = Array.from({ length: 11 }, (_, index) => Number(today.slice(0, 4)) + index);
  const firstAvailableMonth = today.slice(0, 7);
  const lastAvailableMonth = `${availableYears[availableYears.length - 1]}-12`;

  function changeMonth(delta: number) {
    const date = new Date(Date.UTC(year, month - 1 + delta, 1));
    setVisibleMonth(date.toISOString().slice(0, 7));
  }

  function toggleDay(dateKey: string) {
    if (dateKey < today) return;
    setSelectedDateKeys((current) => {
      const next = new Set(current);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  }

  return (
    <details className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
      <summary className="cursor-pointer font-semibold text-white">Day off</summary>
      <form
        action={setDayOffsAction}
        className="mx-auto mt-4 grid max-w-xl gap-4"
        onSubmit={(event) => {
          if (!window.confirm("Сохранить рабочие и выходные дни выбранного месяца?")) event.preventDefault();
        }}
      >
        {monthDateKeys.map((dateKey) => <input key={dateKey} name="monthDateKeys" type="hidden" value={dateKey} />)}
        {monthDateKeys.filter((dateKey) => selectedDateKeys.has(dateKey)).map((dateKey) => <input key={dateKey} name="dateKeys" type="hidden" value={dateKey} />)}

        <div className="rounded-3xl border border-slate-200 bg-white p-4 text-slate-950 shadow-xl sm:p-5">
          <div className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3">
            <button aria-label="Предыдущий месяц" className="flex size-12 items-center justify-center rounded-2xl border border-slate-200 text-2xl text-slate-700 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30" disabled={visibleMonth <= firstAvailableMonth} onClick={() => changeMonth(-1)} type="button">‹</button>
            <div className="flex min-w-0 items-center justify-center gap-2">
              <select aria-label="Месяц" className="min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-base font-bold outline-none focus:border-blue-500" value={month} onChange={(event) => setVisibleMonth(`${year}-${String(event.target.value).padStart(2, "0")}`)}>
                {dayOffMonthNames.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
              </select>
              <select aria-label="Год" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-base font-semibold outline-none focus:border-blue-500" value={year} onChange={(event) => setVisibleMonth(`${event.target.value}-${String(month).padStart(2, "0")}`)}>
                {availableYears.map((availableYear) => <option key={availableYear} value={availableYear}>{availableYear}</option>)}
              </select>
            </div>
            <button aria-label="Следующий месяц" className="flex size-12 items-center justify-center rounded-2xl border border-slate-200 text-2xl text-slate-700 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30" disabled={visibleMonth >= lastAvailableMonth} onClick={() => changeMonth(1)} type="button">›</button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center">
            {dayOffWeekDays.map((weekDay) => <span className="py-2 text-sm font-semibold text-slate-400" key={weekDay}>{weekDay}</span>)}
            {calendarDays.map((day) => {
              const isDayOff = selectedDateKeys.has(day.dateKey);
              const isPast = day.dateKey < today;
              return (
                <button
                  aria-label={`${formatDateLabel(day.dateKey)}: ${isDayOff ? "day off" : "рабочий день"}`}
                  className={[
                    "mx-auto flex size-10 items-center justify-center rounded-xl text-sm font-bold transition sm:size-12",
                    day.currentMonth ? "" : "opacity-25",
                    isDayOff ? "bg-slate-400 text-white hover:bg-slate-500" : "bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700",
                    isPast ? "cursor-not-allowed opacity-35" : "",
                  ].join(" ")}
                  disabled={!day.currentMonth || isPast}
                  key={day.dateKey}
                  onClick={() => toggleDay(day.dateKey)}
                  type="button"
                >
                  {day.day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-2"><span className="size-3 rounded bg-blue-600" />Рабочий день</span>
            <span className="flex items-center gap-2"><span className="size-3 rounded bg-slate-400" />Day off</span>
          </div>
        </div>

        <button className="primary-button w-full px-5 py-3 text-sm sm:w-fit" type="submit">Подтвердить</button>
      </form>
    </details>
  );
}

const dayOffMonthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const dayOffWeekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getMonthDateKeys(year: number, month: number) {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: daysInMonth }, (_, index) => `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`);
}

function getDayOffCalendarDays(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const start = new Date(Date.UTC(year, month - 1, 1 - offset));
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getTime() + index * 86400000);
    return { currentMonth: date.getUTCMonth() === month - 1, dateKey: date.toISOString().slice(0, 10), day: date.getUTCDate() };
  });
}

function ViewLink({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Link className={active ? "primary-button px-4 py-2 text-sm" : "secondary-button px-4 py-2 text-sm"} href={href}>
      {label}
    </Link>
  );
}

function groupSlots(slots: Slot[], timeZone: string) {
  return slots.reduce<Record<string, Slot[]>>((accumulator, slot) => {
    const dateKey = formatDateKey(new Date(slot.startsAt), timeZone);
    accumulator[dateKey] ??= [];
    accumulator[dateKey].push(slot);
    return accumulator;
  }, {});
}

function getSlotClassName(slot: Slot) {
  const base = "block h-full min-h-12 w-full rounded-md border px-2.5 py-2 text-left transition hover:border-[var(--gold)]";

  if (slot.isDayOff) {
    return `${base} border-white/[0.08] bg-zinc-900/70 text-zinc-400`;
  }

  if (slot.isBooked) {
    return `${base} border-[rgba(232,197,122,0.28)] bg-[rgba(214,170,79,0.1)] text-white`;
  }

  if (slot.isBlocked) {
    return `${base} border-zinc-700 bg-zinc-950 text-zinc-500`;
  }

  return `${base} border-zinc-600 bg-zinc-800/70 text-zinc-200`;
}

function getSlotTitle(slot: Slot) {
  if (slot.isDayOff) {
    return "Day off";
  }

  if (slot.isBlocked) {
    return "Слот удалён";
  }

  if (slot.isBooked) {
    return slot.bookingType === "SESSION" ? "Сессия" : "Диагностика";
  }

  return "Свободно";
}

function formatTimeRangeText(slot: Slot, timeZone: string) {
  return `${formatTimeOnly(new Date(slot.startsAt), timeZone)} - ${formatTimeOnly(new Date(slot.endsAt), timeZone)}`;
}

function formatSlotFullDate(slot: Slot, timeZone: string) {
  return `${formatDateLabel(formatDateKey(new Date(slot.startsAt), timeZone))}, ${formatTimeRangeText(slot, timeZone)}`;
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function getPeriodNavigation(year: number, month: number, day: number, view: "week" | "day") {
  const current = new Date(Date.UTC(year, month - 1, day));
  const delta = view === "week" ? 7 : 1;
  const prev = new Date(current.getTime() - delta * 24 * 60 * 60 * 1000);
  const next = new Date(current.getTime() + delta * 24 * 60 * 60 * 1000);
  const today = new Date();

  return {
    prev: makeScheduleHref(prev, view),
    next: makeScheduleHref(next, view),
    today: makeScheduleHref(today, view),
  };
}

function makeScheduleHref(date: Date, view: "week" | "day") {
  return `/schedule?view=${view}&year=${date.getUTCFullYear()}&month=${date.getUTCMonth() + 1}&day=${date.getUTCDate()}`;
}
