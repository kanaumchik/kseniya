"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { getAppHomeUrl } from "@/lib/site-url";
import {
  allowedSlotDurations,
  bookingDurations,
  getActiveSlotConflict,
  isGeneratedSlot,
  isWithinUserBookingWindow,
} from "@/lib/slots";
import { addMinutes, formatDateKey, getTimeZoneForCity, makeZonedDateFromKey, psychologistTimeZone, supportedTimeZones } from "@/lib/time";

export async function loginAction(_previousState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: getAppHomeUrl(),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Неверный email или пароль.";
    }

    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: getAppHomeUrl() });
}

export async function registerAction(_previousState: string | undefined, formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const name = [firstName, lastName].filter(Boolean).join(" ");
  const gender = String(formData.get("gender") ?? "");
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const phone = normalizePhone(formData);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordRepeat = String(formData.get("passwordRepeat") ?? "");
  const consent = String(formData.get("consent") ?? "");
  const timeZone = getTimeZoneForCity(city);

  if (!firstName || !lastName || !gender || !birthDate || !city || !phone || !email || !password || !passwordRepeat) {
    return "Заполните все поля регистрации.";
  }

  if (!["male", "female"].includes(gender)) {
    return "Укажите пол.";
  }

  if (!isValidBirthDate(birthDate)) {
    return "Укажите дату рождения в формате ДД.ММ.ГГГГ.";
  }

  if (!isValidPhone(phone)) {
    return "Укажите телефон в формате +7 (ХХХ)-ХХХ-ХХ-ХХ.";
  }

  if (!email.includes("@")) {
    return "Укажите корректный e-mail.";
  }

  if (password.length < 6 || passwordRepeat.length < 6) {
    return "Пароль должен быть не короче 6 символов.";
  }

  if (password !== passwordRepeat) {
    return "Пароли не совпадают.";
  }

  if (consent !== "accepted") {
    return "Для регистрации нужно принять условия и согласие на обработку персональных данных.";
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return "Пользователь с таким e-mail уже зарегистрирован.";
  }

  await prisma.user.create({
    data: {
      email,
      name,
      gender,
      birthDate,
      city,
      phone,
      passwordHash: await hashPassword(password),
      timeZone,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: getAppHomeUrl(),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Регистрация прошла, но войти автоматически не удалось. Попробуйте войти вручную.";
    }

    throw error;
  }
}

export async function createBookingAction(formData: FormData) {
  const session = await requireSession();
  const userId = getSessionUserId(session);

  if (session.user.role === "ADMIN") {
    throw new Error("Записаться на диагностику может только клиент.");
  }

  const bookingType = normalizeBookingType(String(formData.get("type") ?? "DIAGNOSTIC"));
  const packageTitle = bookingType === "SESSION" ? normalizePackageTitle(formData.get("packageTitle")) : null;
  const selectedSlot = parseSlotDates(formData);
  const startsAt = selectedSlot.startsAt;
  const endsAt = getBookingEnd(startsAt, bookingType);
  await ensureUserSlotCanBeBooked(startsAt, endsAt);
  const clientTimeZone = await getClientTimeZone(userId, formData.get("timeZone"), session.user.timeZone);

  await prisma.booking.create({
    data: {
      userId,
      startsAt,
      endsAt,
      clientTimeZone,
      type: bookingType,
      packageTitle,
      ...(bookingType === "DIAGNOSTIC" ? { diagnosticNumber: await getNextDiagnosticNumber() } : {}),
      status: "ACTIVE",
    },
  });

  revalidateDashboard();
  redirect("/bookings");
}

export async function adminCreateBookingAction(formData: FormData) {
  const session = await requireSession();
  assertAdmin(session.user.role);

  const userId = parseId(formData.get("userId"), "Некорректный ID пользователя.");
  const currentUserId = getSessionUserId(session);
  const bookingType = normalizeBookingType(String(formData.get("type") ?? "DIAGNOSTIC"));
  const packageTitle = bookingType === "SESSION" ? normalizePackageTitle(formData.get("packageTitle")) : null;
  const selectedSlot = parseSlotDates(formData);
  const startsAt = selectedSlot.startsAt;
  const endsAt = getBookingEnd(startsAt, bookingType);

  if (userId === currentUserId) {
    throw new Error("Администратор не может записать сам себя.");
  }

  if (startsAt < new Date()) {
    throw new Error("Нельзя записывать пользователя на прошедшее время.");
  }

  await ensureSlotCanBeBooked(startsAt, endsAt, undefined, { admin: true });
  const fullDurationConflict = await getActiveSlotConflict(startsAt, endsAt);

  if (fullDurationConflict) {
    throw new Error("На выбранное время уже есть запись.");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      id: true,
      timeZone: true,
    },
  });

  if (!user) {
    throw new Error("Пользователь для записи не найден.");
  }

  await prisma.booking.create({
    data: {
      userId: user.id,
      startsAt,
      endsAt,
      clientTimeZone: user.timeZone,
      type: bookingType,
      packageTitle,
      ...(bookingType === "DIAGNOSTIC" ? { diagnosticNumber: await getNextDiagnosticNumber() } : {}),
      status: "ACTIVE",
    },
  });

  revalidateDashboard();
}

