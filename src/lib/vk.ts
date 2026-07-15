import { randomInt } from "node:crypto";
import { buildAppointmentMessage, type AppointmentNotification } from "@/lib/appointment-notification";

export async function sendVkAppointmentNotification(notification: AppointmentNotification) {
  const token = process.env.VK_GROUP_TOKEN?.trim();
  const recipientIds = (process.env.VK_RECIPIENT_IDS ?? process.env.VK_PEER_ID ?? "714912052")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!token || recipientIds.length === 0) return;

  const message = buildAppointmentMessage(notification);
  await Promise.all(recipientIds.map((peerId) => sendVkMessage(token, peerId, message)));
}

async function sendVkMessage(token: string, peerId: string, message: string) {
  const body = new URLSearchParams({
    access_token: token,
    message,
    peer_id: peerId,
    random_id: String(randomInt(1, 2_147_483_647)),
    v: "5.199",
  });
  const response = await fetch("https://api.vk.com/method/messages.send", {
    body,
    method: "POST",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`VK API returned HTTP ${response.status}`);

  const result = (await response.json()) as { error?: { error_code: number; error_msg: string } };
  if (result.error) throw new Error(`VK API returned ${result.error.error_code}: ${result.error.error_msg}`);
}

export async function notifyVkAppointmentSafely(notification: AppointmentNotification) {
  try {
    await sendVkAppointmentNotification(notification);
  } catch (error) {
    console.error("Failed to send VK appointment notification", error);
  }
}
