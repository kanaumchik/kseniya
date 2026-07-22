"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

type BookingModalProps = {
  buttonLabel: string;
  title: string;
  children: ReactNode;
  variant?: "primary" | "nav" | "secondary";
  buttonClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function BookingModal({ buttonLabel, title, children, variant = "primary", buttonClassName, open, onOpenChange }: BookingModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = open ?? internalIsOpen;
  const triggerClassName = [variant === "nav" ? "nav-gold-button" : variant === "secondary" ? "secondary-button" : "hero-gold-button", buttonClassName]
    .filter(Boolean)
    .join(" ");
  const setIsOpen = useCallback((nextOpen: boolean) => {
    onOpenChange?.(nextOpen);

    if (open === undefined) {
      setInternalIsOpen(nextOpen);
    }
  }, [onOpenChange, open]);

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
  }, [isOpen, setIsOpen]);

  return (
    <>
      <button className={triggerClassName} onClick={() => setIsOpen(true)} type="button">
        {buttonLabel}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="relative my-auto max-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-y-auto rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl shadow-black">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--gold)]">Диагностика</p>
                <h2 className="mt-2 font-serif text-3xl text-[var(--gold-light)]">{title}</h2>
              </div>
              <button className="icon-button" onClick={() => setIsOpen(false)} type="button" aria-label="Закрыть">
                ×
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
