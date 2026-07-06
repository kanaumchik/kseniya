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
  name: string | null | undefined;
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

const symptoms = [
  ["01", "Вы чувствуете, что находитесь в переходе, но не понимаете, куда двигаться дальше."],
  ["02", "Внешне всё может быть нормально, но внутри есть усталость, тревога или потеря себя."],
  ["03", "Вы многое понимаете умом, но в жизни повторяются одни и те же сценарии."],
  ["04", "Есть желание выйти на новый уровень в деньгах, реализации, отношениях или внутреннем состоянии."],
  ["05", "Вы чувствуете, что старые способы больше не работают."],
];

const steps = [
  ["Точка А", "что происходит сейчас"],
  ["Точка Б", "куда вы хотите прийти"],
  ["Внутреннее препятствие", "что удерживает"],
  ["Ресурс", "что уже есть внутри"],
  ["Следующий шаг", "куда двигаться дальше"],
];

const themes = [
  "Кризис перехода",
  "Потеря опоры",
  "Тревожность и внутреннее напряжение",
  "Выход из старых сценариев",
  "Деньги и реализация",
  "Призвание и поиск своего пути",
  "Отношения и зависимые сценарии",
  "Страх проявляться",
  "Ощущение, что вы живёте не свою жизнь",
];

export function DashboardHome({ name, role, timeZone, slots, users, year, month }: DashboardHomeProps) {
  const bookingTitle = role === "ADMIN" ? "Календарь и управление слотами" : "Выберите дату и время";

  function renderBookingCta() {
    if (!role) {
      return <AuthModal triggerLabel="Записаться на диагностику" variant="hero" />;
    }

    return (
      <BookingModal buttonLabel="Записаться на диагностику" title={bookingTitle}>
        <BookingCalendar role={role} slots={slots} timeZone={timeZone} users={users} year={year} month={month} />
      </BookingModal>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 lg:px-10">
          <Link href="/" className="min-w-0 leading-none">
            <p className="font-serif text-lg uppercase text-[var(--gold-light)] sm:text-xl">Ксения Наумчик</p>
            <p className="mt-1 max-w-[13rem] truncate text-[0.62rem] uppercase text-[var(--muted)] sm:max-w-none">
              Автор трансформационных программ
            </p>
          </Link>

          <nav className="hidden items-center gap-1.5 text-sm text-white/72 xl:flex">
            {navItems.map((item) => (
              <button className="nav-link" key={item} type="button">
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="nav-link insight-nav-link hidden text-sm sm:inline-flex" type="button">
              <span aria-hidden="true">✦</span>
              <span>Получить подсказку</span>
            </button>
            {role ? <ProfileMenu name={name} /> : null}
            {role ? <SignOutButton /> : <AuthModal />}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,#050505_0%,#080706_44%,rgba(5,5,5,0.52)_100%)]" />
        <div className="mx-auto grid min-h-[640px] max-w-7xl grid-cols-1 items-stretch lg:grid-cols-[0.84fr_1.16fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-16 sm:px-10 lg:py-20 lg:pl-20">
            <p className="hero-kicker">Диагностика состояния и запроса</p>
            <h1 className="mt-5 max-w-[36rem] font-serif text-[2.7rem] leading-[1.04] text-[var(--gold-light)] sm:text-[4rem] lg:text-[4.35rem]">
              Верни свою силу, раскрой потенциал и познакомься с собой новым
            </h1>
            <p className="mt-6 max-w-[31rem] text-lg leading-8 text-white/76">
              Пространство для поддержки, трансформации и переосмысления опыта с системным подходом и глубиной
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              {renderBookingCta()}
            </div>
          </div>

          <div className="relative min-h-[420px] lg:min-h-[620px]">
            <Image
              alt="Психолог в тёмном интерьере"
              className="object-cover object-center opacity-[0.88]"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 54vw"
              src="/images/xeniia-naumchik-hero.png"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.72)_18%,rgba(5,5,5,0.1)_48%),linear-gradient(0deg,#050505_0%,transparent_30%)]" />
          </div>
        </div>
      </section>

      <section className="section-shell" id="diagnostics">
        <p className="section-title">Когда диагностика может быть для вас</p>
        <div className="mt-5 grid gap-4 md:grid-cols-5">
          {symptoms.map(([number, text]) => (
            <article className="gold-card flex min-h-48 flex-col items-center justify-center px-4 py-6 text-center" key={number}>
              <div className="mb-5 flex size-9 items-center justify-center rounded-full border border-[var(--gold)] text-[var(--gold)]">✧</div>
              <p className="font-serif text-lg text-[var(--gold-light)]">{number}</p>
              <p className="mt-3 text-sm leading-6 text-white/74">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
          <div>
            <h2 className="font-serif text-3xl uppercase leading-tight text-[var(--gold-light)]">
              Диагностика —<br /> это не просто разговор
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/68">
              Мы смотрим не только на ситуацию, но и на внутреннюю структуру: где вы сейчас, к чему стремитесь, что уже пробовали и что удерживает вас в прежней точке.
            </p>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/68">
              Формат помогает не просто понять проблему, а соприкоснуться с тем, что за ней стоит.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-5">
            {steps.map(([title, text], index) => (
              <div className="relative text-center" key={title}>
                <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-[var(--gold)] text-xl text-[var(--gold)]">
                  {index + 1}
                </div>
                <p className="mt-5 font-serif text-base text-[var(--gold-light)]">{title}</p>
                <p className="mt-2 text-xs leading-5 text-white/62">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <p className="section-title">Темы, с которыми можно прийти</p>
        <div className="mt-5 grid gap-x-10 gap-y-3 md:grid-cols-3">
          {themes.map((theme) => (
            <div className="flex items-center gap-3 text-sm text-white/72" key={theme}>
              <span className="text-[var(--gold)]">⊹</span>
              <span>{theme}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)]" id="approach">
        <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-3">
          <article className="px-6 py-10 lg:px-10">
            <h2 className="font-serif text-2xl uppercase text-[var(--gold-light)]">Мой подход</h2>
            <p className="mt-7 text-sm leading-7 text-white/68">
              Я работаю не с поверхностью, а с причиной. Иногда человек думает, что проблема в деньгах, отношениях или выборе, но глубже может быть старый запрет, фиксация, страх выбора или потеря контакта с собой.
            </p>
            <p className="mt-5 text-sm leading-7 text-white/68">
              В работе важно не сломать себя, а увидеть, что на самом деле управляет состоянием, и вернуть себе право выбирать.
            </p>
          </article>

          <article className="gold-card m-0 rounded-none px-6 py-10 lg:px-10" id="format">
            <p className="section-title text-left">Формат</p>
            <h3 className="mt-5 font-serif text-2xl text-[var(--gold-light)]">Диагностическая сессия</h3>
            <p className="mt-4 text-sm leading-7 text-white/72">
              Продолжительность: 120 минут. Онлайн. Подходит для первого знакомства и первичного разбора запроса.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-white/70">
              <li>• вашу текущую точку</li>
              <li>• желаемую точку</li>
              <li>• ключевое внутреннее препятствие</li>
              <li>• возможный вектор дальнейшей работы</li>
            </ul>
          </article>

          <article className="relative overflow-hidden px-6 py-10 lg:px-10" id="about">
            <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(214,170,79,0.2),transparent_66%)]" />
            <h2 className="font-serif text-2xl uppercase text-[var(--gold-light)]">Обо мне</h2>
            <p className="mt-7 text-sm leading-7 text-white/68">
              Я работаю с людьми в периодах перехода, внутреннего кризиса, поиска себя, выхода из старых сценариев и возвращения к своей силе.
            </p>
            <p className="mt-5 text-sm leading-7 text-white/68">
              Для меня важно не вести человека в готовый шаблон, а помочь ему увидеть свою правду, свою опору и свой следующий шаг.
            </p>
          </article>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-12 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_auto]">
          <p className="max-w-2xl font-serif text-2xl uppercase leading-relaxed text-[var(--gold-light)]">
            Возможно, сейчас вам не нужен новый рывок. Возможно, сначала нужно увидеть, что именно удерживает вас на месте.
          </p>
        </div>
      </section>
    </main>
  );
}
