import Image from "next/image";
import Link from "next/link";
import { AuthModal } from "@/components/AuthModal";
import { BookingCalendar } from "@/components/BookingCalendar";
import { BookingModal } from "@/components/BookingModal";
import { ProfileMenu } from "@/components/ProfileMenu";
import { SignOutButton } from "@/components/SignOutButton";
import { type Slot } from "@/lib/slots";

type UserOption = {
  id: string;
  name: string;
  email: string;
};

type DashboardHomeProps = {
  id: string | null | undefined;
  name: string | null | undefined;
  email: string | null | undefined;
  role: "USER" | "ADMIN" | null;
  timeZone: string;
  slots: Slot[];
  users: UserOption[];
  year: number;
  month: number;
};

const navItems = [
  "О проекте",
  "Сессии и программы",
  "Диагностика",
  "Обо мне",
];

export function DashboardHome({ id, name, email, role, timeZone, slots, users }: DashboardHomeProps) {
  const bookingTitle = "Запись на диагностику";
  const currentUser = id && name && email ? { id, name, email } : undefined;

  function renderBookingCta() {
    if (!role) {
      return <AuthModal triggerLabel="Записаться на диагностику" variant="hero" />;
    }

    return (
      <BookingModal buttonLabel="Записаться на диагностику" title={bookingTitle}>
        <BookingCalendar currentUser={currentUser} role={role} slots={slots} timeZone={timeZone} users={users} />
      </BookingModal>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3.5 lg:px-10">
          <Link href="/" className="min-w-0 leading-none">
            <p className="font-serif text-lg uppercase text-[var(--gold-light)] sm:text-xl">Ксения Наумчик</p>
            <p className="mt-1 max-w-[13rem] truncate text-[0.62rem] uppercase text-[var(--muted)] sm:max-w-none">
              Автор трансформационных программ
            </p>
          </Link>

          <nav className="hidden items-center justify-center gap-1.5 text-sm text-white/72 xl:flex">
            {navItems.map((item) => (
              <button className="nav-link" key={item} type="button">
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button className="nav-link insight-nav-link hidden text-sm sm:inline-flex" type="button">
              <span aria-hidden="true">✦</span>
              <span>Получить подсказку</span>
            </button>
            {role ? <ProfileMenu name={name} role={role} /> : null}
            {role ? <SignOutButton /> : <AuthModal />}
          </div>
        </div>
      </header>

      <section className="relative min-h-[640px] overflow-hidden border-b border-[var(--line)]">
        <Image
          alt="Психолог в тёмном интерьере"
          className="hero-image object-cover object-center"
          fill
          priority
          sizes="100vw"
          src="/images/xeniia-naumchik-hero.png"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.5)_0%,rgba(5,5,5,0.42)_24%,rgba(5,5,5,0.22)_52%,rgba(5,5,5,0.02)_100%),linear-gradient(0deg,#050505_0%,rgba(5,5,5,0.06)_24%,rgba(5,5,5,0)_58%)]" />
        <div className="relative z-10 mx-auto grid min-h-[640px] max-w-7xl grid-cols-1 items-stretch">
          <div className="flex max-w-[47rem] flex-col justify-center px-6 py-14 sm:px-10 lg:-mt-8 lg:py-20 lg:pl-20">
            <h1 className="max-w-[44rem] font-serif text-[2.55rem] leading-[1.07] text-[var(--gold-light)] sm:text-[3.75rem] lg:text-[4.05rem]">
              Верни свою силу, раскрой потенциал и познакомься с собой новым
            </h1>
            <p className="mt-6 max-w-[42rem] text-lg leading-8 text-white/78 sm:text-xl">
              Пространство для поддержки, трансформации
              <br />
              и переосмысления опыта с системным подходом и глубиной
            </p>
            <div className="mt-11 flex flex-wrap items-center gap-4">
              {renderBookingCta()}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[var(--line)] px-6 py-12 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_auto]">
          <p className="max-w-4xl font-serif text-2xl uppercase leading-relaxed text-[var(--gold-light)]">
            СЕЙЧАС ВАЖЕН НЕ НОВЫЙ РЫВОК, А ВОЗМОЖНОСТЬ УВИДЕТЬ, ЧТО ИМЕННО УДЕРЖИВАЕТ НА МЕСТЕ
          </p>
        </div>
      </section>
    </main>
  );
}
