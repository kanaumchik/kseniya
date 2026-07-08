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
    slug: "terms",
    title: "Пользовательское соглашение",
    filePath: "Пользовательское соглашение.txt",
  },
  {
    slug: "privacy-policy",
    title: "Политика обработки персональных данных",
    filePath: path.join("Правовые документы", "Политика обработки персональных данных.txt"),
  },
  {
    slug: "personal-data-consent",
    title: "Согласие на обработку персональных данных",
    filePath: path.join("Правовые документы", "Согласие на обработку персональных данных.txt"),
  },
  {
    slug: "sensitive-data-consent",
    title: "Согласие на обработку специальных категорий персональных данных",
    filePath: path.join("Правовые документы", "Согласие на обработку специальных категорий персональных данных.txt"),
  },
  {
    slug: "cookie-policy",
    title: "Политика использования cookie-файлов",
    filePath: path.join("Правовые документы", "Политика использования cookie-файлов.txt"),
  },
  {
    slug: "booking-rules",
    title: "Правила записи, переноса или отмены записи",
    filePath: path.join("Правовые документы", "Правила записи, переноса или отмены записи.txt"),
  },
  {
    slug: "informed-consent",
    title: "Информированное согласие на психологическую диагностику и консультации",
    filePath: path.join("Правовые документы", "Информированное согласие на психологическую диагностику и консультации.txt"),
  },
  {
    slug: "contacts",
    title: "Контакты и реквизиты",
    filePath: path.join("Правовые документы", "Контакты и реквизиты.txt"),
  },
  {
    slug: "marketing-consent",
    title: "Согласие на получение рекламных и информационных сообщений",
    filePath: path.join("Правовые документы", "Согласие на получение рекламных и информационных сообщений.txt"),
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
  const revision = lines.find((line) => line.trim().startsWith("Редакция от"))?.trim() ?? null;

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
