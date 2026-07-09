"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { adminCreateBookingAction, createBookingAction, rescheduleBookingAction } from "@/app/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { bookingDurations, type BookingType, type Slot, groupSlotsByDate } from "@/lib/slots";
import { formatTimeOnly, supportedTimeZones } from "@/lib/time";

type UserOption = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

type BookingCalendarProps = {
  slots: Slot[];
  role: "USER" | "ADMIN";
  timeZone: string;
  users?: UserOption[];
  currentUser?: UserOption;
  bookingType?: BookingType;
  packageTitle?: string;
  rescheduleBookingId?: string;
  rescheduleFromLabel?: string;
  submitLabel?: string;
};

export function BookingCalendar({
  slots,
  role,
  timeZone,
  users = [],
  currentUser,
  bookingType = "DIAGNOSTIC",
  packageTitle,
  rescheduleBookingId,
  rescheduleFromLabel,
  submitLabel = rescheduleBookingId ? "Перенести" : "Выбрать",
}: BookingCalendarProps) {
  const selectedTimeZone = timeZone;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState(currentUser?.id ?? users[0]?.id ?? "");
  const [pendingSlot, setPendingSlot] = useState<Slot | null>(null);
  const bookingDurationMinutes = bookingDurations[bookingType];
  const timeZoneLabel = supportedTimeZones.find((zone) => zone.value === selectedTimeZone)?.label ?? selectedTimeZone;
  const availableSlots = useMemo(
    () =>
      slots.filter((slot) => {
        const isAvailableForType = slot.availableBookingTypes ? slot.availableBookingTypes.includes(bookingType) : !slot.isBooked;

        return isAvailableForType && !slot.isBlocked && !slot.isDayOff;
      }),
    [bookingType, slots],
  );
  const groupedSlots = useMemo(() => groupSlotsByDate(availableSlots, selectedTimeZone), [availableSlots, selectedTimeZone]);
  const days = Object.entries(groupedSlots).sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate));
  const availableDateKeys = useMemo(() => new Set(days.map(([date]) => date)), [days]);
  const [visibleMonth, setVisibleMonth] = useState<string | null>(null);
  const currentMonth = visibleMonth ?? selectedDate?.slice(0, 7) ?? days[0]?.[0].slice(0, 7) ?? getCurrentMonthKey();
  const minMonth = days[0]?.[0].slice(0, 7) ?? currentMonth;
  const maxMonth = days[days.length - 1]?.[0].slice(0, 7) ?? currentMonth;
  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
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
  const selectedUser = userOptions.find((user) => user.id === selectedUserId) ?? currentUser;
  const action = rescheduleBookingId ? rescheduleBookingAction : role === "ADMIN" ? adminCreateBookingAction : createBookingAction;
  const pendingDateKey = pendingSlot ? formatSlotDateKey(pendingSlot.startsAt, selectedTimeZone) : "";
  const pendingDateLabel = pendingDateKey ? formatDateLabel(pendingDateKey) : "";
  const pendingTimeLabel = pendingSlot ? formatTimeOnly(new Date(pendingSlot.startsAt), selectedTimeZone) : "";
  const pendingEndsAt = pendingSlot ? addMinutesIso(pendingSlot.startsAt, bookingDurationMinutes) : "";
  const durationLabel = bookingType === "SESSION" ? "90 минут" : "60 минут";
  const appointmentTypeLabel = bookingType === "SESSION" ? "Сессия" : "Диагностика";

  return (
    <section className="space-y-5">
      {days.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-[45fr_55fr]">
          <div className="gold-card p-4">
            <div className="grid gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">Шаг 1</p>
                <p className="mt-1 text-sm font-semibold text-white">Выберите дату</p>
              </div>
              <p className="text-xs leading-5 text-[var(--muted)]">
                Время указано для {formatTimeZoneInlineLabel(timeZoneLabel)} ·{" "}
                <Link className="font-semibold text-[var(--gold-light)] transition hover:text-[var(--gold)]" href="/profile">
                  Изменить
                </Link>
              </p>
            </div>

            <div className="mt-5 rounded-md border border-[var(--line)] bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-white">{formatMonthLabel(currentMonth)}</p>
                <div className="flex gap-2">
                  <button
                    aria-label="Предыдущий месяц"
                    className="icon-button !min-h-9 !min-w-9 text-base"
                    disabled={currentMonth <= minMonth}
                    onClick={() => setVisibleMonth(addMonths(currentMonth, -1))}
                    type="button"
                  >
                    ‹
                  </button>
                  <button
                    aria-label="Следующий месяц"
                    className="icon-button !min-h-9 !min-w-9 text-base"
                    disabled={currentMonth >= maxMonth}
                    onClick={() => setVisibleMonth(addMonths(currentMonth, 1))}
                    type="button"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-y-2 text-center">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((weekday) => (
                  <span className="text-xs font-medium text-white/74" key={weekday}>
                    {weekday}
                  </span>
                ))}

                {calendarDays.map((day) => {
                  const isAvailable = day.isCurrentMonth && availableDateKeys.has(day.dateKey);
                  const isSelected = selectedDate === day.dateKey;

                  return (
                    <button
                      className={[
                        "mx-auto flex size-10 items-center justify-center rounded-full text-sm transition",
                        day.isCurrentMonth ? "text-white/88" : "text-white/30",
                        isAvailable ? "hover:bg-[rgba(232,197,122,0.14)] hover:text-[var(--gold-light)]" : "cursor-default opacity-45",
                        isSelected ? "bg-[var(--gold)] !text-[var(--gold-text)] font-bold" : "",
                      ].join(" ")}
                      disabled={!isAvailable}
                      key={day.dateKey}
                      onClick={() => {
                        setSelectedDate(day.dateKey);
                        setPendingSlot(null);
                      }}
                      type="button"
                    >
                      {day.day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="gold-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">Шаг 2</p>
                <p className="mt-1 text-sm font-semibold text-white">Выберите время</p>
                {selectedDate ? <p className="mt-1 text-xs text-[var(--muted)]">{formatDateLabel(selectedDate)}</p> : null}
              </div>
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
              <div className="mt-4 max-h-64 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                {currentDaySlots.map((slot) => (
                  <SlotSubmitButton
                    key={slot.id}
                    onSelect={() => setPendingSlot(slot)}
                    selectedTimeZone={selectedTimeZone}
                    slot={slot}
                    submitLabel={submitLabel}
                  />
                ))}
                </div>
              </div>
            ) : (
              <p className="mt-3 rounded-md border border-[var(--line)] bg-black/20 px-3 py-4 text-sm text-[var(--muted)]">
                Выберите дату в календаре, чтобы увидеть доступное время.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="gold-card p-5 text-sm text-[var(--muted)]">Свободных дат сейчас нет.</div>
      )}

      {pendingSlot ? (
        <ConfirmDialog
          action={action}
          eyebrow="Шаг 3"
          hiddenFields={[
            ...(rescheduleBookingId ? [{ name: "bookingId", value: rescheduleBookingId }] : []),
            { name: "startsAt", value: pendingSlot.startsAt },
            { name: "endsAt", value: pendingEndsAt },
            { name: "timeZone", value: selectedTimeZone },
            ...(!rescheduleBookingId ? [{ name: "type", value: bookingType }] : []),
            ...(!rescheduleBookingId && bookingType === "SESSION" && packageTitle ? [{ name: "packageTitle", value: packageTitle }] : []),
            ...(role === "ADMIN" && !rescheduleBookingId ? [{ name: "userId", value: selectedUserId || currentUser?.id }] : []),
          ]}
          onSecondary={() => setPendingSlot(null)}
          primaryLabel={rescheduleBookingId ? "Перенести запись" : "Подтвердить запись"}
          secondaryLabel="Выбрать другое время"
          secondaryFirst
          title={rescheduleBookingId ? "Подтвердите дату и время" : "Подтвердите дату и время"}
        >
          <div className="grid gap-4">
            {rescheduleBookingId && rescheduleFromLabel ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Сейчас</p>
                  <p className="mt-1 text-sm leading-6 text-white/86">{rescheduleFromLabel}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Новое время</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {pendingDateLabel}, {pendingTimeLabel}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Выбранное время</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {pendingDateLabel}, {pendingTimeLabel}
                </p>
              </div>
            )}

            <div className="grid gap-2 border-t border-[var(--line)] pt-3 text-sm text-[var(--muted)]">
              <p>
                {appointmentTypeLabel} <span className="text-white/36">·</span> {durationLabel}
              </p>
              {role === "ADMIN" && !rescheduleBookingId && selectedUser ? (
                <p>
                  <span className="text-white/72">Клиент:</span> {selectedUser.name}
                </p>
              ) : null}
            </div>
            <p className="border-t border-[var(--line)] pt-3 text-xs leading-5 text-[var(--muted)]/80">
              Время указано для {formatTimeZoneInlineLabel(timeZoneLabel)}
            </p>
          </div>
        </ConfirmDialog>
      ) : null}
    </section>
  );
}

