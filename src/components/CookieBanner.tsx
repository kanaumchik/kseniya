"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  functional_optional: boolean;
  version: string;
  acceptedAt: string;
  expiresAt: string;
};

const consentStorageKey = "psy_cookie_consent";
const consentCookieName = "psy_cookie_consent";
const consentChangeEvent = "psy-cookie-consent-updated";
const anonymousIdStorageKey = "psy_anonymous_id";
const anonymousIdCookieName = "psy_anonymous_id";
const cookiePolicyVersion = "2026-07-08";
const consentMaxAgeSeconds = 60 * 60 * 24 * 365;

const optionalCookieNames = [
  "_ga",
  "_gid",
  "_gat",
  "_ym_uid",
  "_ym_d",
  "_ym_isad",
  "_ym_visorc",
  "_fbp",
  "_fbc",
];

export function CookieBanner() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasConsent = useSyncExternalStore(subscribeToConsentChanges, getClientConsentSnapshot, getServerConsentSnapshot);

  if (hasConsent) {
    return null;
  }

  async function saveConsent(
    settings: { analytics: boolean; marketing: boolean; functional_optional: boolean },
    cookieChoice: "all" | "necessary_only" | "custom",
  ) {
    setIsSaving(true);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + consentMaxAgeSeconds * 1000);
    const nextConsent: CookieConsent = {
      necessary: true,
      analytics: settings.analytics,
      marketing: settings.marketing,
      functional_optional: settings.functional_optional,
      version: cookiePolicyVersion,
      acceptedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    const anonymousId = getOrCreateAnonymousId();

    try {
      const response = await fetch("/api/consents/cookie", {
        body: JSON.stringify({
          anonymousId,
          cookieChoice,
          cookiesAnalytics: nextConsent.analytics,
          cookiesMarketing: nextConsent.marketing,
          pageUrl: window.location.href,
          referrer: document.referrer || null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Cookie consent audit failed.");
      }

      if (!nextConsent.analytics && !nextConsent.marketing && !nextConsent.functional_optional) {
        deleteOptionalCookies();
      }

      try {
        localStorage.setItem(consentStorageKey, JSON.stringify(nextConsent));
      } catch {
        // The consent cookie below is enough to avoid showing the banner again.
      }

      document.cookie = `${consentCookieName}=${encodeURIComponent(JSON.stringify(nextConsent))}; Max-Age=${consentMaxAgeSeconds}; Path=/; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent<CookieConsent>(consentChangeEvent, { detail: nextConsent }));
    } finally {
      setIsSaving(false);
    }
  }

  function acceptAll() {
    void saveConsent(
      {
        analytics: true,
        marketing: true,
        functional_optional: true,
      },
      "all",
    );
  }

  function acceptNecessaryOnly() {
    void saveConsent(
      {
        analytics: false,
        marketing: false,
        functional_optional: false,
      },
      "necessary_only",
    );
  }

  function saveCustomChoice() {
    void saveConsent(
      {
        analytics: analyticsEnabled,
        marketing: marketingEnabled,
        functional_optional: false,
      },
      "custom",
    );
  }

  return (
    <>
      <section
        aria-label="Настройки cookie"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[#080807]/96 px-4 py-4 shadow-[0_-18px_48px_rgba(0,0,0,0.38)] backdrop-blur sm:px-6"
      >
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm leading-6 text-white/76">
              Мы используем cookie-файлы и аналогичные технологии для работы сайта, авторизации, сохранения настроек,
              аналитики и улучшения сервиса. Вы можете принять все cookies или оставить только необходимые. Подробнее — в{" "}
              <Link className="font-semibold text-[var(--gold-light)] transition hover:text-white" href="/legal/cookie-policy">
                Политике использования cookie-файлов
              </Link>
              .
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[32rem]">
            <button className="primary-button min-h-11 px-4 text-sm" disabled={isSaving} onClick={acceptAll} type="button">
              Принять все
            </button>
            <button className="secondary-button min-h-11 px-4 text-sm" disabled={isSaving} onClick={acceptNecessaryOnly} type="button">
              Только необходимые
            </button>
            <button className="secondary-button min-h-11 px-4 text-sm" disabled={isSaving} onClick={() => setIsSettingsOpen(true)} type="button">
              Настроить
            </button>
          </div>
        </div>
      </section>

      {isSettingsOpen ? (
        <div className="fixed inset-0 z-[60] grid place-items-end bg-black/58 px-4 py-4 backdrop-blur-sm sm:place-items-center sm:px-6">
          <section
            aria-labelledby="cookie-settings-title"
            aria-modal="true"
            className="w-full max-w-2xl rounded-md border border-[var(--line)] bg-[#080807] p-5 shadow-2xl sm:p-6"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-serif text-2xl text-[var(--gold-light)]" id="cookie-settings-title">
                Настройки cookie
              </h2>
              <button
                aria-label="Закрыть настройки cookie"
                className="icon-button size-10 min-h-0 min-w-0"
                disabled={isSaving}
                onClick={() => setIsSettingsOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-white/74">
              <div className="rounded-md border border-white/[0.08] bg-white/[0.035] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white/88">Необходимые cookie</p>
                    <p className="mt-1 leading-6">
                      Нужны для работы сайта, авторизации, личного кабинета, безопасности, сохранения выбранных настроек и
                      корректного отображения записей.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[var(--gold)] px-3 py-1 text-xs font-semibold text-[var(--gold-light)]">
                    Включены всегда
                  </span>
                </div>
              </div>

              <label className="flex items-start justify-between gap-4 rounded-md border border-white/[0.08] bg-white/[0.035] p-4">
                <span>
                  <span className="block font-semibold text-white/88">Аналитические cookie</span>
                  <span className="mt-1 block leading-6">
                    Помогают понять, как пользователи используют сайт, какие страницы открывают и где возникают ошибки.
                  </span>
                </span>
                <input
                  checked={analyticsEnabled}
                  className="mt-1 size-5 shrink-0 accent-[var(--gold)]"
                  onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                  type="checkbox"
                />
              </label>

              <label className="flex items-start justify-between gap-4 rounded-md border border-white/[0.08] bg-white/[0.035] p-4">
                <span>
                  <span className="block font-semibold text-white/88">Маркетинговые cookie</span>
                  <span className="mt-1 block leading-6">
                    Могут использоваться для оценки эффективности рекламы и показа более релевантных предложений.
                  </span>
                </span>
                <input
                  checked={marketingEnabled}
                  className="mt-1 size-5 shrink-0 accent-[var(--gold)]"
                  onChange={(event) => setMarketingEnabled(event.target.checked)}
                  type="checkbox"
                />
              </label>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <button className="primary-button min-h-11 px-4 text-sm" disabled={isSaving} onClick={saveCustomChoice} type="button">
                Сохранить выбор
              </button>
              <button className="secondary-button min-h-11 px-4 text-sm" disabled={isSaving} onClick={acceptAll} type="button">
                Принять все
              </button>
              <button className="secondary-button min-h-11 px-4 text-sm" disabled={isSaving} onClick={acceptNecessaryOnly} type="button">
                Только необходимые
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function getOrCreateAnonymousId() {
  const existingValue = localStorage.getItem(anonymousIdStorageKey);

  if (existingValue) {
    return existingValue;
  }

  const nextValue = crypto.randomUUID();
  localStorage.setItem(anonymousIdStorageKey, nextValue);
  document.cookie = `${anonymousIdCookieName}=${nextValue}; Max-Age=${consentMaxAgeSeconds}; Path=/; SameSite=Lax`;

  return nextValue;
}

function subscribeToConsentChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(consentChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(consentChangeEvent, onStoreChange);
  };
}

function getClientConsentSnapshot() {
  return Boolean(getSavedCookieConsent());
}

function getServerConsentSnapshot() {
  return true;
}

function getSavedCookieConsent() {
  const storedConsent = readStoredConsent();

  if (!storedConsent) {
    return null;
  }

  if (storedConsent.version !== cookiePolicyVersion) {
    return null;
  }

  if (new Date(storedConsent.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  return storedConsent;
}

function readStoredConsent(): CookieConsent | null {
  try {
    const localValue = localStorage.getItem(consentStorageKey);

    if (localValue) {
      return parseConsent(localValue);
    }
  } catch {
    // Fall back to cookie below.
  }

  return readConsentCookie();
}

function readConsentCookie() {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${consentCookieName}=`))
    ?.split("=")[1];

  if (!cookie) {
    return null;
  }

  return parseConsent(decodeURIComponent(cookie));
}

function parseConsent(value: string): CookieConsent | null {
  try {
    const parsed = JSON.parse(value) as Partial<CookieConsent>;

    if (
      parsed.necessary !== true ||
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.marketing !== "boolean" ||
      typeof parsed.functional_optional !== "boolean" ||
      typeof parsed.version !== "string" ||
      typeof parsed.acceptedAt !== "string" ||
      typeof parsed.expiresAt !== "string"
    ) {
      return null;
    }

    return parsed as CookieConsent;
  } catch {
    return null;
  }
}

function deleteOptionalCookies() {
  const hostParts = window.location.hostname.split(".");
  const domains = new Set<string>([window.location.hostname]);

  if (hostParts.length > 2) {
    domains.add(`.${hostParts.slice(-2).join(".")}`);
  }

  optionalCookieNames.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    domains.forEach((domain) => {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`;
    });
  });
}