export async function cancelBookingAction(formData: FormData) {
  const session = await requireSession();
  const userId = getSessionUserId(session);

  const bookingId = parseId(formData.get("bookingId"), "Некорректный ID записи.");
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      ...(session.user.role === "ADMIN" ? {} : { userId }),
      status: "ACTIVE",
    },
  });

  if (!booking) {
    throw new Error("Активная запись не найдена.");
  }

  if (booking.startsAt <= new Date()) {
    throw new Error("Прошедшую или уже начавшуюся диагностику нельзя отменить.");
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });

  revalidateDashboard();
}

export async function rescheduleBookingAction(formData: FormData) {
  const session = await requireSession();
  const userId = getSessionUserId(session);

  const bookingId = parseId(formData.get("bookingId"), "Некорректный ID записи.");
  const selectedSlot = parseSlotDates(formData);
  const clientTimeZone = await getClientTimeZone(userId, formData.get("timeZone"), session.user.timeZone);

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      ...(session.user.role === "ADMIN" ? {} : { userId }),
      status: "ACTIVE",
    },
  });

  if (!booking) {
    throw new Error("Активная запись для переноса не найдена.");
  }

  const bookingType = normalizeBookingType(booking.type);
  const startsAt = selectedSlot.startsAt;
  const endsAt = getBookingEnd(startsAt, bookingType);

  if (booking.startsAt <= new Date()) {
    throw new Error("Прошедшую или уже начавшуюся диагностику нельзя перенести.");
  }

  if (session.user.role === "ADMIN") {
    await ensureSlotCanBeBooked(startsAt, endsAt, booking.id, { admin: true });
  } else {
    await ensureUserSlotCanBeBooked(startsAt, endsAt, booking.id);
  }

  const fullDurationConflict = await getActiveSlotConflict(startsAt, endsAt, booking.id);

  if (fullDurationConflict) {
    throw new Error("На выбранное время уже есть запись.");
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      startsAt,
      endsAt,
      clientTimeZone,
      rescheduledAt: new Date(),
    },
  });

  revalidateDashboard();

  if (session.user.role !== "ADMIN") {
    redirect("/bookings");
  }
}

