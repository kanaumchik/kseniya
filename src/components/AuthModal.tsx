"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { loginAction, registerAction } from "@/app/actions";

type AuthModalProps = {
  triggerLabel?: string;
  variant?: "nav" | "hero";
  triggerClassName?: string;
};

export function AuthModal({ triggerClassName, triggerLabel = "Войти", variant = "nav" }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [birthDate, setBirthDate] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+7");
  const [phone, setPhone] = useState("");
  const [isLoginPasswordVisible, setIsLoginPasswordVisible] = useState(false);
  const [isRegisterPasswordVisible, setIsRegisterPasswordVisible] = useState(false);
  const [isRegisterPasswordRepeatVisible, setIsRegisterPasswordRepeatVisible] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [loginError, loginFormAction, isLoginPending] = useActionState(loginAction, undefined);
  const [registerError, registerFormAction, isRegisterPending] = useActionState(registerAction, undefined);
  const modalTitle = activeTab === "login" ? "Вход в личный кабинет" : "Создайте личный кабинет";

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
      <button
        className={[
          variant === "hero" ? "hero-gold-button" : "secondary-button px-4 py-2 text-sm",
          triggerClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        {triggerLabel}
      </button>

      {isOpen && typeof document !== "undefined" ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 px-3 py-3 backdrop-blur-md sm:px-4 sm:py-6" role="dialog" aria-modal="true">
          <div className="relative flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-md border border-white/[0.1] bg-[#10100f] shadow-2xl shadow-black">
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] p-4 pb-3 sm:p-6 sm:pb-5">
              <div>
                <p className="text-xs uppercase text-[var(--gold)]">Личный кабинет</p>
                <h2 className="mt-2 font-serif text-2xl leading-tight text-[var(--gold-light)] sm:text-3xl">{modalTitle}</h2>
              </div>
              <button className="icon-button" onClick={() => setIsOpen(false)} type="button" aria-label="Закрыть">
                ×
              </button>
            </div>

            <div className="mx-4 mt-4 grid grid-cols-2 rounded-md border border-white/[0.08] bg-black/16 p-0.5 sm:mx-6 sm:mt-5">
              <button className={activeTab === "login" ? "auth-tab auth-tab-active" : "auth-tab"} onClick={() => setActiveTab("login")} type="button">
                Авторизация
              </button>
              <button className={activeTab === "register" ? "auth-tab auth-tab-active" : "auth-tab"} onClick={() => setActiveTab("register")} type="button">
                Регистрация
              </button>
            </div>

            <div ref={bodyRef} className="auth-modal-scrollbar min-h-0 overflow-y-auto p-4 pt-5 sm:p-6 sm:pt-6">
              {activeTab === "login" ? (
              <form action={loginFormAction} className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="login-email">
                  Электронная почта
                  <input className="field" id="login-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
                </label>

                <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="login-password">
                  <span className="flex items-center justify-between gap-3">
                    <span>Пароль</span>
                    <button className="text-xs font-semibold text-[var(--gold-light)] transition hover:text-[var(--gold)]" type="button">
                      Забыли пароль?
                    </button>
                  </span>
                  <span className="relative">
                    <input
                      className="field w-full pr-12"
                      id="login-password"
                      name="password"
                      type={isLoginPasswordVisible ? "text" : "password"}
                      placeholder="Укажите Ваш пароль"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      aria-label={isLoginPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
                      className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded text-white/64 transition hover:bg-white/[0.06] hover:text-[var(--gold-light)]"
                      onClick={() => setIsLoginPasswordVisible((current) => !current)}
                      type="button"
                    >
                      <PasswordVisibilityIcon isVisible={isLoginPasswordVisible} />
                    </button>
                  </span>
                </label>

                {loginError ? <p className="text-sm text-[var(--danger)]">{loginError}</p> : null}

                <div className="mt-1">
                  <button className="primary-button min-h-14 w-full px-6 py-3 text-base" disabled={isLoginPending} type="submit">
                    {isLoginPending ? "Входим..." : "Войти"}
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
                  <div className="grid grid-cols-[6rem_1fr] gap-2 sm:grid-cols-[7rem_1fr]">
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
                    <span className="relative">
                      <input
                        className="field w-full pr-12"
                        id="register-password"
                        name="password"
                        type={isRegisterPasswordVisible ? "text" : "password"}
                        placeholder="Минимум 6 символов"
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                      <button
                        aria-label={isRegisterPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
                        className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded text-white/64 transition hover:bg-white/[0.06] hover:text-[var(--gold-light)]"
                        onClick={() => setIsRegisterPasswordVisible((current) => !current)}
                        type="button"
                      >
                        <PasswordVisibilityIcon isVisible={isRegisterPasswordVisible} />
                      </button>
                    </span>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="register-password-repeat">
                    Повторите пароль
                    <span className="relative">
                      <input
                        className="field w-full pr-12"
                        id="register-password-repeat"
                        name="passwordRepeat"
                        type={isRegisterPasswordRepeatVisible ? "text" : "password"}
                        placeholder="Минимум 6 символов"
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                      <button
                        aria-label={isRegisterPasswordRepeatVisible ? "Скрыть пароль" : "Показать пароль"}
                        className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded text-white/64 transition hover:bg-white/[0.06] hover:text-[var(--gold-light)]"
                        onClick={() => setIsRegisterPasswordRepeatVisible((current) => !current)}
                        type="button"
                      >
                        <PasswordVisibilityIcon isVisible={isRegisterPasswordRepeatVisible} />
                      </button>
                    </span>
                  </label>
                </div>

                <label className="flex gap-3 rounded-md border border-white/[0.08] bg-black/18 p-3 text-sm leading-6 text-white/74">
                  <input className="mt-1 size-4 accent-[var(--gold)]" name="consent" type="checkbox" value="accepted" required />
                  <span>Я принимаю условия использования и политику обработки персональных данных</span>
                </label>

                {registerError ? <p className="text-sm text-[var(--danger)]">{registerError}</p> : null}

                <div className="sticky bottom-[-1.5rem] -mx-4 -mb-4 border-t border-white/[0.08] bg-[#10100f]/96 p-4 pt-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:p-6 sm:pt-4">
                  <button className="primary-button min-h-14 w-full px-6 py-3 text-base" disabled={isRegisterPending} type="submit">
                    {isRegisterPending ? "Регистрируем..." : "Зарегистрироваться"}
                  </button>
                </div>
              </form>
            )}
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}

function formatBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);

  return parts.join(".");
}

function PasswordVisibilityIcon({ isVisible }: { isVisible: boolean }) {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      {!isVisible ? (
        <path d="M4 20 20 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      ) : null}
    </svg>
  );
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
