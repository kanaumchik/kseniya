import { formatDateTime, psychologistTimeZone } from "@/lib/time";

export type AppointmentNotification = {
  clientName: string;
  event: "booked" | "cancelled" | "rescheduled";
  newStartsAt?: Date;
  oldStartsAt?: Date;
  startsAt: Date;
  type: string;
};

export function buildAppointmentMessage({ clientName, event, newStartsAt, oldStartsAt, startsAt, type }: AppointmentNotification) {
  const appointmentType = type === "SESSION" ? "Сессия" : "Диагностика";

  if (event === "rescheduled" && oldStartsAt && newStartsAt) {
    return [
      "🔄 Перенос записи",
      `Клиент: ${clientName}`,
      `Тип: ${appointmentType}`,
      `Было: ${formatDateTime(oldStartsAt, psychologistTimeZone)}`,
      `Стало: ${formatDateTime(newStartsAt, psychologistTimeZone)}`,
    ].join("\n");
  }

  const title = event === "booked" ? "✅ Новая запись" : "❌ Отмена записи";
  return [title, `Клиент: ${clientName}`, `Тип: ${appointmentType}`, `Дата: ${formatDateTime(startsAt, psychologistTimeZone)}`].join("\n");
}