export async function updateProfileAction(_previousState: string | undefined, formData: FormData) {
  const session = await requireSession();
  const userId = getSessionUserId(session);
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const name = [firstName, lastName].filter(Boolean).join(" ");
  const gender = String(formData.get("gender") ?? "");
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const phone = normalizePhone(formData);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const timeZone = normalizeTimeZone(String(formData.get("timeZone") ?? getTimeZoneForCity(city)));
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordRepeat = String(formData.get("passwordRepeat") ?? "");
  const photo = formData.get("photo");

  if (!firstName || !lastName || !gender || !birthDate || !city || !phone || !email) {
    return "Заполните все обязательные поля.";
  }

  if (!["male", "female"].includes(gender)) {
    return "Укажите пол.";
  }

  if (!isValidBirthDate(birthDate)) {
    return "Укажите дату рождения в формате ДД.ММ.ГГГГ.";
  }

  if (!isValidPhone(phone)) {
    return "Укажите телефон в формате +7 (ХХХ)-ХХХ-ХХ-ХХ.";
  }

  if (!email.includes("@")) {
    return "Укажите корректный e-mail.";
  }

  if ((password || passwordRepeat) && (password.length < 6 || password !== passwordRepeat)) {
    return "Новый пароль должен быть не короче 6 символов, оба значения должны совпадать.";
  }

  if (password || passwordRepeat) {
    if (!currentPassword) {
      return "Укажите текущий пароль.";
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!currentUser || !(await verifyPassword(currentPassword, currentUser.passwordHash))) {
      return "Текущий пароль указан неверно.";
    }
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      id: { not: userId },
    },
    select: { id: true },
  });

  if (existingUser) {
    return "Пользователь с таким e-mail уже существует.";
  }

  const photoPath = photo instanceof File && photo.size > 0 ? await saveProfilePhoto(userId, photo) : undefined;

  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      name,
      gender,
      birthDate,
      city,
      phone,
      timeZone,
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
      ...(photoPath ? { photoPath } : {}),
    },
  });

  revalidatePath("/profile");
  revalidatePath("/");
  revalidatePath("/dashboard");

  return "Изменения сохранены";
}

export async function hideSlotAction(formData: FormData) {
  const session = await requireSession();
  assertAdmin(session.user.role);
  const { startsAt } = parseSlotDates(formData);
  const dateKey = formatDateKey(startsAt, psychologistTimeZone);

  await prisma.hiddenSlot.upsert({
    where: { startsAt },
    update: { dateKey },
    create: { startsAt, dateKey },
  });

  revalidateDashboard();
  revalidatePath("/dashboard/schedule");
}

export async function createCustomSlotAction(formData: FormData) {
  const session = await requireSession();
  assertAdmin(session.user.role);

  const dateKey = String(formData.get("dateKey") ?? "");
  const time = String(formData.get("time") ?? "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("Укажите дату и время нового слота.");
  }

  const [hour, minute] = time.split(":").map(Number);
  const startsAt = makeZonedDateFromKey(dateKey, hour, psychologistTimeZone, minute);
  const endsAt = addMinutes(startsAt, 60);

  if (startsAt <= new Date()) {
    throw new Error("Нельзя создать слот в прошлом.");
  }

  const dayOff = await prisma.dayOff.findUnique({ where: { dateKey } });

  if (dayOff) {
    throw new Error("На выбранный день назначен day off.");
  }

  const conflict = await getActiveSlotConflict(startsAt, endsAt);

  if (conflict) {
    throw new Error("На выбранное время уже есть запись.");
  }

  await prisma.customSlot.upsert({
    where: { startsAt },
    update: { endsAt, dateKey },
    create: { startsAt, endsAt, dateKey },
  });

  revalidateDashboard();
  revalidatePath("/schedule");
}

export async function restoreSlotAction(formData: FormData) {
  const session = await requireSession();
  assertAdmin(session.user.role);
  const { startsAt } = parseSlotDates(formData);

  await prisma.hiddenSlot.deleteMany({ where: { startsAt } });

  revalidateDashboard();
  revalidatePath("/dashboard/schedule");
}

