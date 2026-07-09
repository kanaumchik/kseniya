import "server-only";

import { createHash, createHmac, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { getLegalDocument } from "@/lib/legal-documents";
import { prisma } from "@/lib/prisma";

export type ConsentType =
  | "cookies_necessary"
  | "cookies_analytics"
  | "cookies_marketing"
  | "terms_acceptance"
  | "offer_acceptance"
  | "privacy_policy_ack"
  | "personal_data_processing"
  | "special_category_data_processing"
  | "informed_psychological_services"
  | "booking_rules_acceptance"
  | "marketing_messages"
  | "review_publication"
  | "consent_withdrawal";

export type ConsentStage = "visit" | "registration" | "booking" | "payment" | "profile" | "marketing" | "review" | "withdrawal";

type ConsentDocumentCode =
  | "terms"
  | "offer"
  | "privacy_policy"
  | "personal_data_consent"
  | "special_category_data_consent"
  | "cookies_policy"
  | "booking_rules"
  | "informed_consent"
  | "marketing_consent"
  | "review_publication_consent"
  | "contacts";

type ConsentEventInput = {
  userId?: number | null;
  anonymousId?: string | null;
  stage: ConsentStage;
  consentType: ConsentType;
  action: string;
  documentCode?: ConsentDocumentCode | null;
  bookingKind?: "session" | "diagnostic" | null;
  serviceId?: string | null;
  appointmentId?: number | null;
  cookieChoice?: "all" | "necessary_only" | "custom" | null;
  cookiesNecessary?: boolean | null;
  cookiesAnalytics?: boolean | null;
  cookiesMarketing?: boolean | null;
  checkboxLabel?: string | null;
  buttonLabel?: string | null;
  pageUrl?: string | null;
  referrer?: string | null;
  timezone?: string | null;
  sessionId?: string | null;
  eventPayload?: Prisma.InputJsonValue;
};

const legalDocumentMap: Record<ConsentDocumentCode, { slug: string; url: string }> = {
  terms: { slug: "terms", url: "/legal/terms" },
  offer: { slug: "offer", url: "/legal/offer" },
  privacy_policy: { slug: "privacy-policy", url: "/legal/privacy-policy" },
  personal_data_consent: { slug: "personal-data-consent", url: "/legal/personal-data-consent" },
  special_category_data_consent: { slug: "sensitive-data-consent", url: "/legal/sensitive-data-consent" },
  cookies_policy: { slug: "cookie-policy", url: "/legal/cookie-policy" },
  booking_rules: { slug: "booking-rules", url: "/legal/booking-rules" },
  informed_consent: { slug: "informed-consent", url: "/legal/informed-consent" },
  marketing_consent: { slug: "marketing-consent", url: "/legal/marketing-consent" },
  review_publication_consent: { slug: "review-consent", url: "/legal/review-consent" },
  contacts: { slug: "contacts", url: "/legal/contacts" },
};

export async function recordConsentEvent(input: ConsentEventInput) {
  const requestHeaders = await headers();
  const now = new Date();
  const id = randomUUID();
  const requestId = requestHeaders.get("x-request-id") ?? randomUUID();
  const requestMeta = getRequestMeta(requestHeaders);
  const documentVersion = input.documentCode ? await getOrCreateLegalDocumentVersion(input.documentCode) : null;
  const previousEvent = await prisma.consentEvent.findFirst({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { eventHash: true },
  });
  const ipAddressHash = requestMeta.ip ? hashWithOptionalPepper(requestMeta.ip, process.env.CONSENT_IP_PEPPER) : null;
  const sessionId = input.sessionId ?? getSessionIdFromCookieHeader(requestHeaders.get("cookie"));
  const sessionIdHash = sessionId ? sha256(sessionId) : null;
  const pageUrl = input.pageUrl ?? requestMeta.pageUrl;
  const referrer = input.referrer ?? requestMeta.referrer;
  const occurredAt = now.toISOString();
  const eventPayload = input.eventPayload ?? {};
  const canonicalPayload = {
    id,
    userId: input.userId ?? null,
    anonymousId: input.anonymousId ?? null,
    stage: input.stage,
    consentType: input.consentType,
    action: input.action,
    documentCode: documentVersion?.documentCode ?? input.documentCode ?? null,
    documentVersion: documentVersion?.version ?? null,
    documentSha256: documentVersion?.contentSha256 ?? null,
    documentUrl: documentVersion?.url ?? null,
    bookingKind: input.bookingKind ?? null,
    serviceId: input.serviceId ?? null,
    appointmentId: input.appointmentId ?? null,
    checkboxLabel: input.checkboxLabel ?? null,
    buttonLabel: input.buttonLabel ?? null,
    pageUrl,
    referrer,
    ipAddressHash,
    userAgent: requestMeta.userAgent,
    acceptLanguage: requestMeta.acceptLanguage,
    timezone: input.timezone ?? null,
    sessionIdHash,
    requestId,
    eventPayload,
    occurredAt,
    previousEventHash: previousEvent?.eventHash ?? null,
  };
  const eventHash = sha256(stableStringify(canonicalPayload));
  const serverSignature = createHmac("sha256", getConsentSigningSecret()).update(eventHash).digest("hex");

  return prisma.consentEvent.create({
    data: {
      id,
      userId: input.userId ?? null,
      anonymousId: input.anonymousId ?? null,
      stage: input.stage,
      consentType: input.consentType,
      action: input.action,
      documentVersionId: documentVersion?.id ?? null,
      documentCode: documentVersion?.documentCode ?? input.documentCode ?? null,
      documentVersion: documentVersion?.version ?? null,
      documentSha256: documentVersion?.contentSha256 ?? null,
      documentUrl: documentVersion?.url ?? null,
      bookingKind: input.bookingKind ?? null,
      serviceId: input.serviceId ?? null,
      appointmentId: input.appointmentId ?? null,
      cookieChoice: input.cookieChoice ?? null,
      cookiesNecessary: input.cookiesNecessary ?? null,
      cookiesAnalytics: input.cookiesAnalytics ?? null,
      cookiesMarketing: input.cookiesMarketing ?? null,
      checkboxLabel: input.checkboxLabel ?? null,
      buttonLabel: input.buttonLabel ?? null,
      pageUrl,
      referrer,
      ipAddressHash,
      userAgent: requestMeta.userAgent,
      acceptLanguage: requestMeta.acceptLanguage,
      timezone: input.timezone ?? null,
      sessionIdHash,
      requestId,
      eventPayload,
      occurredAt: now,
      previousEventHash: previousEvent?.eventHash ?? null,
      eventHash,
      serverSignature,
    },
  });
}

async function getOrCreateLegalDocumentVersion(documentCode: ConsentDocumentCode) {
  const documentMeta = legalDocumentMap[documentCode];
  const document = getLegalDocument(documentMeta.slug);

  if (!document) {
    throw new Error(`Legal document not found: ${documentMeta.slug}`);
  }

  const normalizedText = normalizeLegalText(document.body);
  const contentSha256 = sha256(normalizedText);
  const version = normalizeDocumentVersion(document.revision);
  const publishedAt = parsePublishedAt(document.revision);
  const existingVersion = await prisma.legalDocumentVersion.findUnique({
    where: {
      documentCode_version_contentSha256: {
        documentCode,
        version,
        contentSha256,
      },
    },
  });

  if (existingVersion) {
    return existingVersion;
  }

  await prisma.legalDocumentVersion.updateMany({
    data: { isActive: false },
    where: { documentCode, isActive: true },
  });

  return prisma.legalDocumentVersion.create({
    data: {
      documentCode,
      title: document.title,
      version,
      publishedAt,
      url: documentMeta.url,
      contentText: normalizedText,
      contentSha256,
    },
  });
}

function getRequestMeta(requestHeaders: Headers) {
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host") ?? "kseniyanaumchik.ru";
  const proto = requestHeaders.get("x-forwarded-proto") ?? "https";
  const referrer = requestHeaders.get("referer");

  return {
    acceptLanguage: requestHeaders.get("accept-language"),
    ip: getClientIp(requestHeaders),
    pageUrl: referrer ?? `${proto}://${host}/`,
    referrer,
    userAgent: requestHeaders.get("user-agent"),
  };
}

function getClientIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return requestHeaders.get("x-real-ip");
}

function getSessionIdFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((item) => {
      const [name, ...valueParts] = item.trim().split("=");

      return [name, valueParts.join("=")];
    }),
  );

  return cookies["authjs.session-token"] ?? cookies["__Secure-authjs.session-token"] ?? cookies["next-auth.session-token"] ?? null;
}

function getConsentSigningSecret() {
  const secret = process.env.CONSENT_SIGNING_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CONSENT_SIGNING_SECRET is required in production.");
    }

    return "development-consent-signing-secret";
  }

  return secret;
}

function normalizeLegalText(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim();
}

function normalizeDocumentVersion(revision: string | null) {
  return revision?.replace(/^Редакция от\s+/i, "").replace(/^Дата редакции:\s*/i, "").trim() || "current";
}

function parsePublishedAt(revision: string | null) {
  const version = normalizeDocumentVersion(revision);
  const match = version.match(/(\d{1,2})\s+([а-яё]+)\s+(\d{4})/i);
  const months: Record<string, number> = {
    января: 0,
    февраля: 1,
    марта: 2,
    апреля: 3,
    мая: 4,
    июня: 5,
    июля: 6,
    августа: 7,
    сентября: 8,
    октября: 9,
    ноября: 10,
    декабря: 11,
  };

  if (match) {
    const [, day, monthName, year] = match;
    const month = months[monthName.toLowerCase()];

    if (month !== undefined) {
      return new Date(Date.UTC(Number(year), month, Number(day), 0, 0, 0));
    }
  }

  return new Date();
}

function hashWithOptionalPepper(value: string, pepper: string | undefined) {
  return sha256(`${value}${pepper ?? ""}`);
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));

  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
}
