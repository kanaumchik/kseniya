import "server-only";

import { Buffer } from "node:buffer";

const apiUrl = "https://api.yookassa.ru/v3";

export type YooKassaPayment = {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  paid: boolean;
  amount: { value: string; currency: string };
  confirmation?: { type: string; confirmation_url?: string };
  metadata?: Record<string, string>;
};

export async function createYooKassaPayment({
  amount,
  customerEmail,
  description,
  idempotenceKey,
  metadata,
  paymentMethod,
  returnUrl,
}: {
  amount: number;
  customerEmail: string;
  description: string;
  idempotenceKey: string;
  metadata: Record<string, string>;
  paymentMethod: "bank_card" | "sbp";
  returnUrl: string;
}) {
  return requestYooKassa<YooKassaPayment>("/payments", {
    method: "POST",
    headers: { "Idempotence-Key": idempotenceKey },
    body: JSON.stringify({
      amount: { value: `${amount}.00`, currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: returnUrl },
      description: description.slice(0, 128),
      metadata,
      payment_method_data: { type: paymentMethod },
      receipt: {
        customer: { email: customerEmail },
        items: [
          {
            amount: { value: `${amount}.00`, currency: "RUB" },
            description: description.slice(0, 128),
            payment_mode: "full_payment",
            payment_subject: "service",
            quantity: "1.00",
            vat_code: 1,
          },
        ],
      },
    }),
  });
}

export function getYooKassaPayment(paymentId: string) {
  return requestYooKassa<YooKassaPayment>(`/payments/${encodeURIComponent(paymentId)}`, { method: "GET" });
}

async function requestYooKassa<T>(path: string, init: RequestInit) {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    throw new Error("YooKassa не настроена: отсутствуют переменные окружения.");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const requestId = response.headers.get("x-request-id");
    throw new Error(`YooKassa вернула ошибку ${response.status}${requestId ? ` (request id: ${requestId})` : ""}.`);
  }

  return (await response.json()) as T;
}