export async function createDayOffAction(formData: FormData) {
  const session = await requireSession();
  assertAdmin(session.user.role);
  const dateKeys = formData.getAll("dateKeys").map(String).filter((dateKey) => /^\d{4}-\d{2}-\d{2}$/.test(dateKey));

  const conflictDateKeys = await getDayOffConflictDateKeys(dateKeys);

  if (conflictDateKeys.length > 0) {
    redirect(`/schedule?notice=${encodeURIComponent(`Day off не назначен: на ${conflictDateKeys.join(", ")} уже есть запись.`)}`);
  }

  await Promise.all(
    dateKeys.map((dateKey) =>
      prisma.dayOff.upsert({
        where: { dateKey },
        update: {},
        create: { dateKey },
      }),
    ),
  );

  revalidateDashboard();
  revalidatePath("/dashboard/schedule");
  revalidatePath("/schedule");
}

export async function cancelDayOffAction(formData: FormData) {
  const session = await requireSession();
  assertAdmin(session.user.role);
  const dateKey = String(formData.get("dateKey") ?? "");

  await prisma.dayOff.deleteMany({ where: { dateKey } });

  revalidateDashboard();
  revalidatePath("/dashboard/schedule");
  revalidatePath("/schedule");
}

export async function updateDayOffAction(formData: FormData) {
  const session = await requireSession();
  assertAdmin(session.user.role);
  const dayOffId = parseId(formData.get("dayOffId"), "Некорректный ID day off.");
  const dateKey = String(formData.get("dateKey") ?? "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new Error("Укажите новую дату day off.");
  }

  const conflictDateKeys = await getDayOffConflictDateKeys([dateKey]);

  if (conflictDateKeys.length > 0) {
    redirect(`/schedule?notice=${encodeURIComponent(`Day off не изменен: на ${conflictDateKeys.join(", ")} уже есть запись.`)}`);
  }

  await prisma.dayOff.update({
    where: { id: dayOffId },
    data: { dateKey },
  });

  revalidateDashboard();
  revalidatePath("/dashboard/schedule");
  revalidatePath("/schedule");
}

export async function updateDayDurationAction(formData: FormData) {
  const session = await requireSession();
  assertAdmin(session.user.role);

  const dateKey = String(formData.get("dateKey") ?? "");
  const durationMinutes = Number(formData.get("durationMinutes"));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new Error("Некорректная дата настройки.");
  }

  if (!allowedSlotDurations.includes(durationMinutes as (typeof allowedSlotDurations)[number])) {
    throw new Error("Некорректная продолжительность диагностики.");
  }

  await prisma.daySchedule.upsert({
    where: { dateKey },
    update: {
      slotDurationMinutes: durationMinutes,
    },
    create: {
      dateKey,
      slotDurationMinutes: durationMinutes,
    },
  });

  revalidateDashboard();
}

async function requireSession() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return session;
}

function assertAdmin(role: "USER" | "ADMIN") {
  if (role !== "ADMIN") {
    throw new Error("Действие доступно только администратору.");
  }
}

function getSessionUserId(session: Awaited<ReturnType<typeof requireSession>>) {
  return parseId(session.user.id, "Некорректный ID пользователя в сессии.");
}

function parseId(value: FormDataEntryValue | string | null, message: string) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error(message);
  }

  return id;
}

function parseSlotDates(formData: FormData) {
  const slotValue = formData.get("slot");
  const [startsAtValue, endsAtValue] =
    typeof slotValue === "string" && slotValue.includes("|")
      ? slotValue.split("|")
      : [formData.get("startsAt"), formData.get("endsAt")];
  const startsAt = new Date(String(startsAtValue ?? ""));
  const endsAt = new Date(String(endsAtValue ?? ""));

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    throw new Error("Некорректное время диагностики.");
  }

  return { startsAt, endsAt };
}

async function ensureUserSlotCanBeBooked(startsAt: Date, endsAt: Date, excludeBookingId?: number) {
  if (!isWithinUserBookingWindow(startsAt)) {
    throw new Error("Запись доступна только на ближайшие 14 дней и не раньше текущего времени.");
  }

  await ensureSlotCanBeBooked(startsAt, endsAt, excludeBookingId);
}

