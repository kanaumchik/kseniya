import { NextResponse } from "next/server";
import { synchronizePaymentByProviderId } from "@/lib/payment-service";

type YooKassaNotification = {
  event?: string;
  object?: { id?: string };
};

export async function POST(request: Request) {
  let notification: YooKassaNotification;
  try {
    notification = (await request.json()) as YooKassaNotification;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  if (!notification.event?.startsWith("payment.") || !notification.object?.id) {
    return NextResponse.json({ ok: true });
  }

  try {
    // Доверяем не телу webhook, а повторно запрошенному объекту платежа из API YooKassa.
    await synchronizePaymentByProviderId(notification.object.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Ошибка обработки webhook YooKassa:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Не удалось обработать уведомление" }, { status: 500 });
  }
}
