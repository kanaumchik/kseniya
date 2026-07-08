import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthModal } from "@/components/AuthModal";
import { BookingCalendar } from "@/components/BookingCalendar";
import { BookingModal } from "@/components/BookingModal";
import { ProfileMenu } from "@/components/ProfileMenu";
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
  { href: "#project", label: "О проекте" },
  { href: "#sessions", label: "Сессии и сопровождение" },
  { href: "#about", label: "Обо мне" },
  { href: "#faq", label: "FAQ" },
  { href: "#diagnostic", label: "Диагностика" },
];

const supportPackages = [
  {
    title: "Запуск трансформации",
    text: "Стартовый пакет сессий для тех, кто хочет не ограничиваться одной сессией, а пройти первые этапы глубокой работы с поддержкой. Подходит, если у вас есть конкретный запрос, но вы пока не готовы заходить в длительное сопровождение.",
    details: ["2 расстановочные сессии по 90 минут", "1 поддерживающая сессия на 60 минут", "всего 3 часа индивидуальной работы", "срок сопровождения: 4 недели"],
    meta: ["Срок: 4 недели", "Объём: 3 часа индивидуальной работы", "Стоимость: 10 000 рублей"],
  },
  {
    title: "Глубина и поддержка",
    text: "Пакет сессий для тех, кто хочет пройти важную тему глубже, получить структуру и не остаться один на один с процессом изменений после сильной внутренней работы. Подходит для повторяющихся сценариев, внутреннего конфликта, отношений, денег, самореализации, кризиса или выбора.",
    details: ["4 расстановочные сессии по 90 минут", "2 поддерживающие сессии по 60 минут", "всего 8 часов индивидуального сопровождения", "срок сопровождения: 6-8 недель", "доступ к библиотеке практик"],
    meta: ["Срок: 6-8 недель", "Объём: 8 часов индивидуального сопровождения", "Стоимость: 20 000 рублей"],
  },
  {
    title: "От хаоса к гармонии и порядку",
    text: "Сопровождение для периода кризиса, сильных перемен или внутренней пересборки. Регулярный контакт, поддержка и постепенное восстановление внутреннего порядка.",
    details: ["4 глубокие расстановочные сессии по 90 минут", "4 поддерживающие сессии по 60 минут", "всего 10 часов индивидуального сопровождения", "срок сопровождения: 8-12 недель", "доступ к библиотеке практик"],
    meta: ["Срок: 8-12 недель", "Объём: 10 часов индивидуального сопровождения", "Стоимость: 24 000 рублей"],
  },
];

const authorPrograms = [
  {
    title: "Призвание и деньги: раскрыть потенциал и соединить внутреннюю реализацию с деньгами",
    text: "Подходит, если вы чувствуете, что способны на большее, но не понимаете, какое направление выбрать и как начать получать деньги через свои способности, опыт и глубину. Мы работаем с опытом, сильными сторонами, внутренними запретами, страхом проявляться, денежными сценариями и тем, как вы выбираете своё место в мире.",
    meta: ["Базовый маршрут: 6 недель - 30 000 рублей", "Глубокое погружение: 12 недель - 50 000 рублей"],
  },
  {
    title: "Деньги и финансовое расширение: от ограничений к зрелому финансовому мышлению, свободе действий и росту",
    text: "Программа для тех, кто хочет рост в доходе, масштабе и новых возможностях, но внутри сталкивается с напряжением и сопротивлением. Мы работаем с финансовым мышлением, денежными сценариями, ограничивающими убеждениями и внутренними настройками.",
    meta: ["Базовый маршрут: 4 недели - 20 000 рублей", "Глубокое погружение: 8 недель - 35 000 рублей"],
  },
  {
    title: "Освобождение и исцеление: от эмоциональной зависимости к здоровым отношениям с собой, другими и миром",
    text: "Программа для тех, кто устал терять себя в отношениях, ждать выбора другого человека, зависеть от его настроения, внимания, любви или признания. Мы работаем с привязанностью, границами, страхом одиночества, внутренней пустотой и сценариями слияния.",
    meta: ["Базовый маршрут: 4 недели - 16 000 рублей", "Глубокое погружение: 8 недель - 30 000 рублей"],
  },
];

