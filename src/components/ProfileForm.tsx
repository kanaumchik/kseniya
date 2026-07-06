"use client";

import Image from "next/image";
import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions";
import { supportedTimeZones } from "@/lib/time";

type ProfileFormProps = {
  user: {
    email: string;
    name: string;
    gender: string | null;
    birthDate: string | null;
    city: string | null;
    phone: string | null;
    timeZone: string;
    photoPath: string | null;
  };
};

export function ProfileForm({ user }: ProfileFormProps) {
  const [message, formAction, isPending] = useActionState(updateProfileAction, undefined);

  return (
    <form action={formAction} className="mx-auto grid w-full max-w-4xl gap-5 px-4 py-8" encType="multipart/form-data">
      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative size-24 overflow-hidden rounded-full border border-white/[0.12] bg-black/30">
            {user.photoPath ? <Image alt="Фото профиля" className="object-cover" fill src={user.photoPath} /> : null}
          </div>
          <div className="grid gap-2">
            <h1 className="font-serif text-3xl text-[var(--gold-light)]">Профиль</h1>
            <label className="grid gap-2 text-sm text-white/78">
              Фото
              <input className="field" name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-white/86">
          Имя и фамилия
          <input className="field" name="name" defaultValue={user.name} required />
        </label>

        <label className="grid gap-2 text-sm font-medium text-white/86">
          Пол
          <select className="field" name="gender" defaultValue={user.gender ?? ""} required>
            <option value="" disabled>
              Укажите Ваш пол
            </option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-white/86">
          Дата рождения
          <input className="field" name="birthDate" defaultValue={user.birthDate ?? ""} placeholder="ДД.ММ.ГГГГ" required />
        </label>

        <label className="grid gap-2 text-sm font-medium text-white/86">
          Город
          <input className="field" name="city" defaultValue={user.city ?? ""} required />
        </label>

        <label className="grid gap-2 text-sm font-medium text-white/86">
          Телефон
          <input className="field" name="phone" defaultValue={user.phone ?? ""} placeholder="+7(ХХХ)-ХХХ-ХХ-ХХ" required />
        </label>

        <label className="grid gap-2 text-sm font-medium text-white/86">
          E-mail
          <input className="field" name="email" type="email" defaultValue={user.email} required />
        </label>

        <label className="grid gap-2 text-sm font-medium text-white/86">
          Часовой пояс
          <select className="field" name="timeZone" defaultValue={user.timeZone}>
            {supportedTimeZones.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </select>
        </label>

        <div className="hidden md:block" />

        <label className="grid gap-2 text-sm font-medium text-white/86">
          Новый пароль
          <input className="field" name="password" type="password" placeholder="Минимум 6 символов" minLength={6} />
        </label>

        <label className="grid gap-2 text-sm font-medium text-white/86">
          Повторите пароль
          <input className="field" name="passwordRepeat" type="password" placeholder="Минимум 6 символов" minLength={6} />
        </label>

        {message ? <p className="text-sm text-[var(--gold-light)] md:col-span-2">{message}</p> : null}

        <button className="primary-button px-5 py-3 text-sm md:w-fit" disabled={isPending} type="submit">
          {isPending ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