function SlotSubmitButton({
  slot,
  onSelect,
  selectedTimeZone,
  submitLabel,
}: {
  slot: Slot;
  onSelect: () => void;
  selectedTimeZone: string;
  submitLabel: string;
}) {
  const timeLabel = formatTimeOnly(new Date(slot.startsAt), selectedTimeZone);

  return (
    <button
      aria-label={`${submitLabel}: ${timeLabel}`}
      className="secondary-button flex min-h-12 w-full items-center justify-center px-3 py-2 text-base"
      type="button"
      onClick={onSelect}
    >
      <span>{timeLabel}</span>
    </button>
  );
}

function formatSlotDateKey(value: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(new Date(value));
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";

  return `${year}-${month}-${day}`;
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

function formatTimeZoneInlineLabel(label: string) {
  return label.replace(/^GMT([+-]\d+)\s+/, "GMT$1: ");
}

function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function addMonths(monthKey: string, delta: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));

  return date.toISOString().slice(0, 7);
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const label = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getCalendarDays(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const mondayOffset = (firstDay.getUTCDay() + 6) % 7;
  const firstCalendarDay = new Date(firstDay.getTime() - mondayOffset * 24 * 60 * 60 * 1000);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstCalendarDay.getTime() + index * 24 * 60 * 60 * 1000);
    const dateKey = date.toISOString().slice(0, 10);

    return {
      dateKey,
      day: date.getUTCDate(),
      isCurrentMonth: dateKey.startsWith(monthKey),
    };
  });
}

function addMinutesIso(value: string, minutes: number) {
  return new Date(new Date(value).getTime() + minutes * 60000).toISOString();
}
