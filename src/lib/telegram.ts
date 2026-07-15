import { buildAppointmentMessage, type AppointmentNotification } from "@/lib/appointment-notification";

export async function sendAppointmentNotification(notification: AppointmentNotification) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) return;

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    body: JSON.stringify({
      chat_id: chatId,
      disable_web_page_preview: true,
      text: buildAppointmentMessage(notification),
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`Telegram API returned ${response.status}`);
}

export async function notifyAppointmentSafely(notification: AppointmentNotification) {
  try {
    await sendAppointmentNotification(notification);
  } catch (error) {
    console.error("Failed to send Telegram appointment notification", error);
  }
}
