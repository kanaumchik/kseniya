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
      type={action || primaryForm ? "submit" : "button"}
    >
      {primaryLabel}
    </button>
  );
  const secondaryButton = (
    <button className="secondary-button min-h-12 w-full px-5 py-3 text-sm" type="button" onClick={onSecondary}>
      {secondaryLabel}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl overflow-hidden rounded-md border border-[rgba(232,197,122,0.22)] bg-[linear-gradient(145deg,rgba(21,20,18,0.98),rgba(9,9,8,0.98))] shadow-2xl shadow-black">
        <div className="p-5 sm:p-6">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">{eyebrow}</p> : null}
          <h2 className="mt-2 font-serif text-3xl leading-tight text-[var(--gold-light)]">{title}</h2>
          {description ? <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">{description}</p> : null}

          {children ? <div className="mt-5 rounded-md border border-[var(--line)] bg-black/25 p-4">{children}</div> : null}

          {action ? (
            <form action={action} className="mt-5 grid gap-3 sm:grid-cols-[1.2fr_1fr]">
              {hiddenFields.map((field) => (
                <input key={field.name} name={field.name} type="hidden" value={field.value ?? ""} />
              ))}
              {primaryButton}
              {secondaryButton}
            </form>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-[1.2fr_1fr]">
              {primaryButton}
              {secondaryButton}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
