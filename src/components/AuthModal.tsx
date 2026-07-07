"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { loginAction, registerAction } from "@/app/actions";

type AuthModalProps = {
  triggerLabel?: string;
  variant?: "nav" | "hero";
};

export function AuthModal({ triggerLabel = "Войти", variant = "nav" }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [birthDate, setBirthDate] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+7");
  const [phone, setPhone] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const [loginError, loginFormAction, isLoginPending] = useActionState(loginAction, undefined);
  const [registerError, registerFormAction, isRegisterPending] = useActionState(registerAction, undefined);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [isOpen, activeTab]);

  return (
    <>
      <button className={variant === "hero" ? "hero-gold-button" : "secondary-button px-4 py-2 text-sm"} onClick={() => setIsOpen(true)} type="button">
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 px-4 py-6 backdrop-blur-md" role="dialog" aria-modal="true">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-white/[0.1] bg-[#10100f] shadow-2xl shadow-black">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5 pb-4 sm:p-6 sm:pb-5">
              <div>
                <p className="text-xs uppercase text-[var(--gold)]">Личный кабинет</p>
                <h2 className="mt-2 font-serif text-3xl leading-tight text-[var(--gold-light)]">Вход на сайт</h2>
              </div>
              <button className="icon-button" onClick={() => setIsOpen(false)} type="button" aria-label="Закрыть">
                ×
              </button>
            </div>

            <div className="mx-5 mt-5 grid grid-cols-2 rounded-md border border-white/[0.08] bg-black/28 p-1 sm:mx-6">
              <button className={activeTab === "login" ? "auth-tab auth-tab-active" : "auth-tab"} onClick={() => setActiveTab("login")} type="button">
                Авторизация
              </button>
              <button className={activeTab === "register" ? "auth-tab auth-tab-active" : "auth-tab"} onClick={() => setActiveTab("register")} type="button">
                Регистрация
              </button>
            </div>

            <div ref={bodyRef} className="min-h-0 overflow-y-auto p-5 pt-6 sm:p-6">
              {activeTab === "login" ? (
              <form action={loginFormAction} className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="login-email">
                  Электронная почта
                  <input className="field" id="login-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
                </label>

                <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="login-password">
                  Пароль
                  <input
                    className="field"
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="Укажите Ваш пароль"
                    autoComplete="current-password"
                    required
                  />
                </label>

                {loginError ? <p className="text-sm text-[var(--danger)]">{loginError}</p> : null}

                <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button className="primary-button px-6 py-3 text-sm" disabled={isLoginPending} type="submit">
                    {isLoginPending ? "Входим..." : "Войти"}
                  </button>
                  <button className="text-left text-sm font-medium text-[var(--gold-light)] transition hover:text-[var(--gold)]" type="button">
                    Забыли пароль?
                  </button>
                </div>
              </form>
            ) : (
              <form action={registerFormAction} className="grid gap-4">
                <input name="timeZone" type="hidden" value="Asia/Yekaterinburg" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="register-first-name">
                    Имя
                    <input className="field" id="register-first-name" name="firstName" type="text" placeholder="Укажите Ваше имя" autoComplete="given-name" required />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="register-last-name">
                    Фамилия
                    <input className="field" id="register-last-name" name="lastName" type="text" placeholder="Укажите Вашу фамилию" autoComplete="family-name" required />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="register-gender">
                    Пол
                    <select className="field" id="register-gender" name="gender" required defaultValue="">
                      <option value="" disabled>
                        Укажите Ваш пол
                      </option>
                      <option value="male">Мужской</option>
                      <option value="female">Женский</option>
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="register-birth-date">
                    Дата рождения
                    <input
                      className="field"
                      id="register-birth-date"
                      name="birthDate"
                      type="text"
                      value={birthDate}
                      onChange={(event) => setBirthDate(formatBirthDateInput(event.target.value))}
                      placeholder="ДД.ММ.ГГГГ"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19|20)\d{2}"
                      required
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="register-city">
                  Город
                  <input className="field" id="register-city" name="city" type="text" placeholder="Укажите Ваш город" autoComplete="address-level2" required />
                </label>

                <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="register-phone">
                  Телефон
                  <div className="grid grid-cols-[7rem_1fr] gap-2">
                    <select className="field" name="phonePrefix" value={phonePrefix} onChange={(event) => setPhonePrefix(event.target.value)}>
                      <option value="+7">+7</option>
                      <option value="+375">+375</option>
                      <option value="+380">+380</option>
                      <option value="+996">+996</option>
                    </select>
                    <input
                      className="field"
                      id="register-phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
                      placeholder="(ХХХ)-ХХХ-ХХ-ХХ"
                      inputMode="tel"
                      maxLength={15}
                      pattern="\(\d{3}\)-\d{3}-\d{2}-\d{2}"
                      required
                    />
                  </div>
                </label>

                <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="register-email">
                  E-mail
                  <input className="field" id="register-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="register-password">
                    Пароль
                    <input
                      className="field"
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="Минимум 6 символов"
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="register-password-repeat">
                    Повторите пароль
                    <input
                      className="field"
                      id="register-password-repeat"
                      name="passwordRepeat"
                      type="password"
                      placeholder="Минимум 6 символов"
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </label>
                </div>

                <label className="flex rounded-md border border-white/[0.08] bg-black/18 p-3 text-sm leading-6 text-white/74">
                  <input className="mt-1 size-4 accent-[var(--gold)]" name="consent" type="checkbox" value="accepted" required />
                  <span>Я принимаю условия, Политику обработки персональных данных и даю согласие на обработку персональных данных</span>
                </label>

                {registerError ? <p className="text-sm text-[var(--danger)]">{registerError}</p> : null}

                <button className="primary-button px-6 py-3 text-sm" disabled={isRegisterPending} type="submit">
                  {isRegisterPending ? "Регистрируем..." : "Зарегистрироваться"}
                </button>
              </form>
            )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function formatBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);

  return parts.join(".");
}

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const first = digits.slice(0, 3);
  const second = digits.slice(3, 6);
  const third = digits.slice(6, 8);
  const fourth = digits.slice(8, 10);

  if (digits.length <= 3) {
    return first ? `(${first}` : "";
  }

  if (digits.length <= 6) {
    return `(${first})-${second}`;
  }

  if (digits.length <= 8) {
    return `(${first})-${second}-${third}`;
  }

  return `(${first})-${second}-${third}-${fourth}`;
}