async function ensureSlotCanBeBooked(startsAt: Date, endsAt: Date, excludeBookingId?: number, options: { admin?: boolean } = {}) {
  if (!(await isGeneratedSlot(startsAt, endsAt, { admin: options.admin }))) {
    throw new Error("Выбранный слот недоступен для записи.");
  }

  const dateKey = formatDateKey(startsAt, psychologistTimeZone);
  const [hiddenSlot, dayOff] = await Promise.all([
    prisma.hiddenSlot.findUnique({ where: { startsAt } }),
    prisma.dayOff.findUnique({ where: { dateKey } }),
  ]);

  if (hiddenSlot || dayOff) {
    throw new Error("Выбранный слот недоступен для записи.");
  }

  const conflict = await getActiveSlotConflict(startsAt, endsAt, excludeBookingId);

  if (conflict) {
    throw new Error("Этот слот уже занят.");
  }
}

function revalidateDashboard() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/schedule");
  revalidatePath("/bookings");
  revalidatePath("/schedule");
  revalidatePath("/history");
  revalidatePath("/clients");
}

function isValidBirthDate(value: string) {
  const match = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19|20)\d{2}$/.exec(value);

  if (!match) {
    return false;
  }

  const [day, month, year] = value.split(".").map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function normalizePhone(formData: FormData) {
  const prefix = String(formData.get("phonePrefix") ?? "+7").trim();
  const local = String(formData.get("phone") ?? "").trim();

  return `${prefix}${local}`;
}

function isValidPhone(value: string) {
  return /^\+(7|375|380|996)\(\d{3}\)-\d{3}-\d{2}-\d{2}$/.test(value);
}

async function getNextDiagnosticNumber() {
  const lastDiagnostic = await prisma.booking.findFirst({
    orderBy: { diagnosticNumber: "desc" },
    select: { diagnosticNumber: true },
    where: { diagnosticNumber: { not: null } },
  });

  return (lastDiagnostic?.diagnosticNumber ?? 0) + 1;
}

function normalizeBookingType(value: string) {
  return value === "SESSION" ? "SESSION" : "DIAGNOSTIC";
}

function normalizePackageTitle(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const title = value.trim();

  return title ? title.slice(0, 160) : null;
}

function getBookingEnd(startsAt: Date, type: string) {
  return addMinutes(startsAt, type === "SESSION" ? bookingDurations.SESSION : bookingDurations.DIAGNOSTIC);
}

async function getDayOffConflictDateKeys(dateKeys: string[]) {
  const uniqueDateKeys = Array.from(new Set(dateKeys.filter((dateKey) => /^\d{4}-\d{2}-\d{2}$/.test(dateKey))));
  const conflicts: string[] = [];

  for (const dateKey of uniqueDateKeys) {
    const dayStart = makeZonedDateFromKey(dateKey, 0, psychologistTimeZone);
    const nextDayStart = addMinutes(dayStart, 24 * 60);
    const booking = await prisma.booking.findFirst({
      where: {
        status: "ACTIVE",
        startsAt: { lt: nextDayStart },
        endsAt: { gt: dayStart },
      },
      select: { id: true },
    });

    if (booking) {
      conflicts.push(dateKey);
    }
  }

  return conflicts;
}

function normalizeTimeZone(value: string) {
  return supportedTimeZones.some((timeZone) => timeZone.value === value) ? value : psychologistTimeZone;
}

async function getClientTimeZone(userId: number, value: FormDataEntryValue | null, fallback: string) {
  if (typeof value === "string" && value) {
    return normalizeTimeZone(value);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timeZone: true },
  });

  return normalizeTimeZone(user?.timeZone ?? fallback);
}

async function saveProfilePhoto(userId: number, file: File) {
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "profile");
  const fileName = `${userId}-${Date.now()}.${extension}`;
  const filePath = path.join(uploadsDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(filePath, bytes);

  return `/uploads/profile/${fileName}`;
}
