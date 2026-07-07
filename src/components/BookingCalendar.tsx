"use client";

import { useMemo, useState } from "react";
import { adminCreateBookingAction, createBookingAction, rescheduleBookingAction } from "@/app/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { type Slot, groupSlotsByDate } from "@/lib/slots";
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
  bookingType?: "DIAGNOSTIC" | "SESSION";
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
  rescheduleBookingId,
  rescheduleFromLabel,
  submitLabel = rescheduleBookingId ? "Перенести" : "Выбрать",
}: BookingCalendarProps) {
  const [selectedTimeZone, setSelectedTimeZone] = useState(timeZone);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState(currentUser?.id ?? users[0]?.id ?? "");
  const [pendingSlot, setPendingSlot] = useState<Slot | null>(null);
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
  const selectedUser = userOptions.find((user) => user.id === selectedUserId) ?? currentUser;
  const action = rescheduleBookingId ? rescheduleBookingAction : role === "ADMIN" ? adminCreateBookingAction : createBookingAction;
  const pendingDateKey = pendingSlot ? formatSlotDateKey(pendingSlot.startsAt, selectedTimeZone) : "";
  const pendingDateLabel = pendingDateKey ? formatDateLabel(pendingDateKey) : "";
  const pendingTimeLabel = pendingSlot ? formatTimeOnly(new Date(pendingSlot.startsAt), selectedTimeZone) : "";
  const durationLabel = bookingType === "SESSION" ? "90 минут" : "50 минут";
  const appointmentTypeLabel = bookingType === "SESSION" ? "Сессия" : "Диагностика";

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-end gap-3">
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
              {days.map(([date]) => (
                <button
                  className={selectedDate === date ? "calendar-date calendar-date-active" : "calendar-date"}
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  type="button"
                >
                  <span>{formatDateLabel(date)}</span>
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
              <div className="mt-3 grid gap-2">
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

      {pendingSlot ? (
        <ConfirmDialog
          action={action}
          eyebrow={rescheduleBookingId ? "Перенос записи" : "Новая запись"}
          hiddenFields={[
            ...(rescheduleBookingId ? [{ name: "bookingId", value: rescheduleBookingId }] : []),
            { name: "startsAt", value: pendingSlot.startsAt },
            { name: "endsAt", value: pendingSlot.endsAt },
            { name: "timeZone", value: selectedTimeZone },
            ...(!rescheduleBookingId ? [{ name: "type", value: bookingType }] : []),
            ...(role === "ADMIN" && !rescheduleBookingId ? [{ name: "userId", value: selectedUserId || currentUser?.id }] : []),
          ]}
          onSecondary={() => setPendingSlot(null)}
          primaryLabel={rescheduleBookingId ? "Перенести запись" : "Подтвердить запись"}
          secondaryLabel="Вернуться к выбору"
          title={rescheduleBookingId ? "Подтвердите перенос" : "Подтвердите дату и время"}
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

            <div className="grid gap-2 border-t border-[var(--line)] pt-3 text-sm text-[var(--muted)] sm:grid-cols-2">
              <p>
                <span className="text-white/72">Формат:</span> {appointmentTypeLabel}
              </p>
              <p>
                <span className="text-white/72">Длительность:</span> {durationLabel}
              </p>
              {role === "ADMIN" && !rescheduleBookingId && selectedUser ? (
                <p className="sm:col-span-2">
                  <span className="text-white/72">Клиент:</span> {selectedUser.name}
                </p>
              ) : null}
            </div>
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
  return (
    <button className="secondary-button flex w-full items-center justify-between px-3 py-2 text-sm" type="button" onClick={onSelect}>
      <span>{formatTimeOnly(new Date(slot.startsAt), selectedTimeZone)}</span>
      <span className="text-[var(--gold-light)]">{submitLabel}</span>
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
