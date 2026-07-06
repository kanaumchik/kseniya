"use client";

import { useEffect, useState, type ReactNode } from "react";

type BookingModalProps = {
  buttonLabel: string;
  title: string;
  children: ReactNode;
  variant?: "primary" | "nav";
};

export function BookingModal({ buttonLabel, title, children, variant = "primary" }: BookingModalProps) {
  const [isOpen, setIsOpen] = useState(false);

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
      <button className={variant === "nav" ? "nav-gold-button" : "hero-gold-button"} onClick={() => setIsOpen(true)} type="button">
        {buttonLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl shadow-black">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--gold)]">Запись</p>
                <h2 className="mt-2 font-serif text-3xl text-[var(--gold-light)]">{title}</h2>
              </div>
              <button className="secondary-button px-3 py-2 text-sm" onClick={() => setIsOpen(false)} type="button" aria-label="Закрыть">
                Закрыть
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
