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
export const adminSlotDurationMinutes = 60;
export const clientSlotStepMinutes = 60;
export const diagnosticDurationMinutes = 60;
export const sessionDurationMinutes = 90;
export const userBookingWindowDays = 14;
export const allowedSlotDurations = [60, 90, 120, 180] as const;
export const bookingDurations = {
  DIAGNOSTIC: diagnosticDurationMinutes,
  SESSION: sessionDurationMinutes,
} as const;

export type BookingType = keyof typeof bookingDurations;

type BookingWithUser = {
  id: number;
  startsAt: Date;
  endsAt: Date;
  type: string;
  diagnosticNumber: number | null;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
};

export type Slot = {
  id: string;
  dateKey: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  isBooked: boolean;
  isBlocked: boolean;
  isDayOff: boolean;
  bookingId?: string;
  bookingType?: string;
  diagnosticNumber?: number | null;
  bookedUserId?: string;
  bookedBy?: string;
  bookedByEmail?: string;
  bookedByPhone?: string | null;
  availableBookingTypes?: BookingType[];
};

export async function getSlotsForMonth(year: number, month: number, options: { admin?: boolean } = {}) {
  const dateKeys = getMonthDateKeys(year, month);
  return getSlotsForDateKeys(dateKeys, options);
}

export async function getClientSlots() {
  const now = new Date();
  const latestStart = addDays(now, userBookingWindowDays);
  const todayKey = formatDateKey(now, psychologistTimeZone);
  const firstDateKey = formatDateKey(addDays(now, 1), psychologistTimeZone);
  const lastDateKey = formatDateKey(addDays(latestStart, 1), psychologistTimeZone);
  const slots = await getSlotsForDateKeys(getDateKeysBetween(firstDateKey, lastDateKey), {
    availabilityDurations: bookingDurations,
    slotDurationMinutes: clientSlotStepMinutes,
  });

  return slots.filter((slot) => {
    const startsAt = new Date(slot.startsAt);
    return (
      slot.dateKey !== todayKey &&
      startsAt > now &&
      startsAt <= latestStart &&
      (slot.availableBookingTypes?.length ?? 0) > 0 &&
      !slot.isBlocked &&
      !slot.isDayOff
    );
  });
}

export async function isGeneratedSlot(startsAt: Date, endsAt: Date, options: { admin?: boolean } = {}) {
  const customSlot = await prisma.customSlot.findUnique({ where: { startsAt } });

  if (customSlot && customSlot.endsAt.toISOString() === endsAt.toISOString()) {
    return true;
  }

  const dateKey = formatDateKey(startsAt, psychologistTimeZone);
  const durationMinutes = Math.round((endsAt.getTime() - startsAt.getTime()) / 60000);
  const slotStepMinutes = options.admin ? adminSlotDurationMinutes : clientSlotStepMinutes;
  const slots = buildSlotsForDateKey(dateKey, slotStepMinutes, [], new Set(), new Set());
  const workdayEnd = makeZonedDateFromKey(dateKey, workdayEndHour, psychologistTimeZone);

  return slots.some((slot) => slot.startsAt === startsAt.toISOString()) && [diagnosticDurationMinutes, sessionDurationMinutes].includes(durationMinutes) && endsAt <= workdayEnd;
}

export function isWithinUserBookingWindow(startsAt: Date) {
  const now = new Date();
  const latestStart = addDays(now, userBookingWindowDays);
  const startsAtDateKey = formatDateKey(startsAt, psychologistTimeZone);
  const todayKey = formatDateKey(now, psychologistTimeZone);

  return startsAtDateKey !== todayKey && startsAt > now && startsAt <= latestStart;
}

