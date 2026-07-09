import { NextResponse } from "next/server";
import { recordConsentEvent } from "@/lib/consent-audit";

type CookieConsentRequest = {
  anonymousId?: string;
  cookieChoice?: "all" | "necessary_only" | "custom";
  cookiesAnalytics?: boolean;
  cookiesMarketing?: boolean;
  pageUrl?: string;
  referrer?: string;
  timezone?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CookieConsentRequest;
  const cookieChoice = body.cookieChoice;

  if (!["all", "necessary_only", "custom"].includes(cookieChoice ?? "")) {
    return NextResponse.json({ error: "Некорректный выбор cookie." }, { status: 400 });
  }

  await recordConsentEvent({
    action: "cookie_choice",
    anonymousId: body.anonymousId ?? null,
    buttonLabel: getCookieButtonLabel(cookieChoice),
    consentType: "cookies_necessary",
    cookieChoice,
    cookiesAnalytics: Boolean(body.cookiesAnalytics),
    cookiesMarketing: Boolean(body.cookiesMarketing),
    cookiesNecessary: true,
    documentCode: "cookies_policy",
    eventPayload: {
      cookies_analytics: Boolean(body.cookiesAnalytics),
      cookies_marketing: Boolean(body.cookiesMarketing),
      cookies_necessary: true,
    },
    pageUrl: body.pageUrl,
    referrer: body.referrer,
    stage: "visit",
    timezone: body.timezone,
  });

  if (body.cookiesAnalytics) {
    await recordConsentEvent({
      action: "cookie_choice",
      anonymousId: body.anonymousId ?? null,
      buttonLabel: getCookieButtonLabel(cookieChoice),
      consentType: "cookies_analytics",
      cookieChoice,
      cookiesAnalytics: true,
      cookiesMarketing: Boolean(body.cookiesMarketing),
      cookiesNecessary: true,
      documentCode: "cookies_policy",
      pageUrl: body.pageUrl,
      referrer: body.referrer,
      stage: "visit",
      timezone: body.timezone,
    });
  }

  if (body.cookiesMarketing) {
    await recordConsentEvent({
      action: "cookie_choice",
      anonymousId: body.anonymousId ?? null,
      buttonLabel: getCookieButtonLabel(cookieChoice),
      consentType: "cookies_marketing",
      cookieChoice,
      cookiesAnalytics: Boolean(body.cookiesAnalytics),
      cookiesMarketing: true,
      cookiesNecessary: true,
      documentCode: "cookies_policy",
      pageUrl: body.pageUrl,
      referrer: body.referrer,
      stage: "visit",
      timezone: body.timezone,
    });
  }

  return NextResponse.json({ ok: true });
}

function getCookieButtonLabel(cookieChoice: CookieConsentRequest["cookieChoice"]) {
  if (cookieChoice === "all") {
    return "Принять все";
  }

  if (cookieChoice === "necessary_only") {
    return "Только необходимые";
  }

  return "Сохранить выбор";
}
