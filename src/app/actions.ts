"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  allowedSlotDurations,
  getActiveSlotConflict,
  isGeneratedSlot,
  isWithinUserBookingWindow,
} from "@/lib/slots";

export async function loginAction(_previousState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Неверный email или пароль.";
    }

    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function registerAction(_previousState: string | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const gender = String(formData.get("gender") ?? "");
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordRepeat = String(formData.get("passwordRepeat") ?? "");
  const consent = String(formData.get("consent") ?? "");
  const timeZone = String(formData.get("timeZone") ?? "Asia/Yekaterinburg") || "Asia/Yekaterinburg";

  if (!name || !gender || !birthDate || !city || !phone || !email || !password || !passwordRepeat) {
    return "Заполните все поля регистрации.";
  }

  if (!["male", "female"].includes(gender)) {
    return "Укажите пол.";
  }

  if (!isValidBirthDate(birthDate)) {
    return "Укажите дату рождения в формате ДД.ММ.ГГГГ.";
  }

  if (!/^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/.test(phone)) {
    return "Укажите телефон в формате +7(ХХХ)-ХХХ-ХХ-ХХ.";
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
      passwordHash: await hashPassword(password),
      timeZone,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
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
  assertUser(session.user.role);

  const { startsAt, endsAt } = parseSlotDates(formData);
  await ensureUserSlotCanBeBooked(startsAt, endsAt);

  await prisma.booking.create({
    data: {
      userId: session.user.id,
      startsAt,
      endsAt,
      clientTimeZone: session.user.timeZone,
      status: "ACTIVE",
    },
  });

  revalidateDashboard();
}

export async function adminCreateBookingAction(formData: FormData) {
  const session = await requireSession();
  assertAdmin(session.user.role);

  const userId = String(formData.get("userId") ?? "");
  const { startsAt, endsAt } = parseSlotDates(formData);

  if (startsAt < new Date()) {
    throw new Error("Нельзя записывать пользователя на прошедшее время.");
  }

  await ensureSlotCanBeBooked(startsAt, endsAt);

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "USER",
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
      status: "ACTIVE",
    },
  });

  revalidateDashboard();
}

export async function cancelBookingAction(formData: FormData) {
  const session = await requireSession();
  assertUser(session.user.role);

  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: session.user.id,
      status: "ACTIVE",
    },
  });

  if (!booking) {
    throw new Error("Активная запись не найдена.");
  }

  if (booking.startsAt <= new Date()) {
    throw new Error("Прошедшую или уже начавшуюся консультацию нельзя отменить.");
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
  assertUser(session.user.role);

  const bookingId = String(formData.get("bookingId") ?? "");
  const { startsAt, endsAt } = parseSlotDates(formData);

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: session.user.id,
      status: "ACTIVE",
    },
  });

  if (!booking) {
    throw new Error("Активная запись для переноса не найдена.");
  }

  if (booking.startsAt <= new Date()) {
    throw new Error("Прошедшую или уже начавшуюся консультацию нельзя перенести.");
  }

  await ensureUserSlotCanBeBooked(startsAt, endsAt, booking.id);

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      startsAt,
      endsAt,
      clientTimeZone: session.user.timeZone,
    },
  });

  revalidateDashboard();
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
    throw new Error("Некорректная длительность консультации.");
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

function assertUser(role: "USER" | "ADMIN") {
  if (role !== "USER") {
    throw new Error("Действие доступно только пользователю.");
  }
}

function assertAdmin(role: "USER" | "ADMIN") {
  if (role !== "ADMIN") {
    throw new Error("Действие доступно только администратору.");
  }
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
    throw new Error("Некорректное время консультации.");
  }

  return { startsAt, endsAt };
}

async function ensureUserSlotCanBeBooked(startsAt: Date, endsAt: Date, excludeBookingId?: string) {
  if (!isWithinUserBookingWindow(startsAt)) {
    throw new Error("Запись доступна только на ближайшие 14 дней и не раньше текущего времени.");
  }

  await ensureSlotCanBeBooked(startsAt, endsAt, excludeBookingId);
}

async function ensureSlotCanBeBooked(startsAt: Date, endsAt: Date, excludeBookingId?: string) {
  if (!(await isGeneratedSlot(startsAt, endsAt))) {
    throw new Error("Выбранный слот недоступен для записи.");
  }

  const conflict = await getActiveSlotConflict(startsAt, endsAt, excludeBookingId);

  if (conflict) {
    throw new Error("Этот слот уже занят.");
  }
}

function revalidateDashboard() {
  revalidatePath("/dashboard");
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
