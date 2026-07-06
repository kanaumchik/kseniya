"use client";

import { useActionState, useEffect, useState } from "react";
import { loginAction, registerAction } from "@/app/actions";

type AuthModalProps = {
  triggerLabel?: string;
  variant?: "nav" | "hero";
};

export function AuthModal({ triggerLabel = "Войти", variant = "nav" }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
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

  return (
    <>
      <button className={variant === "hero" ? "hero-gold-button" : "secondary-button px-4 py-2 text-sm"} onClick={() => setIsOpen(true)} type="button">
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 px-4 py-6 backdrop-blur-md" role="dialog" aria-modal="true">
          <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-md border border-white/[0.1] bg-[#10100f] p-5 shadow-2xl shadow-black sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div>
                <p className="text-xs uppercase text-[var(--gold)]">Личный кабинет</p>
                <h2 className="mt-2 font-serif text-3xl leading-tight text-[var(--gold-light)]">Вход на сайт</h2>
              </div>
              <button className="secondary-button px-3 py-2 text-sm" onClick={() => setIsOpen(false)} type="button" aria-label="Закрыть">
                Закрыть
              </button>
            </div>

            <div className="grid grid-cols-2 rounded-md border border-white/[0.08] bg-black/28 p-1">
              <button className={activeTab === "login" ? "auth-tab auth-tab-active" : "auth-tab"} onClick={() => setActiveTab("login")} type="button">
                Авторизация
              </button>
              <button className={activeTab === "register" ? "auth-tab auth-tab-active" : "auth-tab"} onClick={() => setActiveTab("register")} type="button">
                Регистрация
              </button>
            </div>

            {activeTab === "login" ? (
              <form action={loginFormAction} className="mt-6 grid gap-4">
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
              <form action={registerFormAction} className="mt-6 grid gap-4">
                <input name="timeZone" type="hidden" value="Asia/Yekaterinburg" />

                <label className="grid gap-2 text-sm font-medium text-white/86" htmlFor="register-name">
                  Имя и фамилия
                  <input className="field" id="register-name" name="name" type="text" placeholder="Введите имя и фамилию" autoComplete="name" required />
                </label>

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
                      placeholder="ДД.ММ.ГГГГ"
                      inputMode="numeric"
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
                  <input
                    className="field"
                    id="register-phone"
                    name="phone"
                    type="tel"
                    placeholder="+7(ХХХ)-ХХХ-ХХ-ХХ"
                    inputMode="tel"
                    pattern="\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}"
                    required
                  />
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
      ) : null}
    </>
  );
}
