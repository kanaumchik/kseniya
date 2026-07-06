"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ProfileMenuProps = {
  name: string | null | undefined;
  role: "USER" | "ADMIN";
};

export function ProfileMenu({ name, role }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileLabel = formatProfileName(name);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="profile-button" 
        onClick={() => setIsOpen((current) => !current)} 
        type="button" 
        aria-expanded={isOpen}
        title={profileLabel}
      >
        <span className="profile-icon" aria-hidden="true">
          <svg className="size-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 20a7 7 0 0 0-14 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </span>
        <span className="text-sm font-semibold text-[var(--gold-light)]">Профиль</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-md border border-white/[0.1] bg-[#10100f] p-2 shadow-xl shadow-black/45">
          <Link className="block rounded px-3 py-2 text-sm font-medium text-white/82 transition hover:bg-white/[0.06] hover:text-[var(--gold-light)]" href="/profile">
            Профиль
          </Link>
          {role === "ADMIN" ? (
            <Link className="block rounded px-3 py-2 text-sm font-medium text-white/82 transition hover:bg-white/[0.06] hover:text-[var(--gold-light)]" href="/dashboard/schedule">
              Мое расписание
            </Link>
          ) : null}
          <Link className="block rounded px-3 py-2 text-sm font-medium text-white/82 transition hover:bg-white/[0.06] hover:text-[var(--gold-light)]" href="/dashboard/bookings">
            Мои записи
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function formatProfileName(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[1]} ${parts[0].slice(0, 1)}.`;
  }

  return parts[0] ?? "Профиль";
}
