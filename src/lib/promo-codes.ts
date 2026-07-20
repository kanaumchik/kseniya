import "server-only";

import { prisma } from "@/lib/prisma";

export function normalizePromoCode(code: string) {
  return code.trim().toLocaleUpperCase("ru-RU");
}

export async function findActivePromoCode(code: string) {
  const normalizedCode = normalizePromoCode(code);
  if (!normalizedCode) return null;

  return prisma.promoCode.findFirst({
    where: { normalizedCode, isActive: true },
  });
}
