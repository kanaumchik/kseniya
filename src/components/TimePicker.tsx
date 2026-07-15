"use client";

import { useEffect, useRef, useState } from "react";

type TimePickerProps = {
  name: string;
  required?: boolean;
};

const timeOptions = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);

export function TimePicker({ name, required }: TimePickerProps) {
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="relative w-full" ref={rootRef}>
      <input name={name} type="hidden" value={value} />
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="field flex w-full items-center gap-3 px-3 text-left"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(216,179,90,0.22)] text-[var(--gold-light)]">
          <ClockIcon />
        </span>
        <span className={value ? "flex-1 text-white" : "flex-1 text-[var(--muted)]"}>{value || "--:--"}</span>
        <ChevronIcon open={isOpen} />
      </button>

      {required ? (
        <input
          aria-label="Время"
          className="pointer-events-none absolute bottom-0 left-1/2 size-px opacity-0"
          onChange={() => undefined}
          onInvalid={(event) => {
            event.preventDefault();
            setIsOpen(true);
          }}
          required
          tabIndex={-1}
          value={value}
        />
      ) : null}

      {isOpen ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.4rem)] z-[90] max-h-72 overflow-y-auto rounded-xl border border-[rgba(216,179,90,0.3)] bg-[#0b0b0b] p-2 shadow-2xl shadow-black">
          <div role="listbox" aria-label="Выберите время">
            {timeOptions.map((time) => (
              <button
                aria-selected={value === time}
                className={value === time ? "block w-full rounded-lg bg-[linear-gradient(90deg,rgba(216,179,90,0.42),rgba(216,179,90,0.12))] px-4 py-3 text-left font-semibold text-[var(--gold-light)]" : "block w-full rounded-lg border-b border-white/[0.06] px-4 py-3 text-left text-white/88 transition last:border-0 hover:bg-white/[0.06] hover:text-[var(--gold-light)]"}
                key={time}
                onClick={() => {
                  setValue(time);
                  setIsOpen(false);
                }}
                role="option"
                type="button"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ClockIcon() {
  return <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" /><path d="M12 7.5V12l3.2 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></svg>;
}

function ChevronIcon({ open }: { open: boolean }) {
  return <svg aria-hidden="true" className={`size-5 shrink-0 text-[var(--gold-light)] transition ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}
