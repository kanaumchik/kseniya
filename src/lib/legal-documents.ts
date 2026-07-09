import "server-only";

import { readFileSync } from "fs";
import path from "path";

export type LegalDocumentMeta = {
  slug: string;
  title: string;
  filePath: string;
};

export type LegalDocument = LegalDocumentMeta & {
  body: string;
  revision: string | null;
};

export const legalDocuments: LegalDocumentMeta[] = [
  {
    slug: "offer",
    title: "Публичная оферта на оказание психологических услуг",
    filePath: path.join("Правовые документы", "01_Публичная_оферта_на_оказание_психологических_услуг.txt"),
  },
  {
    slug: "terms",
    title: "Пользовательское соглашение",
    filePath: path.join("Правовые документы", "02_Пользовательское_соглашение.txt"),
  },
  {
    slug: "privacy-policy",
    title: "Политика обработки персональных данных",
    filePath: path.join("Правовые документы", "03_Политика_обработки_персональных_данных.txt"),
  },
  {
    slug: "personal-data-consent",
    title: "Согласие на обработку персональных данных",
    filePath: path.join("Правовые документы", "04_Согласие_на_обработку_персональных_данных.txt"),
  },
  {
    slug: "sensitive-data-consent",
    title: "Согласие на обработку специальных категорий персональных данных",
    filePath: path.join("Правовые документы", "05_Согласие_на_обработку_специальных_категорий_ПД.txt"),
  },
  {
    slug: "cookie-policy",
    title: "Политика использования cookie-файлов",
    filePath: path.join("Правовые документы", "06_Политика_использования_cookie.txt"),
  },
  {
    slug: "booking-rules",
    title: "Правила записи, переноса или отмены записи",
    filePath: path.join("Правовые документы", "07_Правила_записи_переноса_и_отмены_встреч.txt"),
  },
  {
    slug: "informed-consent",
    title: "Информированное согласие на психологические услуги",
    filePath: path.join("Правовые документы", "08_Информированное_согласие_на_психологические_услуги.txt"),
  },
  {
    slug: "contacts",
    title: "Контакты и реквизиты",
    filePath: path.join("Правовые документы", "09_Контакты_и_реквизиты.txt"),
  },
  {
    slug: "marketing-consent",
    title: "Согласие на рекламные и информационные сообщения",
    filePath: path.join("Правовые документы", "10_Согласие_на_рекламные_и_информационные_сообщения.txt"),
  },
  {
    slug: "review-consent",
    title: "Согласие на публикацию отзыва",
    filePath: path.join("Правовые документы", "11_Согласие_на_публикацию_отзыва.txt"),
  },
];

export function getLegalDocument(slug: string) {
  const meta = legalDocuments.find((item) => item.slug === slug);

  if (!meta) {
    return null;
  }

  const rawBody = readFileSync(path.join(process.cwd(), meta.filePath), "utf8").trim();
  const lines = rawBody.split(/\r?\n/);
  const titleLineIndex = lines.findIndex((line) => line.trim().startsWith("# "));
  const title = titleLineIndex >= 0 ? lines[titleLineIndex].replace(/^#\s+/, "").trim() : meta.title;
  const revision =
    lines.find((line) => line.trim().startsWith("Редакция от") || line.trim().startsWith("Дата редакции:"))?.trim() ??
    null;

  return {
    ...meta,
    title,
    body: rawBody,
    revision,
  } satisfies LegalDocument;
}

export function getFirstLegalDocument() {
  return getLegalDocument(legalDocuments[0].slug);
}
