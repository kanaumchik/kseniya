"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

type CookieConsent = {
  analytics: boolean;
  marketing: boolean;
  necessary: true;
};

type AnalyticsEvent = {
  eventType: "page_view" | "page_duration" | "click" | "accordion_toggle" | "custom";
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
  eventPayload?: Record<string, unknown>;
};

declare global {
  interface Window {
    ym?: YandexMetrica;
  }
}

type YandexMetrica = ((...args: unknown[]) => void) & {
  a?: unknown[];
  l?: number;
};

const consentCookieName = "psy_cookie_consent";
const anonymousIdStorageKey = "psy_anonymous_id";
const anonymousIdCookieName = "psy_anonymous_id";
const sessionIdStorageKey = "psy_analytics_session";
const sessionIdCookieName = "psy_analytics_session";
const consentChangeEvent = "psy-cookie-consent-updated";
const sessionMaxAgeSeconds = 60 * 30;
const yandexCounterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = useMemo(() => `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`, [pathname, searchParams]);
  const pageStartedAtRef = useRef(0);
  const currentPathRef = useRef(currentPath);

  useEffect(() => {
    trackPageView(currentPath);
    currentPathRef.current = currentPath;
    pageStartedAtRef.current = Date.now();

    return () => {
      trackPageDuration(currentPathRef.current, Date.now() - pageStartedAtRef.current);
    };
  }, [currentPath]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("button,a,[role='button']") : null;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const metadata = getElementMetadata(target);
      void sendAnalyticsEvent({
        elementGroup: metadata.group,
        elementId: metadata.id,
        elementText: metadata.text,
        eventName: "click",
        eventPayload: {
          href: target instanceof HTMLAnchorElement ? target.href : null,
          tagName: target.tagName.toLowerCase(),
        },
        eventType: "click",
        path: currentPathRef.current,
      });

      reachYandexGoal("click", { element_id: metadata.id, element_group: metadata.group });
    }

    function onToggle(event: Event) {
      const target = event.target;

      if (!(target instanceof HTMLDetailsElement)) {
        return;
      }

      const metadata = getElementMetadata(target);
      void sendAnalyticsEvent({
        elementGroup: metadata.group || "accordion",
        elementId: metadata.id,
        elementText: metadata.text,
        eventName: target.open ? "accordion_open" : "accordion_close",
        eventPayload: { open: target.open },
        eventType: "accordion_toggle",
        path: currentPathRef.current,
      });
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        trackPageDuration(currentPathRef.current, Date.now() - pageStartedAtRef.current, true);
        pageStartedAtRef.current = Date.now();
      }
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("toggle", onToggle, true);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    loadYandexMetricaIfAllowed();

    function onConsentChange() {
      loadYandexMetricaIfAllowed();
    }

    window.addEventListener(consentChangeEvent, onConsentChange);

    return () => window.removeEventListener(consentChangeEvent, onConsentChange);
  }, []);

  return null;
}

function trackPageView(path: string) {
  void sendAnalyticsEvent({
    eventName: "page_view",
    eventType: "page_view",
    path,
    referrer: document.referrer || null,
  });

  if (hasAnalyticsConsent() && yandexCounterId && window.ym) {
    window.ym(Number(yandexCounterId), "hit", window.location.href, { referer: document.referrer || undefined });
  }
}

function trackPageDuration(path: string, durationMs: number, useBeacon = false) {
  if (durationMs < 1000) {
    return;
  }

  sendAnalyticsEvent(
    {
      durationMs,
      eventName: "page_duration",
      eventType: "page_duration",
      path,
    },
    useBeacon,
  );
}

