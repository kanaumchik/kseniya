import { prisma } from "@/lib/prisma";
import {
  addDays,
  addMinutes,
  formatDateKey,
  makeZonedDateFromKey,
  psychologistTimeZone,
} from "@/lib/time";

const workdayStartHour = 10;
const workdayEndHour = 22;
export const defaultSlotDurationMinutes = 120;
export const userBookingWindowDays = 14;
export const allowedSlotDurations = [60, 90, 120, 180] as const;

type BookingWithUser = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  user: {
    name: string;
    email: string;
  };
};

export type Slot = {
  id: string;
  dateKey: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  isBooked: boolean;
  bookingId?: string;
  bookedBy?: string;
  bookedByEmail?: string;
};

export async function getSlotsForMonth(year: number, month: number) {
  const dateKeys = getMonthDateKeys(year, month);
  return getSlotsForDateKeys(dateKeys);
}

export async function getClientSlots() {
  const now = new Date();
  const latestStart = addDays(now, userBookingWindowDays);
  const firstDateKey = formatDateKey(now, psychologistTimeZone);
  const lastDateKey = formatDateKey(addDays(latestStart, 1), psychologistTimeZone);
  const slots = await getSlotsForDateKeys(getDateKeysBetween(firstDateKey, lastDateKey));

  return slots.filter((slot) => {
    const startsAt = new Date(slot.startsAt);
    return startsAt >= now && startsAt <= latestStart;
  });
}

export async function isGeneratedSlot(startsAt: Date, endsAt: Date) {
  const dateKey = formatDateKey(startsAt, psychologistTimeZone);
  const durationMinutes = await getSlotDurationForDateKey(dateKey);
  const slots = buildSlotsForDateKey(dateKey, durationMinutes, []);

  return slots.some((slot) => slot.startsAt === startsAt.toISOString() && slot.endsAt === endsAt.toISOString());
}

export function isWithinUserBookingWindow(startsAt: Date) {
  const now = new Date();
  const latestStart = addDays(now, userBookingWindowDays);

  return startsAt >= now && startsAt <= latestStart;
}

export async function getActiveSlotConflict(startsAt: Date, endsAt: Date, excludeBookingId?: string) {
  return prisma.booking.findFirst({
    where: {
      status: "ACTIVE",
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
  });
}

export async function getSlotDurationForDateKey(dateKey: string) {
  const setting = await prisma.daySchedule.findUnique({
    where: { dateKey },
    select: { slotDurationMinutes: true },
  });

  return setting?.slotDurationMinutes ?? defaultSlotDurationMinutes;
}

export function groupSlotsByDate(slots: Slot[], timeZone: string) {
  return slots.reduce<Record<string, Slot[]>>((accumulator, slot) => {
    const dateKey = formatDateKey(new Date(slot.startsAt), timeZone);
    accumulator[dateKey] ??= [];
    accumulator[dateKey].push(slot);
    return accumulator;
  }, {});
}

function getMonthDateKeys(year: number, month: number) {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    return `${year}-${String(month).padStart(2, "0")}-${day}`;
  });
}

function getDateKeysBetween(firstDateKey: string, lastDateKey: string) {
  const dateKeys: string[] = [];
  const [startYear, startMonth, startDay] = firstDateKey.split("-").map(Number);
  const [endYear, endMonth, endDay] = lastDateKey.split("-").map(Number);
  const endTime = Date.UTC(endYear, endMonth - 1, endDay);

  for (
    let currentTime = Date.UTC(startYear, startMonth - 1, startDay);
    currentTime <= endTime;
    currentTime += 24 * 60 * 60 * 1000
  ) {
    dateKeys.push(new Date(currentTime).toISOString().slice(0, 10));
  }

  return dateKeys;
}

async function getSlotsForDateKeys(dateKeys: string[]) {
  if (dateKeys.length === 0) {
    return [];
  }

  const firstDayStart = makeZonedDateFromKey(dateKeys[0], workdayStartHour, psychologistTimeZone);
  const lastDayEnd = makeZonedDateFromKey(dateKeys[dateKeys.length - 1], workdayEndHour, psychologistTimeZone);

  const [bookings, settings] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: "ACTIVE",
        startsAt: { lt: lastDayEnd },
        endsAt: { gt: firstDayStart },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.daySchedule.findMany({
      where: {
        dateKey: { in: dateKeys },
      },
      select: {
        dateKey: true,
        slotDurationMinutes: true,
      },
    }),
  ]);

  const settingsByDate = new Map(settings.map((setting) => [setting.dateKey, setting.slotDurationMinutes]));

  return dateKeys.flatMap((dateKey) =>
    buildSlotsForDateKey(dateKey, settingsByDate.get(dateKey) ?? defaultSlotDurationMinutes, bookings),
  );
}

function buildSlotsForDateKey(dateKey: string, durationMinutes: number, bookings: BookingWithUser[]) {
  const slots: Slot[] = [];
  const workdayStart = makeZonedDateFromKey(dateKey, workdayStartHour, psychologistTimeZone);
  const workdayEnd = makeZonedDateFromKey(dateKey, workdayEndHour, psychologistTimeZone);

  for (
    let startsAt = workdayStart;
    addMinutes(startsAt, durationMinutes) <= workdayEnd;
    startsAt = addMinutes(startsAt, durationMinutes)
  ) {
    const endsAt = addMinutes(startsAt, durationMinutes);
    const booking = bookings.find((candidate) => startsAt < candidate.endsAt && endsAt > candidate.startsAt);

    slots.push({
      id: `${dateKey}-${startsAt.toISOString()}`,
      dateKey,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      durationMinutes,
      isBooked: Boolean(booking),
      bookingId: booking?.id,
      bookedBy: booking ? `${booking.user.name} (${booking.user.email})` : undefined,
      bookedByEmail: booking?.user.email,
    });
  }

  return slots;
}