const faqItems = [
  ["Чем диагностика отличается от сессии?", "Диагностика помогает определить запрос, увидеть текущую ситуацию и подобрать подходящий формат работы. Сессия - это уже глубокая проработка конкретной темы."],
  ["Можно ли прийти на одну сессию?", "Да. Разовая сессия подходит, если у вас есть конкретный запрос и вы хотите глубоко с ним поработать. Если в процессе станет понятно, что теме нужно больше времени, можно будет выбрать формат сопровождения."],
  ["Что такое поддерживающая сессия?", "Это встреча, на которой мы собираем опыт после глубокой работы, разбираем реакции и изменения, возвращаем фокус и помогаем новым осознаниям перейти в реальную жизнь."],
  ["Чем сопровождение отличается от программы?", "Сопровождение по запросу строится вокруг вашей конкретной темы. Авторская программа имеет последовательный маршрут и обязательные блоки, но сохраняет индивидуальную работу с тем, что поднимается именно у вас."],
  ["Можно ли выбрать формат после диагностики?", "Да. Диагностика как раз помогает понять, какой формат будет наиболее подходящим: разовая сессия, сопровождение по вашему запросу или авторская программа."],
];

export function DashboardHome({ id, name, email, role, timeZone, slots, users }: DashboardHomeProps) {
  const currentUser = id && name && email ? { id, name, email } : undefined;

  function renderBookingCta(label = "Записаться на диагностику", type: "DIAGNOSTIC" | "SESSION" = "DIAGNOSTIC") {
    if (!role) {
      return <AuthModal triggerLabel={label} variant="hero" />;
    }

    if (role === "ADMIN") {
      return (
        <BookingModal buttonLabel={label} title="Недоступно">
          <div className="rounded-md border border-[var(--line)] bg-black/20 p-5 text-sm text-white/82">
            Записаться на диагностику может только клиент
          </div>
        </BookingModal>
      );
    }

    return (
      <BookingModal buttonLabel={label} title={type === "SESSION" ? "Запись на сессию" : "Запись на диагностику"}>
        <BookingCalendar bookingType={type} currentUser={currentUser} role={role} slots={slots} timeZone={timeZone} users={users} />
      </BookingModal>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-6 px-5 py-3.5 lg:px-8">
          <Link href="/" className="min-w-[17rem] shrink-0 leading-none">
            <p className="whitespace-nowrap font-serif text-lg uppercase text-[var(--gold-light)] sm:text-xl">Ксения Наумчик</p>
            <p className="mt-1 max-w-[13rem] truncate text-[0.62rem] uppercase text-[var(--muted)] sm:max-w-none">
              Автор трансформационных программ
            </p>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 text-sm text-white/72 2xl:flex">
            {navItems.map((item) => (
              <a className="nav-link" href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            <button className="nav-link insight-nav-link hidden text-sm lg:inline-flex" type="button">
              <span aria-hidden="true">✦</span>
              <span>Получить подсказку</span>
            </button>
            {role ? <ProfileMenu name={name} role={role} /> : <AuthModal />}
          </div>
        </div>
      </header>

      <section className="relative min-h-[640px] overflow-hidden border-b border-[var(--line)]" id="project">
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
            <div className="mt-11 flex flex-wrap items-center gap-4" id="diagnostic">
              {renderBookingCta()}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell grid gap-10" id="sessions">
        <div className="max-w-4xl">
          <h2 className="font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">Индивидуальные сессии и сопровождение</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ServiceCard
            title="Диагностика"
            text="Диагностика - это первая встреча, на которой мы разбираем вашу текущую ситуацию. Мы определяем точку, в которой вы находитесь сейчас, и желаемую точку, смотрим, какие внутренние сценарии, чувства и установки удерживают вас в прежнем состоянии. В результате появляется больше ясности: с чем именно работать, какой формат подойдёт и какой маршрут приведет к изменениям. Продолжительность: 60 минут. Стоимость: 0 рублей."
            cta={renderBookingCta("ЗАПИСАТЬСЯ", "DIAGNOSTIC")}
          />
          <ServiceCard
            title="Сессия"
            text="Разовая сессия для глубокой работы с конкретным запросом: отношения, деньги, кризис, внутренний конфликт, повторяющийся сценарий или состояние, с которым не получается справиться. Подходит, если вы хотите соприкоснуться с корнем проблемы и начать внутреннее движение к новому состоянию. Продолжительность: 90 минут. Стоимость: 4000 рублей."
            cta={renderBookingCta("ЗАПИСАТЬСЯ", "SESSION")}
          />
        </div>

        <ContentBlock
          title="Индивидуальное сопровождение по Вашему запросу"
          text="Расстановочные сессии помогают увидеть скрытые причины ситуации: внутренние сценарии, эмоциональные блоки, повторяющиеся реакции и связи, которые удерживают вас в прежнем состоянии. Это глубокая работа с корнем запроса, внутренними конфликтами и теми местами, где застревает энергия. Поддерживающие сессии помогают интегрировать опыт после глубокой работы, закрепить изменения и понять, как применять новые осознания в жизни."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {supportPackages.map((item) => (
            <PackageCard item={item} key={item.title} />
          ))}
        </div>

        <ContentBlock
          title="Индивидуальное сопровождение по авторским программам"
          text="В этом формате я веду вас по последовательным блокам программы, с глубокой индивидуальной работой. Каждая программа включает расстановочные сессии на ключевые темы, поддерживающие сессии и дополнительные самостоятельные задания. Базовый маршрут - короткий структурированный формат по выбранной теме. Глубокое погружение - расширенный формат индивидуального сопровождения, когда важно пройти программу глубже и объёмнее."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {authorPrograms.map((item) => (
            <ProgramCard item={item} key={item.title} />
          ))}
        </div>

        <ContentBlock
          title="Как выбрать формат"
          text="Если вы пока не понимаете, с чем именно работать - начните с диагностики. Если есть один точечный запрос или вы хотите попробовать метод в работе - подойдёт разовая сессия. Если тема объемная, но вы хотите мягко войти в процесс - подойдёт «Запуск трансформации». Для более глубокого внимания подойдёт «Глубина и поддержка». В кризисе или периоде пересборки - «От хаоса к гармонии и порядку». Для последовательного маршрута по теме призвания, денег или отношений - индивидуальное сопровождение по авторской программе."
        />
      </section>

      <section className="section-shell" id="faq">
        <h2 className="font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">FAQ</h2>
        <div className="mt-6 grid gap-3">
          {faqItems.map(([question, answer]) => (
            <details className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-4 py-3" key={question}>
              <summary className="cursor-pointer font-semibold text-white">{question}</summary>
              <p className="mt-3 text-sm leading-6 text-white/72">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[var(--line)] px-6 py-12 lg:px-10" id="about">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_auto]">
          <p className="max-w-4xl font-serif text-2xl uppercase leading-relaxed text-[var(--gold-light)]">
            СЕЙЧАС ВАЖЕН НЕ НОВЫЙ РЫВОК, А ВОЗМОЖНОСТЬ УВИДЕТЬ, ЧТО ИМЕННО УДЕРЖИВАЕТ НА МЕСТЕ
          </p>
        </div>
      </section>
    </main>
  );
}

function ServiceCard({ title, text, cta }: { title: string; text: string; cta: ReactNode }) {
  return (
    <article className="gold-card grid gap-4 p-5">
      <h3 className="font-serif text-2xl text-[var(--gold-light)]">{title}</h3>
      <p className="text-sm leading-7 text-white/74">{text}</p>
      <div>{cta}</div>
    </article>
  );
}

function ContentBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="max-w-5xl">
      <h3 className="font-serif text-2xl text-[var(--gold-light)]">{title}</h3>
      <p className="mt-3 text-base leading-8 text-white/72">{text}</p>
    </div>
  );
}

function PackageCard({ item }: { item: { title: string; text: string; details: string[]; meta: string[] } }) {
  return (
    <article className="gold-card grid gap-3 p-5">
      <h4 className="font-serif text-xl text-[var(--gold-light)]">{item.title}</h4>
      <p className="text-sm leading-6 text-white/72">{item.text}</p>
      <ul className="grid gap-1 text-sm text-white/70">
        {item.details.map((detail) => (
          <li key={detail}>- {detail}</li>
        ))}
      </ul>
      <div className="grid gap-1 text-sm font-semibold text-white/86">
        {item.meta.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <button className="primary-button mt-2 w-fit px-5 py-3 text-sm" type="button">
        КУПИТЬ
      </button>
    </article>
  );
}

function ProgramCard({ item }: { item: { title: string; text: string; meta: string[] } }) {
  return (
    <article className="gold-card grid gap-3 p-5">
      <h4 className="font-serif text-xl text-[var(--gold-light)]">{item.title}</h4>
      <p className="text-sm leading-6 text-white/72">{item.text}</p>
      <div className="grid gap-1 text-sm font-semibold text-white/86">
        {item.meta.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <button className="primary-button mt-2 w-fit px-5 py-3 text-sm" type="button">
        КУПИТЬ
      </button>
    </article>
  );
}
