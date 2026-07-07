"use client";

import Image from "next/image";
import { useActionState, useMemo, useRef, useState } from "react";
import { updateProfileAction } from "@/app/actions";
import { supportedTimeZones } from "@/lib/time";

type ProfileFormProps = {
  user: {
    email: string;
    publicId: number | null;
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
  const [firstName, lastName] = splitFullName(user.name);
  const phoneParts = splitPhone(user.phone);
  const [birthDate, setBirthDate] = useState(user.birthDate ?? "");
  const [phonePrefix, setPhonePrefix] = useState(phoneParts.prefix);
  const [phone, setPhone] = useState(phoneParts.local);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const allowSubmitRef = useRef(false);
  const formId = "profile-form";
  const profileTitle = [firstName, lastName].filter(Boolean).join(" ") || "Профиль";
  const currentPhoto = photoPreview ?? user.photoPath;
  const calendarValue = useMemo(() => toDateInputValue(birthDate), [birthDate]);

  return (
    <>
      <form
        action={formAction}
        className="mx-auto grid w-full max-w-4xl gap-5 px-4 py-8"
        encType="multipart/form-data"
        id={formId}
        onSubmit={(event) => {
          if (!allowSubmitRef.current) {
            event.preventDefault();
            setIsConfirmOpen(true);
            return;
          }

          allowSubmitRef.current = false;
          setIsConfirmOpen(false);
        }}
      >
        <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative size-24 overflow-hidden rounded-full border border-white/[0.12] bg-black/30">
              {currentPhoto ? <Image alt="Фото профиля" className="object-cover" fill src={currentPhoto} /> : null}
            </div>
            <div className="grid gap-3">
              <h1 className="font-serif text-3xl text-[var(--gold-light)]">{profileTitle}</h1>
              <p className="text-sm text-[var(--muted)]">ID {user.publicId ?? "будет назначен автоматически"}</p>
              <label className="secondary-button inline-flex w-fit items-center px-4 py-2 text-sm">
                Выберите файл
                <input
                  className="sr-only"
                  name="photo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setPhotoPreview(file ? URL.createObjectURL(file) : null);
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-white/86">
            Имя
            <input className="field" name="firstName" defaultValue={firstName} placeholder="Укажите Ваше имя" autoComplete="given-name" required />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white/86">
            Фамилия
            <input className="field" name="lastName" defaultValue={lastName} placeholder="Укажите Вашу фамилию" autoComplete="family-name" required />
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
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                className="field"
                name="birthDate"
                value={birthDate}
                onChange={(event) => setBirthDate(formatBirthDateInput(event.target.value))}
                placeholder="ДД.ММ.ГГГГ"
                inputMode="numeric"
                maxLength={10}
                required
              />
              <input
                aria-label="Выбрать дату рождения"
                className="field min-w-40"
                type="date"
                value={calendarValue}
                onChange={(event) => setBirthDate(fromDateInputValue(event.target.value))}
              />
            </div>
          </label>

          <label className="grid gap-2 text-sm font-medium text-white/86">
            Город
            <input className="field" name="city" defaultValue={user.city ?? ""} placeholder="Укажите Ваш город" autoComplete="address-level2" required />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white/86">
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
                name="phone"
                value={phone}
                onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
                placeholder="(ХХХ)-ХХХ-ХХ-ХХ"
                inputMode="tel"
                maxLength={15}
                required
              />
            </div>
          </label>

          <label className="grid gap-2 text-sm font-medium text-white/86">
            E-mail
            <input className="field" name="email" type="email" defaultValue={user.email} placeholder="you@example.com" autoComplete="email" required />
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

          <div className="md:col-span-2">
            <button className="secondary-button px-4 py-2 text-sm" type="button" onClick={() => setIsPasswordOpen((current) => !current)}>
              Изменить пароль
            </button>
          </div>

          {isPasswordOpen ? (
            <>
              <label className="grid gap-2 text-sm font-medium text-white/86">
                Текущий пароль
                <input className="field" name="currentPassword" type="password" placeholder="Укажите ваш текущий пароль" autoComplete="current-password" />
              </label>

              <label className="grid gap-2 text-sm font-medium text-white/86">
                Новый пароль
                <input className="field" name="password" type="password" placeholder="Минимум 6 символов" autoComplete="new-password" minLength={6} />
              </label>

              <label className="grid gap-2 text-sm font-medium text-white/86">
                Повторите пароль
                <input className="field" name="passwordRepeat" type="password" placeholder="Минимум 6 символов" autoComplete="new-password" minLength={6} />
              </label>
            </>
          ) : null}

          {message ? <p className="text-sm text-[var(--gold-light)] md:col-span-2">{message}</p> : null}

          <button className="primary-button px-5 py-3 text-sm md:w-fit" disabled={isPending} type="submit">
            {isPending ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>
      </form>

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl shadow-black">
            <p className="font-serif text-2xl text-[var(--gold-light)]">Вы уверены, что хотите сохранить изменения?</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="primary-button px-5 py-3 text-sm"
                form={formId}
                type="submit"
                disabled={isPending}
                onClick={() => {
                  allowSubmitRef.current = true;
                }}
              >
                Да
              </button>
              <button className="secondary-button px-5 py-3 text-sm" type="button" onClick={() => setIsConfirmOpen(false)}>
                Нет
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function splitFullName(name: string) {
  const [firstName = "", ...rest] = name.trim().split(/\s+/).filter(Boolean);

  return [firstName, rest.join(" ")] as const;
}

function splitPhone(phone: string | null) {
  const value = phone ?? "";
  const prefix = ["+375", "+380", "+996", "+7"].find((item) => value.startsWith(item)) ?? "+7";
  const local = value.startsWith(prefix) ? value.slice(prefix.length) : value;

  return {
    prefix,
    local: formatPhoneInput(local),
  };
}

function formatBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);

  return parts.join(".");
}

function toDateInputValue(value: string) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);

  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

function fromDateInputValue(value: string) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  return `${day}.${month}.${year}`;
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
