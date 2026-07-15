import type { AppointmentNotification } from "@/lib/appointment-notification";
import { notifyAppointmentSafely as notifyTelegramSafely } from "@/lib/telegram";
import { notifyVkAppointmentSafely } from "@/lib/vk";

export async function notifyAppointmentSafely(notification: AppointmentNotification) {
  await Promise.all([notifyTelegramSafely(notification), notifyVkAppointmentSafely(notification)]);
}
