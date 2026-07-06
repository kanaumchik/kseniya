"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="w-full max-w-sm rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm text-[var(--muted)]">Вход в личный кабинет</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Xeniia</h1>
      </div>

      <label className="block text-sm font-medium text-white" htmlFor="email">
        Email
      </label>
      <input className="field mt-2 w-full" id="email" name="email" type="email" autoComplete="email" required />

      <label className="mt-4 block text-sm font-medium text-white" htmlFor="password">
        Пароль
      </label>
      <input
        className="field mt-2 w-full"
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}

      <button className="primary-button mt-6 w-full px-4 py-2.5" disabled={isPending} type="submit">
        {isPending ? "Входим..." : "Войти"}
      </button>
    </form>
  );
}
