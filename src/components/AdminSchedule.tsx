import Link from "next/link";
import {
  adminCreateBookingAction,
  cancelBookingAction,
  cancelDayOffAction,
  createDayOffAction,
  hideSlotAction,
  restoreSlotAction,
} from "@/app/actions";
import { BookingCalendar } from "@/components/BookingCalendar";
import { BookingModal } from "@/components/BookingModal";
import { type Slot } from "@/lib/slots";
import { formatDateKey, formatTimeOnly } from "@/lib/time";

type UserOption = {
  id: string;
  name: string;
  email: string;
};

type AdminScheduleProps = {
  availableSlots: Slot[];
  currentUser: UserOption;
  dayOffs: { id: string; dateKey: string }[];
  month: number;
  slots: Slot[];
  timeZone: string;
  users: UserOption[];
  view: "month" | "week" | "day";
  year: number;
};

export function AdminSchedule({ availableSlots, currentUser, dayOffs, month, slots, timeZone, users, view, year }: AdminScheduleProps) {
  const groupedSlots = groupSlots(slots, timeZone);

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[var(--gold-light)]">Мое расписание</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Время показано в часовом поясе: {timeZone}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ViewLink active={view === "month"} href={`/dashboard/schedule?view=month&year=${year}&month=${month}`} label="Месяц" />
          <ViewLink active={view === "week"} href={`/dashboard/schedule?view=week&year=${year}&month=${month}`} label="Неделя" />
          <ViewLink active={view === "day"} href={`/dashboard/schedule?view=day&year=${year}&month=${month}`} label="День" />
        </div>
      </div>

      <DayOffPanel dayOffs={dayOffs} />

      <div className="grid gap-4">
        {Object.entries(groupedSlots).map(([dateKey, daySlots]) => (
          <article className="gold-card p-4" key={dateKey}>
            <h2 className="font-serif text-xl text-[var(--gold-light)]">{formatDateLabel(dateKey)}</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {daySlots.map((slot) => (
                <AdminSlotRow
                  availableSlots={availableSlots}
                  currentUser={currentUser}
                  key={slot.id}
                  slot={slot}
                  timeZone={timeZone}
                  users={users}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminSlotRow({
  availableSlots,
  currentUser,
  slot,
  timeZone,
  users,
}: {
  availableSlots: Slot[];
  currentUser: UserOption;
  slot: Slot;
  timeZone: string;
  users: UserOption[];
}) {
  const startsAt = new Date(slot.startsAt);
  const isUnavailable = slot.isBooked || slot.isBlocked || slot.isDayOff;

  return (
    <div className="rounded-md border border-[var(--line)] bg-black/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{formatTimeOnly(startsAt, timeZone)}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {slot.isDayOff ? "Day off" : slot.isBlocked ? "Слот скрыт" : slot.isBooked ? "Занято" : "Свободно"}
          </p>
          {slot.bookedBy ? <p className="mt-1 text-xs text-white/66">{slot.bookedBy}</p> : null}
        </div>

        {!slot.isDayOff && !slot.isBooked ? (
          <form action={slot.isBlocked ? restoreSlotAction : hideSlotAction}>
            <input name="startsAt" type="hidden" value={slot.startsAt} />
            <input name="endsAt" type="hidden" value={slot.endsAt} />
            <button className="secondary-button px-3 py-2 text-xs" type="submit">
              {slot.isBlocked ? "Вернуть слот" : "Убрать слот"}
            </button>
          </form>
        ) : null}
      </div>

      {!isUnavailable ? (
        <form action={adminCreateBookingAction} className="mt-3 grid gap-2">
          <input name="startsAt" type="hidden" value={slot.startsAt} />
          <input name="endsAt" type="hidden" value={slot.endsAt} />
          <input name="timeZone" type="hidden" value={timeZone} />
          <select className="field text-sm" name="userId" defaultValue={currentUser.id} required>
            {[currentUser, ...users.filter((user) => user.id !== currentUser.id)].map((user) => (
              <option key={user.id} value={user.id}>
                {user.id === currentUser.id ? "Для себя" : user.name} ({user.email})
              </option>
            ))}
          </select>
          <button className="primary-button px-3 py-2 text-sm" type="submit">
            Записать
          </button>
        </form>
      ) : null}

      {slot.isBooked && slot.bookingId ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <form action={cancelBookingAction}>
            <input name="bookingId" type="hidden" value={slot.bookingId} />
            <button className="secondary-button px-3 py-2 text-xs" type="submit">
              Отменить
            </button>
          </form>
          <BookingModal buttonLabel="Перенести" title="Перенос диагностики" variant="nav">
            <BookingCalendar
              currentUser={currentUser}
              rescheduleBookingId={slot.bookingId}
              role="ADMIN"
              slots={availableSlots}
              submitLabel="Перенести"
              timeZone={timeZone}
              users={users}
            />
          </BookingModal>
        </div>
      ) : null}
    </div>
  );
}

function DayOffPanel({ dayOffs }: { dayOffs: { id: string; dateKey: string }[] }) {
  const now = new Date();
  const dateKeys = Array.from({ length: 45 }, (_, index) => {
    const date = new Date(now.getTime() + (index + 1) * 24 * 60 * 60 * 1000);
    return formatDateKey(date, "Asia/Yekaterinburg");
  });

  return (
    <details className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
      <summary className="cursor-pointer font-semibold text-white">Day off</summary>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-white">Новый</h2>
          <form action={createDayOffAction} className="mt-3 grid gap-3">
            <div className="grid max-h-60 gap-2 overflow-y-auto pr-2 sm:grid-cols-2">
              {dateKeys.map((dateKey) => (
                <label className="flex gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm text-white/76" key={dateKey}>
                  <input className="accent-[var(--gold)]" name="dateKeys" type="checkbox" value={dateKey} />
                  <span>{formatDateLabel(dateKey)}</span>
                </label>
              ))}
            </div>
            <button className="primary-button w-fit px-4 py-2 text-sm" type="submit">
              Подтвердить
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Запланированные</h2>
          <div className="mt-3 grid gap-2">
            {dayOffs.length > 0 ? (
              dayOffs.map((dayOff) => (
                <form action={cancelDayOffAction} className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] px-3 py-2" key={dayOff.id}>
                  <input name="dateKey" type="hidden" value={dayOff.dateKey} />
                  <span className="text-sm text-white/76">{formatDateLabel(dayOff.dateKey)}</span>
                  <button className="secondary-button px-3 py-2 text-xs" type="submit">
                    Отменить
                  </button>
                </form>
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

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
