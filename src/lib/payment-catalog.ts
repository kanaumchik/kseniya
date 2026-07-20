export const packagePrices: Record<string, number> = {
  "Запуск трансформации": 10000,
  "Глубина и поддержка": 20000,
  "От хаоса к гармонии и порядку": 24000,
};

export const sessionPrice = 4000;

export function getPaymentOffer(packageTitle: string | null | undefined) {
  const normalizedPackageTitle = packageTitle && packagePrices[packageTitle] ? packageTitle : null;

  return {
    amount: normalizedPackageTitle ? packagePrices[normalizedPackageTitle] : sessionPrice,
    packageTitle: normalizedPackageTitle,
    title: normalizedPackageTitle ?? "Индивидуальная психологическая сессия",
  };
}