function sendAnalyticsEvent(event: AnalyticsEvent, useBeacon = false) {
  const analyticsConsent = hasAnalyticsConsent();
  const enrichedEvent: AnalyticsEvent = {
    ...event,
    anonymousId: analyticsConsent ? getOrCreateAnonymousId() : null,
    pageUrl: window.location.href,
    referrer: event.referrer ?? (document.referrer || null),
    sessionId: analyticsConsent ? getOrCreateSessionId() : null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  const body = JSON.stringify({ events: [enrichedEvent] });

  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/events", new Blob([body], { type: "application/json" }));
    return;
  }

  return fetch("/api/analytics/events", {
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch(() => undefined);
}

function loadYandexMetricaIfAllowed() {
  if (!hasAnalyticsConsent() || !yandexCounterId || window.ym) {
    return;
  }

  window.ym =
    window.ym ||
    function ymStub(...args: unknown[]) {
      window.ym!.a = window.ym!.a || [];
      window.ym!.a.push(args);
    };
  window.ym.l = Date.now();

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://mc.yandex.ru/metrika/tag.js";
  document.head.appendChild(script);

  window.ym(Number(yandexCounterId), "init", {
    clickmap: true,
    accurateTrackBounce: true,
    trackLinks: true,
    webvisor: false,
  });
}

function reachYandexGoal(goal: string, params?: Record<string, unknown>) {
  if (!hasAnalyticsConsent() || !yandexCounterId || !window.ym) {
    return;
  }

  window.ym(Number(yandexCounterId), "reachGoal", goal, params);
}

function getElementMetadata(element: HTMLElement) {
  const text = getElementText(element);
  const id = element.dataset.analyticsId || buildElementId(element, text);
  const group = element.dataset.analyticsGroup || inferElementGroup(element, text);

  return { group, id, text };
}

function getElementText(element: HTMLElement) {
  return (
    element.dataset.analyticsLabel ||
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    element.innerText ||
    element.textContent ||
    element.tagName.toLowerCase()
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function buildElementId(element: HTMLElement, text: string) {
  const tag = element.tagName.toLowerCase();
  const path = getDomPath(element);
  const textPart = slugify(text || tag);

  return `${window.location.pathname}:${tag}:${textPart}:${path}`.slice(0, 180);
}

function getDomPath(element: HTMLElement) {
  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body && parts.length < 5) {
    const parent: Element | null = current.parentElement;
    const index = parent ? Array.from(parent.children).indexOf(current) + 1 : 1;
    parts.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
    current = parent;
  }

  return parts.join(">");
}

function inferElementGroup(element: HTMLElement, text: string) {
  const href = element instanceof HTMLAnchorElement ? element.getAttribute("href") || "" : "";
  const normalized = `${text} ${href}`.toLowerCase();

  if (normalized.includes("диагност")) {
    return "booking_diagnostic";
  }

  if (normalized.includes("сесси") || normalized.includes("запис")) {
    return "booking_session";
  }

  if (normalized.includes("подсказ")) {
    return "hint";
  }

  if (element.closest("nav")) {
    return "navigation";
  }

  return "ui";
}

function hasAnalyticsConsent() {
  return readCookieConsent()?.analytics === true;
}

function readCookieConsent(): CookieConsent | null {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${consentCookieName}=`))
    ?.split("=")[1];

  if (!cookie) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(cookie)) as CookieConsent;
  } catch {
    return null;
  }
}

function getOrCreateAnonymousId() {
  return getOrCreateStoredId(anonymousIdStorageKey, anonymousIdCookieName, 60 * 60 * 24 * 365);
}

function getOrCreateSessionId() {
  return getOrCreateStoredId(sessionIdStorageKey, sessionIdCookieName, sessionMaxAgeSeconds);
}

function getOrCreateStoredId(storageKey: string, cookieName: string, maxAgeSeconds: number) {
  const existing = localStorage.getItem(storageKey);

  if (existing) {
    document.cookie = `${cookieName}=${existing}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
    return existing;
  }

  const nextValue = crypto.randomUUID();
  localStorage.setItem(storageKey, nextValue);
  document.cookie = `${cookieName}=${nextValue}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;

  return nextValue;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/giu, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80) || "element"
  );
}
