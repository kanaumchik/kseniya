"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DatePickerProps = {
  ariaLabel?: string;
  defaultValue?: string;
  max?: string;
  min?: string;
  name?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value?: string;
};

const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function DatePicker({ ariaLabel = "Выберите дату", defaultValue = "", max, min, name, onChange, placeholder = "Выберите дату", required, value }: DatePickerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = value ?? internalValue;
  const initialMonth = getInitialMonth(selectedValue, min, max);
  const [visibleYear, setVisibleYear] = useState(initialMonth.year);
  const [visibleMonth, setVisibleMonth] = useState(initialMonth.month);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const days = useMemo(() => getCalendarDays(visibleYear, visibleMonth), [visibleMonth, visibleYear]);
  const years = getYearRange(min, max);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function selectDate(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
    setIsOpen(false);
  }

  function changeMonth(delta: number) {
    const next = new Date(Date.UTC(visibleYear, visibleMonth + delta, 1));
    setVisibleYear(next.getUTCFullYear());
    setVisibleMonth(next.getUTCMonth());
  }

  function openCalendar() {
    if (selectedValue) {
      const selected = parseDateKey(selectedValue);
      if (selected) {
        setVisibleYear(selected.year);
        setVisibleMonth(selected.month - 1);
      }
    }
    setIsOpen((current) => !current);
  }

  const previousMonthKey = monthKey(visibleYear, visibleMonth - 1);
  const nextMonthKey = monthKey(visibleYear, visibleMonth + 1);
  const minMonth = min?.slice(0, 7);
  const maxMonth = max?.slice(0, 7);

  return (
    <div className="relative w-full" ref={rootRef}>
      {name ? <input name={name} type="hidden" value={selectedValue} /> : null}
      <button
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className="field flex w-full items-center justify-between gap-3 text-left"
        data-required={required || undefined}
        onClick={openCalendar}
        type="button"
      >
        <span className={selectedValue ? "text-white" : "text-[var(--muted)]"}>{selectedValue ? formatDate(selectedValue) : placeholder}</span>
        <CalendarIcon />
      </button>
      {required ? (
        <input
          aria-label={ariaLabel}
          className="pointer-events-none absolute bottom-0 left-1/2 size-px opacity-0"
          onChange={() => undefined}
          onInvalid={(event) => {
            event.preventDefault();
            setIsOpen(true);
          }}
          required
          tabIndex={-1}
          value={selectedValue}
        />
      ) : null}

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-[80] w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-slate-200 bg-white p-4 text-slate-950 shadow-2xl sm:p-5">
          <div className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3">
            <button aria-label="Предыдущий месяц" className="flex size-12 items-center justify-center rounded-2xl border border-slate-200 text-2xl text-slate-700 transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-30" disabled={Boolean(minMonth && previousMonthKey < minMonth)} onClick={() => changeMonth(-1)} type="button">
              ‹
            </button>
            <div className="flex min-w-0 items-center justify-center gap-2">
              <span className="text-lg font-bold capitalize">{monthNames[visibleMonth]}</span>
              <select aria-label="Год" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-base font-semibold outline-none focus:border-blue-500" value={visibleYear} onChange={(event) => setVisibleYear(Number(event.target.value))}>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <button aria-label="Следующий месяц" className="flex size-12 items-center justify-center rounded-2xl border border-slate-200 text-2xl text-slate-700 transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-30" disabled={Boolean(maxMonth && nextMonthKey > maxMonth)} onClick={() => changeMonth(1)} type="button">
              ›
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
            {weekDays.map((day) => <span className="py-2 text-sm font-semibold text-slate-400" key={day}>{day}</span>)}
            {days.map((day) => {
              const disabled = Boolean((min && day.dateKey < min) || (max && day.dateKey > max));
              const selected = day.dateKey === selectedValue;
              const today = day.dateKey === todayKey();
              return (
                <button
                  aria-label={formatDate(day.dateKey)}
                  className={[
                    "mx-auto flex size-10 items-center justify-center rounded-xl text-sm font-semibold transition",
                    day.currentMonth ? "text-slate-950" : "text-slate-300",
                    !disabled ? "hover:bg-blue-50 hover:text-blue-600" : "cursor-not-allowed opacity-35",
                    today && !selected ? "border border-blue-400" : "",
                    selected ? "bg-blue-600 !text-white shadow-lg shadow-blue-200" : "",
                  ].join(" ")}
                  disabled={disabled}
                  key={day.dateKey}
                  onClick={() => selectDate(day.dateKey)}
                  type="button"
                >
                  {day.day}
                </button>
              );
            })}
          </div>

          <button className="mt-4 w-full rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold transition hover:border-blue-500 hover:text-blue-600" disabled={Boolean((min && todayKey() < min) || (max && todayKey() > max))} onClick={() => selectDate(todayKey())} type="button">
            Сегодня
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getCalendarDays(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const start = new Date(Date.UTC(year, month, 1 - offset));
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getTime() + index * 86400000);
    return { currentMonth: date.getUTCMonth() === month, dateKey: date.toISOString().slice(0, 10), day: date.getUTCDate() };
  });
}

function getInitialMonth(value?: string, min?: string, max?: string) {
  const parsed = parseDateKey(value || min || max || todayKey());
  return parsed ? { year: parsed.year, month: parsed.month - 1 } : { year: new Date().getFullYear(), month: new Date().getMonth() };
}

function getYearRange(min?: string, max?: string) {
  const currentYear = new Date().getFullYear();
  const first = parseDateKey(min ?? "")?.year ?? 1900;
  const last = parseDateKey(max ?? "")?.year ?? currentYear + 10;
  return Array.from({ length: Math.max(1, last - first + 1) }, (_, index) => last - index);
}

function parseDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) } : null;
}

function monthKey(year: number, month: number) {
  return new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 7);
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatDate(value: string) {
  const parsed = parseDateKey(value);
  return parsed ? `${String(parsed.day).padStart(2, "0")}.${String(parsed.month).padStart(2, "0")}.${parsed.year}` : value;
}

function CalendarIcon() {
  return <svg aria-hidden="true" className="size-5 shrink-0 text-[var(--gold-light)]" fill="none" viewBox="0 0 24 24"><path d="M7 3v3M17 3v3M4.5 9.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}
