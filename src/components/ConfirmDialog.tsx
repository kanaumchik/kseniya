"use client";

import { useEffect, type ReactNode } from "react";

type HiddenField = {
  name: string;
  value: string | number | null | undefined;
};

type ConfirmDialogProps = {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  children?: ReactNode;
  action?: (formData: FormData) => void | Promise<void>;
  hiddenFields?: HiddenField[];
  primaryLabel: string;
  secondaryLabel: string;
  primaryDisabled?: boolean;
  primaryForm?: string;
  onPrimaryClick?: () => void;
  onSecondary: () => void;
  secondarySubmits?: boolean;
  secondaryFirst?: boolean;
};

export function ConfirmDialog({
  title,
  eyebrow,
  description,
  children,
  action,
  hiddenFields = [],
  primaryLabel,
  secondaryLabel,
  primaryDisabled,
  primaryForm,
  onPrimaryClick,
  onSecondary,
  secondarySubmits = false,
  secondaryFirst = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onSecondary();
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onSecondary]);

  const primaryButton = (
    <button
      className="primary-button min-h-14 w-full px-5 py-3 text-base"
      disabled={primaryDisabled}
      form={primaryForm}
      onClick={onPrimaryClick}
      type={primaryForm || (!onPrimaryClick && action) ? "submit" : "button"}
    >
      {primaryLabel}
    </button>
  );
  const secondaryButton = (
    <button className="secondary-button min-h-10 w-full px-4 py-2.5 text-sm" type={secondarySubmits ? "submit" : "button"} onClick={secondarySubmits ? undefined : onSecondary}>
      {secondaryLabel}
    </button>
  );
  const buttons = secondaryFirst ? [secondaryButton, primaryButton] : [primaryButton, secondaryButton];
  const buttonGridClassName = secondaryFirst ? "mt-5 grid gap-3 sm:grid-cols-[0.9fr_1.2fr]" : "mt-5 grid gap-3 sm:grid-cols-[1.2fr_1fr]";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onSecondary();
        }
      }}
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-md border border-[rgba(232,197,122,0.22)] bg-[linear-gradient(145deg,rgba(21,20,18,0.98),rgba(9,9,8,0.98))] shadow-2xl shadow-black">
        <button className="icon-button absolute right-4 top-4 z-10" type="button" onClick={onSecondary} aria-label="Закрыть">
          ×
        </button>
        <div className="p-5 sm:p-6">
          {eyebrow ? <p className="pr-12 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">{eyebrow}</p> : null}
          <h2 className="mt-2 pr-12 font-serif text-3xl leading-tight text-[var(--gold-light)]">{title}</h2>
          {description ? <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">{description}</p> : null}

          {children ? <div className="mt-5 rounded-md border border-[var(--line)] bg-black/25 p-4">{children}</div> : null}

          {action ? (
            <form action={action} className={buttonGridClassName}>
              {hiddenFields.map((field) => (
                <input key={field.name} name={field.name} type="hidden" value={field.value ?? ""} />
              ))}
              {buttons}
            </form>
          ) : (
            <div className={buttonGridClassName}>
              {buttons}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