export async function getActiveSlotConflict(startsAt: Date, endsAt: Date, excludeBookingId?: number) {
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

export function getDateKeysForAdminView(year: number, month: number, view: "month" | "week" | "day", day?: number) {
  if (view === "month") {
    return getMonthDateKeys(year, month);
  }

  const targetDay = day ?? 1;
  const target = new Date(Date.UTC(year, month - 1, targetDay));

  if (view === "day") {
    return [target.toISOString().slice(0, 10)];
  }

  const dayOfWeek = target.getUTCDay() || 7;
  const monday = new Date(target.getTime() - (dayOfWeek - 1) * 24 * 60 * 60 * 1000);

  return Array.from({ length: 7 }, (_, index) => new Date(monday.getTime() + index * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
}

export async function getAdminSlotsForDateKeys(dateKeys: string[]) {
  return getSlotsForDateKeys(dateKeys, { admin: true, availabilityDurations: bookingDurations });
}

async function getSlotsForDateKeys(
  dateKeys: string[],
  options: {
    admin?: boolean;
    availabilityDurations?: Partial<Record<BookingType, number>>;
    slotDurationMinutes?: number;
  } = {},
) {
  if (dateKeys.length === 0) {
    return [];
  }

  const firstDayStart = makeZonedDateFromKey(dateKeys[0], workdayStartHour, psychologistTimeZone);
  const lastDayEnd = makeZonedDateFromKey(dateKeys[dateKeys.length - 1], workdayEndHour, psychologistTimeZone);

  const [bookings, settings, hiddenSlots, dayOffs, customSlots] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: "ACTIVE",
        startsAt: { lt: lastDayEnd },
        endsAt: { gt: firstDayStart },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
    prisma.hiddenSlot.findMany({
      where: { dateKey: { in: dateKeys } },
      select: { startsAt: true, dateKey: true },
    }),
    prisma.dayOff.findMany({
      where: { dateKey: { in: dateKeys } },
      select: { dateKey: true },
    }),
    prisma.customSlot.findMany({
      where: { dateKey: { in: dateKeys } },
      select: { id: true, startsAt: true, endsAt: true, dateKey: true },
    }),
  ]);

  const settingsByDate = new Map(settings.map((setting) => [setting.dateKey, setting.slotDurationMinutes]));
  const hiddenSlotStarts = new Set(hiddenSlots.map((slot) => slot.startsAt.toISOString()));
  const dayOffDateKeys = new Set(dayOffs.map((dayOff) => dayOff.dateKey));

  const generatedSlots = dateKeys.flatMap((dateKey) =>
    buildSlotsForDateKey(
      dateKey,
      options.slotDurationMinutes ?? (options.admin ? adminSlotDurationMinutes : (settingsByDate.get(dateKey) ?? defaultSlotDurationMinutes)),
      bookings,
      hiddenSlotStarts,
      dayOffDateKeys,
      options.availabilityDurations,
    ),
  );
  const generatedStarts = new Set(generatedSlots.map((slot) => slot.startsAt));
  const customVisibleSlots = customSlots
    .filter((slot) => !generatedStarts.has(slot.startsAt.toISOString()))
    .map((slot) => buildCustomSlot(slot, bookings, hiddenSlotStarts, dayOffDateKeys, options.availabilityDurations));

  return [...generatedSlots, ...customVisibleSlots].sort((first, second) => first.startsAt.localeCompare(second.startsAt));
}

function buildCustomSlot(
  customSlot: { id: number; startsAt: Date; endsAt: Date; dateKey: string },
  bookings: BookingWithUser[],
  hiddenSlotStarts: Set<string>,
  dayOffDateKeys: Set<string>,
  availabilityDurations?: Partial<Record<BookingType, number>>,
) {
  const booking = bookings.find((candidate) => customSlot.startsAt < candidate.endsAt && customSlot.endsAt > candidate.startsAt);
  const isBlocked = hiddenSlotStarts.has(customSlot.startsAt.toISOString());
  const durationMinutes = Math.round((customSlot.endsAt.getTime() - customSlot.startsAt.getTime()) / 60000);
  const availableBookingTypes = availabilityDurations
    ? getAvailableBookingTypes(customSlot.startsAt, customSlot.endsAt, bookings, availabilityDurations)
    : undefined;

  return {
    id: String(customSlot.id),
    dateKey: customSlot.dateKey,
    startsAt: customSlot.startsAt.toISOString(),
    endsAt: customSlot.endsAt.toISOString(),
    durationMinutes,
    isBooked: Boolean(booking),
    isBlocked,
    isDayOff: dayOffDateKeys.has(customSlot.dateKey),
    bookingId: booking ? String(booking.id) : undefined,
    bookingType: booking?.type,
    diagnosticNumber: booking?.diagnosticNumber,
    bookedUserId: booking ? String(booking.user.id) : undefined,
    bookedBy: booking ? `${booking.user.name} (${booking.user.email})` : undefined,
    bookedByEmail: booking?.user.email,
    bookedByPhone: booking?.user.phone,
    availableBookingTypes,
  };
}

function buildSlotsForDateKey(
  dateKey: string,
  durationMinutes: number,
  bookings: BookingWithUser[],
  hiddenSlotStarts: Set<string>,
  dayOffDateKeys: Set<string>,
  availabilityDurations?: Partial<Record<BookingType, number>>,
) {
  const slots: Slot[] = [];
  const workdayStart = makeZonedDateFromKey(dateKey, workdayStartHour, psychologistTimeZone);
  const workdayEnd = makeZonedDateFromKey(dateKey, workdayEndHour, psychologistTimeZone);
  const isDayOff = dayOffDateKeys.has(dateKey);

  for (
    let startsAt = workdayStart;
    addMinutes(startsAt, durationMinutes) <= workdayEnd;
    startsAt = addMinutes(startsAt, durationMinutes)
  ) {
    const endsAt = addMinutes(startsAt, durationMinutes);
    const booking = bookings.find((candidate) => startsAt < candidate.endsAt && endsAt > candidate.startsAt);
    const isBlocked = hiddenSlotStarts.has(startsAt.toISOString());
    const availableBookingTypes = availabilityDurations
      ? getAvailableBookingTypes(startsAt, workdayEnd, bookings, availabilityDurations)
      : undefined;

    slots.push({
      id: `${dateKey}-${startsAt.toISOString()}`,
      dateKey,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      durationMinutes,
      isBooked: Boolean(booking),
      isBlocked,
      isDayOff,
      bookingId: booking ? String(booking.id) : undefined,
      bookingType: booking?.type,
      diagnosticNumber: booking?.diagnosticNumber,
      bookedUserId: booking ? String(booking.user.id) : undefined,
      bookedBy: booking ? `${booking.user.name} (${booking.user.email})` : undefined,
      bookedByEmail: booking?.user.email,
      bookedByPhone: booking?.user.phone,
      availableBookingTypes,
    });
  }

  return slots;
}

function getAvailableBookingTypes(
  startsAt: Date,
  workdayEnd: Date,
  bookings: BookingWithUser[],
  availabilityDurations: Partial<Record<BookingType, number>>,
) {
  return (Object.entries(availabilityDurations) as [BookingType, number][])
    .filter(([, durationMinutes]) => {
      const endsAt = addMinutes(startsAt, durationMinutes);

      return endsAt <= workdayEnd && !bookings.some((booking) => startsAt < booking.endsAt && endsAt > booking.startsAt);
    })
    .map(([bookingType]) => bookingType);
}
