"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  adminCreateBookingAction,
  cancelBookingAction,
  cancelDayOffAction,
  createCustomSlotAction,
  createDayOffAction,
  hideSlotAction,
  updateDayOffAction,
} from "@/app/actions";
import { BookingCalendar } from "@/components/BookingCalendar";
import { BookingModal } from "@/components/BookingModal";
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
  const groupedSlots = useMemo(() => groupSlots(slots, selectedTimeZone), [slots, selectedTimeZone]);
  const dateKeys = Object.keys(groupedSlots).sort();
  const visibleDateKeys = view === "day" ? dateKeys.slice(0, 1) : dateKeys;
  const timeLabels = Array.from(new Set(slots.map((slot) => formatTimeOnly(new Date(slot.startsAt), selectedTimeZone)))).sort();
  const filteredUsers = users.filter((user) => {
    const haystack = `${user.name} ${user.email} ${user.phone}`.toLowerCase();
    return haystack.includes(clientQuery.toLowerCase());
  });
  const period = getPeriodNavigation(year, month, day, view);

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[var(--gold-light)]">Мое расписание</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Неделя открывается с понедельника, текущий день выделен сильнее.</p>
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
        <div className="flex flex-wrap gap-2">
          <Link className="secondary-button px-4 py-2 text-sm" href={period.prev}>
            Назад
          </Link>
          <Link className="secondary-button px-4 py-2 text-sm" href={period.today}>
            Сегодня
          </Link>
          <Link className="secondary-button px-4 py-2 text-sm" href={period.next}>
            Вперёд
          </Link>
        </div>
      </div>

      <NewSlotPanel />
      <DayOffPanel dayOffs={dayOffs} />

      <div className="overflow-x-auto rounded-md border border-[var(--line)] bg-[var(--surface)]">
        <div
          className="grid min-w-[920px]"
          style={{
            gridTemplateColumns: `5.5rem repeat(${visibleDateKeys.length}, minmax(8.5rem, 1fr))`,
          }}
        >
          <div className="border-b border-r border-[var(--line)] bg-black/24 p-3 text-xs uppercase text-[var(--muted)]">Время</div>
          {visibleDateKeys.map((dateKey) => (
            <div className={isToday(dateKey) ? "border-b border-r border-[var(--line)] bg-[rgba(232,197,122,0.1)] p-3" : "border-b border-r border-[var(--line)] p-3"} key={dateKey}>
              <p className="font-serif text-lg text-[var(--gold-light)]">{formatDateLabel(dateKey)}</p>
            </div>
          ))}

          {timeLabels.map((timeLabel) => (
            <div className="contents" key={timeLabel}>
              <div className="border-r border-t border-[var(--line)] bg-black/18 p-3 text-sm text-[var(--muted)]">{timeLabel}</div>
              {visibleDateKeys.map((dateKey) => {
                const slot = groupedSlots[dateKey]?.find((candidate) => formatTimeOnly(new Date(candidate.startsAt), selectedTimeZone) === timeLabel);

                return (
                  <div className="min-h-24 border-r border-t border-[var(--line)] p-2" key={`${dateKey}-${timeLabel}`}>
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
                        <span className="text-xs font-semibold">{formatTimeRangeText(slot, selectedTimeZone)}</span>
                        <span className="mt-1 block text-left text-sm">{getSlotTitle(slot)}</span>
                        {slot.packageTitle ? <span className="mt-1 block text-left text-[0.68rem] text-[var(--gold-light)]">{slot.packageTitle}</span> : null}
                        {slot.bookedUserId ? (
                          <Link
                            className="mt-1 block text-left text-xs text-[var(--gold-light)] hover:text-[var(--gold)]"
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

            {!selectedSlot.isBooked && !selectedSlot.isDayOff ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <form
                  action={hideSlotAction}
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
                <button className="primary-button px-4 py-2 text-sm" type="button" onClick={() => setBookingSlot(selectedSlot)}>
                  Записать клиента
                </button>
              </div>
            ) : null}

            {selectedSlot.isBooked && selectedSlot.bookingId ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <form
                  action={cancelBookingAction}
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
              action={adminCreateBookingAction}
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
      <summary className="cursor-pointer font-semibold text-white">Новый слот</summary>
      <form action={createCustomSlotAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="grid gap-2 text-sm font-medium text-white/86">
          Дата
          <input className="field" name="dateKey" type="date" min={new Date().toISOString().slice(0, 10)} required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-white/86">
          Время
          <input className="field" name="time" type="time" required />
        </label>
        <button className="primary-button self-end px-5 py-3 text-sm" type="submit">
          Создать
        </button>
      </form>
    </details>
  );
}

function DayOffPanel({ dayOffs }: { dayOffs: { id: string; dateKey: string }[] }) {
  const now = new Date();
  const dateKeys = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(now.getTime() + index * 24 * 60 * 60 * 1000);
    return formatDateKey(date, "Asia/Yekaterinburg");
  });

  return (
    <details className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
      <summary className="cursor-pointer font-semibold text-white">Day off</summary>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <form
          action={createDayOffAction}
          className="grid gap-3"
          onSubmit={(event) => {
            if (!window.confirm("Вы уверены, что хотите назначить day off?")) {
              event.preventDefault();
            }
          }}
        >
          <h2 className="text-sm font-semibold text-white">Выберите дни</h2>
          <div className="grid grid-cols-7 gap-1 rounded-md border border-[var(--line)] bg-black/20 p-2">
            {dateKeys.map((dateKey) => (
              <label className="grid cursor-pointer gap-1 rounded border border-white/[0.06] px-2 py-2 text-center text-xs text-white/76 transition hover:border-[var(--gold)]" key={dateKey}>
                <input className="mx-auto accent-[var(--gold)]" name="dateKeys" type="checkbox" value={dateKey} />
                <span>{formatDayNumber(dateKey)}</span>
              </label>
            ))}
          </div>
          <button className="primary-button w-fit px-4 py-2 text-sm" type="submit">
            Подтвердить
          </button>
        </form>

        <div>
          <h2 className="text-sm font-semibold text-white">Запланированные</h2>
          <div className="mt-3 grid gap-2">
            {dayOffs.length > 0 ? (
              dayOffs.map((dayOff) => (
                <div className="grid gap-2 rounded-md border border-[var(--line)] px-3 py-2" key={dayOff.id}>
                  <span className="text-sm text-white/76">{formatDateLabel(dayOff.dateKey)}</span>
                  <div className="flex flex-wrap gap-2">
                    <form
                      action={updateDayOffAction}
                      className="flex flex-wrap gap-2"
                      onSubmit={(event) => {
                        if (!window.confirm("Вы уверены, что хотите изменить day off?")) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input name="dayOffId" type="hidden" value={dayOff.id} />
                      <input className="field min-h-10 py-2 text-sm" name="dateKey" type="date" min={new Date().toISOString().slice(0, 10)} required />
                      <button className="secondary-button px-3 py-2 text-xs" type="submit">
                        Изменить
                      </button>
                    </form>
                    <form
                      action={cancelDayOffAction}
                      onSubmit={(event) => {
                        if (!window.confirm("Вы уверены, что хотите удалить day off?")) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input name="dateKey" type="hidden" value={dayOff.dateKey} />
                      <button className="secondary-button px-3 py-2 text-xs" type="submit">
                        Отменить
                      </button>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">Запланированных day off пока нет.</p>
            )}
          </div>
        </div>
      </div>
    </details>
  );
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
  const base = "block h-full w-full rounded-md border px-3 py-2 text-left transition hover:border-[var(--gold)]";

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
    return slot.bookingType === "SESSION" ? "Сессия" : slot.diagnosticNumber ? `Диагностика Д${slot.diagnosticNumber}` : "Диагностика";
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

function formatDayNumber(dateKey: string) {
  const [, , day] = dateKey.split("-");
  return day;
}

function isToday(dateKey: string) {
  return dateKey === formatDateKey(new Date(), "Asia/Yekaterinburg");
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
