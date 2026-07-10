import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AnalyticsEventInput = {
  eventType: "page_view" | "page_duration" | "click" | "accordion_toggle" | "hint_generated" | "custom";
  eventName: string;
  elementId?: string | null;
  elementText?: string | null;
  elementGroup?: string | null;
  pageUrl?: string | null;
  path?: string | null;
  referrer?: string | null;
  anonymousId?: string | null;
  sessionId?: string | null;
  timezone?: string | null;
  durationMs?: number | null;
  eventPayload?: Prisma.InputJsonValue;
};

type CookieConsent = {
  analytics?: boolean;
};

const consentCookieName = "psy_cookie_consent";
const anonymousIdCookieName = "psy_anonymous_id";
const sessionIdCookieName = "psy_analytics_session";

export async function recordAnalyticsEvent(input: AnalyticsEventInput) {
  const requestHeaders = await headers();
  const session = await auth();
  const cookieHeader = requestHeaders.get("cookie");
  const cookieConsent = readCookieConsent(cookieHeader);
  const hasAnalyticsConsent = cookieConsent?.analytics === true;
  const pageUrl = input.pageUrl || requestHeaders.get("referer") || "/";
  const path = normalizePath(input.path || pageUrl);
  const eventName = normalizeKey(input.eventName || input.eventType);
  const elementId = input.elementId ? normalizeKey(input.elementId) : null;
  const durationMs = normalizeDuration(input.durationMs);
  const occurredAt = new Date();

  await incrementAggregate({
    dateKey: occurredAt.toISOString().slice(0, 10),
    durationMs,
    elementGroup: input.elementGroup ?? null,
    elementId,
    elementText: truncate(input.elementText, 240),
    eventName,
    eventType: input.eventType,
    path,
  });

  if (!hasAnalyticsConsent) {
    return { storedFact: false };
  }

  await prisma.analyticsEvent.create({
    data: {
      anonymousId: truncate(input.anonymousId || getCookie(cookieHeader, anonymousIdCookieName), 128),
      consentAnalytics: true,
      durationMs,
      elementGroup: truncate(input.elementGroup, 160),
      elementId,
      elementText: truncate(input.elementText, 240),
      eventName,
      eventPayload: input.eventPayload ?? {},
      eventType: input.eventType,
      ipAddress: getClientIp(requestHeaders),
      pageUrl: truncate(pageUrl, 1024) || "/",
      path,
      referrer: truncate(input.referrer, 1024),
      sessionId: truncate(input.sessionId || getCookie(cookieHeader, sessionIdCookieName), 128),
      timezone: truncate(input.timezone, 120),
      userAgent: truncate(requestHeaders.get("user-agent"), 512),
      acceptLanguage: truncate(requestHeaders.get("accept-language"), 256),
      userId: session?.user?.id ? Number(session.user.id) : null,
    },
  });

  return { storedFact: true };
}

async function incrementAggregate(input: {
  dateKey: string;
  durationMs: number | null;
  elementGroup: string | null;
  elementId: string | null;
  elementText: string | null;
  eventName: string;
  eventType: string;
  path: string;
}) {
  await prisma.$executeRaw`
    INSERT INTO analytics_daily_aggregates
      (date_key, event_type, event_name, element_id, element_text, element_group, path, count, total_duration_ms)
    VALUES
      (${input.dateKey}, ${input.eventType}, ${input.eventName}, ${input.elementId}, ${input.elementText}, ${input.elementGroup}, ${input.path}, 1, ${input.durationMs ?? 0})
    ON CONFLICT (date_key, event_type, event_name, path, (COALESCE(element_id, '')))
    DO UPDATE SET
      count = analytics_daily_aggregates.count + 1,
      total_duration_ms = analytics_daily_aggregates.total_duration_ms + EXCLUDED.total_duration_ms,
      element_text = COALESCE(EXCLUDED.element_text, analytics_daily_aggregates.element_text),
      element_group = COALESCE(EXCLUDED.element_group, analytics_daily_aggregates.element_group),
      updated_at = CURRENT_TIMESTAMP
  `;
}

function readCookieConsent(cookieHeader: string | null): CookieConsent | null {
  const rawValue = getCookie(cookieHeader, consentCookieName);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(rawValue)) as CookieConsent;
  } catch {
    return null;
  }
}

function getCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  return (
    cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${name}=`))
      ?.slice(name.length + 1) ?? null
  );
}

function getClientIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();

  return truncate(forwardedFor || requestHeaders.get("x-real-ip"), 64);
}

function normalizePath(value: string) {
  try {
    const url = new URL(value, "https://kseniyanaumchik.ru");
    return truncate(`${url.pathname}${url.search}`, 1024) || "/";
  } catch {
    return truncate(value, 1024) || "/";
  }
}

function normalizeKey(value: string) {
  return truncate(
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-zа-яё0-9._:-]+/giu, "_")
      .replace(/^_+|_+$/g, ""),
    180,
  ) || "unknown";
}

function normalizeDuration(value: number | null | undefined) {
  if (!Number.isFinite(value ?? NaN)) {
    return null;
  }

  return Math.max(0, Math.min(Math.round(value ?? 0), 24 * 60 * 60 * 1000));
}

function truncate(value: string | null | undefined, maxLength: number) {
  if (!value) {
    return null;
  }

  return value.length > maxLength ? value.slice(0, maxLength) : value;
}
