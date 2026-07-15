import { formatDateTime, psychologistTimeZone } from "@/lib/time";

type AppointmentNotification = {
  clientName: string;
  event: "booked" | "cancelled" | "rescheduled";
  newStartsAt?: Date;
  oldStartsAt?: Date;
  startsAt: Date;
  type: string;
};

export async function sendAppointmentNotification(notification: AppointmentNotification) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) return;

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    body: JSON.stringify({
      chat_id: chatId,
      disable_web_page_preview: true,
      text: buildMessage(notification),
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Telegram API returned ${response.status}`);
  }
}

export async function notifyAppointmentSafely(notification: AppointmentNotification) {
  try {
    await sendAppointmentNotification(notification);
  } catch (error) {
    console.error("Failed to send Telegram appointment notification", error);
  }
}

function buildMessage({ clientName, event, newStartsAt, oldStartsAt, startsAt, type }: AppointmentNotification) {
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
