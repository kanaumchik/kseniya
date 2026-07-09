"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
  { href: "#about", label: "Обо мне" },
  { href: "#diagnostic", label: "Диагностика" },
  { href: "#sessions", label: "Сессии и сопровождение" },
  { href: "#faq", label: "FAQ" },
];

const footerLegalLinks = [
  { href: "/legal/offer", label: "Публичная оферта" },
  { href: "/legal/terms", label: "Пользовательское соглашение" },
  { href: "/legal/privacy-policy", label: "Политика обработки персональных данных" },
  { href: "/legal/personal-data-consent", label: "Согласие на обработку персональных данных" },
  { href: "/legal/sensitive-data-consent", label: "Согласие на обработку специальных категорий персональных данных" },
  { href: "/legal/cookie-policy", label: "Политика cookie" },
  { href: "/legal/booking-rules", label: "Правила записи и отмены" },
  { href: "/legal/informed-consent", label: "Информированное согласие на психологические услуги" },
  { href: "/legal/contacts", label: "Контакты и реквизиты" },
  { href: "/legal/marketing-consent", label: "Согласие на рекламные и информационные сообщения" },
  { href: "/legal/review-consent", label: "Согласие на публикацию отзыва" },
];

const supportPackages = [
  {
    title: "Запуск трансформации",
    text: "Стартовый пакет сессий для тех, кто хочет не ограничиваться одной сессией, а пройти первые этапы глубокой работы с поддержкой и запустить трансформацию, чтобы дальше пройти самостоятельно. Подходит, если у вас есть конкретный запрос, но вы пока не готовы заходить в длительное сопровождение.",
    details: ["2 расстановочные сессии по 90 минут", "1 поддерживающая сессия на 60 минут", "всего 4 часа индивидуальной работы"],
    meta: ["Срок: 3-4 недели", "Объём: 3 сессии", "Стоимость: 10 000 рублей"],
  },
  {
    title: "Глубина и поддержка",
    text: "Формат для тех, кто готов идти в трансформацию глубже и с поддержкой. Подходит для объёмных запросов, связанных с отношениями, деньгами, самореализацией, повторяющимися сценариями или внутренними ограничениями. Здесь больше времени на проживание, внимания к нюансам запроса и больше поддержки для осознания и преодоления сопротивления, чтобы новый опыт постепенно становилися частью жизни.",
    details: ["4 расстановочные сессии по 90 минут", "2 поддерживающие сессии по 60 минут", "всего 8 часов индивидуальной работы"],
    meta: ["Срок: 6-8 недель", "Объём: 6 сессий", "Стоимость: 20 000 рублей"],
  },
  {
    title: "От хаоса к гармонии и порядку",
    text: "Сопровождение для периода кризиса, сильных перемен или внутренней пересборки. Подходит при разводе, разрыве отношений, увольнении, потере опоры или состоянии, когда старое уже не работает, а новое ещё не создано. В программе мы чередуем глубокие расстановочные сессии и поддерживающие встречи, чтобы пройти острый период, вернуть опору, собрать ясность и постепенно перейти к новым действиям.",
    details: ["4 глубокие расстановочные сессии по 90 минут", "4 поддерживающие сессии по 60 минут", "всего 10 часов индивидуальной работы"],
    meta: ["Срок: 8-12 недель", "Объём: 8 сессий", "Стоимость: 24 000 рублей"],
  },
];

const authorPrograms = [
  {
    title: "Призвание и деньги: раскрыть потенциал и соединить внутреннюю реализацию с деньгами",
    text: "Программа для тех, кто чувствует, что способен на большее и хочет соединить реализацию с доходом и ясным направлением. Подойдёт тем, кто ищет себя, новый профессиональный вектор или хочет перейти из найма в своё дело. В программе мы смотрим, что уже есть внутри вашего опыта, что мешают двигаться дальше, работаем с финансовым мышлением, денежными сценариями и страхом проявляться. Цель программы — увидеть своё направление, собрать внутреннюю опору в реализации и понять, как формировать ценность для других, чтобы она могла становиться источником дохода и большего масштаба.",
    meta: [],
  },
  {
    title: "Деньги и финансовое расширение: от ограничений к зрелому финансовому мышлению, свободе действий и росту",
    text: "Программа для тех, кто хочет расти в доходе, масштабе и свободе действий, но внутри сталкивается с напряжением, ограничениями или сопротивлением.  Мы работаем с финансовым мышлением, денежными сценариями, внутренними запретами, установками и образами, которые мешают зрелому контакту с деньгами.  Цель программы — изменить восприятие денег и дохода, убрать лишнее напряжение и выстроить более взрослую систему обмена с миром.",
    meta: [],
  },
  {
    title: "Освобождение и исцеление: от эмоциональной зависимости к здоровым отношениям с собой, другими и миром",
    text: "Программа для женщин, которые устали страдать в отношениях, выбирать неподходящих партнёров, терять себя, ждать и заслуживать любовь. Мы работаем с привязанностью, границами, страхом одиночества, внутренней пустотой, сценариями разрушающих отношений.  Цель программы — вернуть контакт с собой, восстановить внутреннюю опору и постепенно перейти от боли, контроля и эмоциональной зависимости к более зрелым, спокойным и живым отношениям.",
    meta: [],
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  function renderBookingCta(
    label = "Записаться на диагностику",
    type: "DIAGNOSTIC" | "SESSION" = "DIAGNOSTIC",
    packageTitle?: string,
    buttonClassName?: string,
  ) {
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
      <BookingModal buttonClassName={buttonClassName} buttonLabel={label} title={type === "SESSION" ? "Запись на сессию" : "Запись на диагностику"}>
        <BookingCalendar bookingType={type} currentUser={currentUser} packageTitle={packageTitle} role={role} slots={slots} timeZone={timeZone} users={users} />
      </BookingModal>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 text-white lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-6 px-5 py-3.5 lg:px-8">
          <Link href="/" className="min-w-0 shrink-0 max-w-[11.5rem] leading-none sm:max-w-none">
            <p className="whitespace-normal font-serif text-base uppercase leading-[1.05] text-[var(--gold-light)] sm:whitespace-nowrap sm:text-xl">
              Ксения Наумчик
            </p>
            <p className="mt-1 max-w-[11rem] text-[0.56rem] uppercase leading-[1.2] text-[var(--muted)] sm:max-w-none sm:text-[0.62rem]">
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

          <div className="hidden shrink-0 items-center justify-end gap-2 sm:gap-3 2xl:flex">
            <button className="nav-link insight-nav-link hidden text-sm lg:inline-flex" type="button">
              <span aria-hidden="true">✦</span>
              <span>Получить подсказку</span>
            </button>
            {role ? <ProfileMenu name={name} role={role} /> : <AuthModal />}
          </div>

          <button
            className="icon-button inline-flex 2xl:hidden"
            type="button"
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div
          className="fixed inset-x-0 top-[4.25rem] z-50 border-b border-white/[0.08] bg-[#050505]/98 px-4 pb-5 pt-3 backdrop-blur-xl 2xl:hidden"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsMobileMenuOpen(false);
            }
          }}
        >
          <div className="mx-auto grid max-w-7xl gap-3">
            <nav className="grid gap-2">
              {navItems.map((item) => (
                <a
                  className="rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/86 transition hover:border-[var(--gold)] hover:text-[var(--gold-light)]"
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="grid gap-2 border-t border-white/[0.08] pt-3">
              {role ? (
                <>
                  <Link className="rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/86 transition hover:border-[var(--gold)] hover:text-[var(--gold-light)]" href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    Профиль
                  </Link>
                  {role === "ADMIN" ? (
                    <>
                      <Link className="rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/86 transition hover:border-[var(--gold)] hover:text-[var(--gold-light)]" href="/schedule" onClick={() => setIsMobileMenuOpen(false)}>
                        Моё расписание
                      </Link>
                      <Link className="rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/86 transition hover:border-[var(--gold)] hover:text-[var(--gold-light)]" href="/history" onClick={() => setIsMobileMenuOpen(false)}>
                        История
                      </Link>
                      <Link className="rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/86 transition hover:border-[var(--gold)] hover:text-[var(--gold-light)]" href="/clients" onClick={() => setIsMobileMenuOpen(false)}>
                        Мои клиенты
                      </Link>
                    </>
                  ) : (
                    <Link className="rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/86 transition hover:border-[var(--gold)] hover:text-[var(--gold-light)]" href="/bookings" onClick={() => setIsMobileMenuOpen(false)}>
                      Мои записи
                    </Link>
                  )}
                </>
              ) : (
                <AuthModal triggerClassName="w-full" triggerLabel="Войти" />
              )}

            </div>
          </div>
        </div>
      ) : null}

      <section className="relative min-h-[520px] overflow-hidden border-b border-[var(--line)] sm:min-h-[640px]">
        <picture className="absolute inset-0 block h-full w-full">
          <source media="(max-width: 767px)" srcSet="/images/hero-psychologist.png" />
          <source media="(min-width: 768px)" srcSet="/images/background_3000x1024.jpg" />
          <img alt="Психолог в тёмном интерьере" className="hero-visual h-full w-full" src="/images/background_3000x1024.jpg" />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.5)_0%,rgba(5,5,5,0.42)_24%,rgba(5,5,5,0.22)_52%,rgba(5,5,5,0.02)_100%),linear-gradient(0deg,#050505_0%,rgba(5,5,5,0.06)_24%,rgba(5,5,5,0)_58%)]" />
        <div className="relative z-10 mx-auto grid min-h-[520px] max-w-7xl grid-cols-1 items-stretch sm:min-h-[640px]">
          <div className="flex max-w-[60rem] flex-col justify-end px-4 pb-10 pt-20 sm:justify-center sm:px-10 sm:py-14 lg:mt-12 lg:py-20 lg:pl-20">
            <h1 className="max-w-[18rem] font-serif text-[1.74rem] leading-[0.95] text-[var(--gold-light)] uppercase sm:max-w-full sm:text-[3.75rem] lg:text-[4.05rem]">
              <span className="block text-[1.48rem] leading-[1.05] sm:block sm:text-[3.1rem] lg:text-[3.3rem]">Верни свою силу,</span>
              <span className="block text-[1.48rem] leading-[1.05] sm:block sm:text-[3.1rem] lg:text-[3.3rem]">раскрой потенциал</span>
              <span style={{ fontFamily: "var(--font-great-vibes)" }} className="block text-[1.3rem] leading-[1.28] sm:text-3xl lg:text-[3.2rem] normal-case">
                и познакомься с собой новым
              </span>
            </h1>
            <p className="mt-6 max-w-[18.5rem] text-[0.92rem] leading-[1.5] text-white/78 sm:mt-14 sm:max-w-[42rem] sm:text-xl sm:leading-8">
              Пространство для поддержки, трансформации
              <br />
              и переосмысления опыта с системным подходом и глубиной
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-11 sm:gap-4">
              {renderBookingCta()}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell project-section grid gap-8" id="project">
        <div className="max-w-[840px]">
          <h2 className="font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">О проекте</h2>
        </div>
        <div className="project-copy">
          <p>Проект создан для людей, которые проходят через кризис, перемены или внутренний переход и чувствуют, что за этим состоянием стоит не только трудность, но и возможность выйти на новый уровень.</p>
          <p>
            Иногда кризис приходит как потеря опоры, профессиональный тупик, сложности в отношениях или ощущение, что вы выросли из прежней жизни, но ещё не понимаете, какой должна быть новая. Внешне всё может выглядеть привычно, но внутри уже есть понимание, что старые способы больше не работают, а новое ещё не собрано.
          </p>
          <p>
            Я вижу кризис не только как сложный период, но и как точку раскрытия потенциала. Именно в такие моменты человек встречается с тем, что давно просится наружу: с профессиональной силой, которую пора проявить; с эмоциональной зрелостью, которую важно вырастить; с духовной глубиной, которая помогает опереться не только на внешние обстоятельства, но и на внутреннюю правду.
          </p>
          <p>
            В основе проекта — системный подход, сочетание глубокой расстановочной работы и бережного сопровождения. Это позволяет смотреть на запрос целостно: видеть не только внешнюю ситуацию, но и повторяющиеся сценарии, скрытые связи, сопротивление изменениям и тот потенциал, который пока остаётся заблокированным.
          </p>
          <p>
            Задача проекта — помочь человеку не просто пережить кризис, а пройти его осознанно: вернуть контакт с собой, увидеть ресурсы, раскрыть внутреннюю силу и постепенно встроить новые решения в реальную жизнь. Для этого в проекте собраны разные форматы работы: диагностика, разовые сессии, пакеты сопровождения и авторские трансформационные программы. Они отличаются глубиной, длительностью и маршрутом, поэтому можно выбрать тот формат, который нужен вам именно сейчас.
          </p>
          <p>
            На данный момент все форматы проходят в индивидуальном сопровождении. Это значит, что работа строится вокруг вашего запроса и тех процессов, которые действительно важны именно для вас сейчас. Здесь нет универсального сценария, который одинаково накладывается на всех. Есть пространство, в котором можно глубже увидеть себя, бережно пройти изменения и найти опору для следующего шага.
          </p>
          <p>
            Этот проект о возвращении силы, раскрытии потенциала и возможности идти дальше не из страха, а из зрелого, честного и целостного контакта с собой.
          </p>
        </div>
      </section>

      <section className="section-shell grid gap-7 border-t border-[var(--line)]" id="about">
        <div className="max-w-4xl">
          <h2 className="font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">Обо мне</h2>
        </div>
        <div className="about-copy">
          <p>
            Меня зовут Ксения. Я психолог-консультант, терапевт в расстановочном подходе и автор трансформационных
            программ.
          </p>
          <p>
            До запуска личного проекта я более 12 лет работала с людьми, адаптацией, обучением, развитием и системами.
            Мой профессиональный путь связан с HR и продажами, с проектами адаптации, созданием образовательных
            продуктов и развития наставничества для больших аудиторий.
          </p>
          <p>
            Я работала с командами, руководителями, экспертами и крупными корпоративными системами. Помогала людям
            осваиваться в новой роли, раскрывать профессиональный и личный потенциал, выходить в проявленность, усиливать
            экспертизу и проходить периоды изменений.
          </p>
          <p>
            Со временем этот опыт соединился с психологией и терапевтической практикой. С 2021 года я развиваюсь в
            консультировании, веду частную практику, прохожу обучение и работаю с запросами, связанными с кризисами,
            отношениями, деньгами, самореализацией, внутренними конфликтами и поиском своего направления.
          </p>
          <p>
            В моей работе соединяются несколько опор: системное мышление, опыт работы с людьми и проектами, качественная
            психологическая база, глубокий расстановочный подход и умение видеть не только отдельный симптом, а всю
            внутреннюю конструкцию запроса.
          </p>
          <p>
            Я смотрю на клиента не как на набор проблем, а как на живую систему, в которой есть опыт, чувства, сценарии,
            подавленные части, внутренние конфликты, ресурсы и потенциал.
          </p>
          <p>
            Моя задача - помочь увидеть, как это устроено, что именно мешает двигаться дальше, где человек теряет себя,
            где отдаёт свою силу, где нереализовывается и не использует ресурсы - и как постепенно вернуться к себе,
            своим решениям, ясному пути и более зрелому контакту с жизнью.
          </p>
        </div>
      </section>

      <section className="section-shell diagnostic-section grid gap-7 border-t border-[var(--line)]" id="diagnostic">
        <div className="diagnostic-header">
          <h2 className="font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">Диагностика</h2>
        </div>
        <div className="diagnostic-copy">
          <p>
            Диагностика - это первая встреча, на которой мы разбираем вашу текущую ситуацию и смотрим, что на самом деле
            происходит глубже.
          </p>
          <p>
            Она подойдёт, если вы проживаете кризис, находитесь в точке перемен, хотите изменений, но пока не понимаете,
            как к ним подойти. Или если вы уже пробовали что-то менять, но снова упираетесь в повторяющиеся сценарии,
            внутреннее сопротивление, сомнения или ощущение тупика.
          </p>
          <p>
            На диагностике мы определяем вашу текущую точку: что происходит сейчас, что болит, что не устраивает, куда вы
            хотите прийти и что мешает сделать этот переход. Мы смотрим не только на внешние обстоятельства, но и на
            внутренние причины: чувства, установки, сценарии, скрытые конфликты и привычные способы реагирования.
          </p>
          <p>
            Также на встрече происходит первое соприкосновение с методом. Через диагностику в поле можно увидеть то, что
            не осознается в жизни: внутренние связи, истинные цели и источники напряжения.
          </p>
          <p>
            По итогам диагностики у вас появится больше ясности: что с вами происходит, в чём может быть корень запроса,
            какие опоры уже есть и какой формат работы может подойти дальше.
          </p>
          <p>
            Диагностика - это возможность остановиться, посмотреть на свою ситуацию глубже и сделать первый шаг к
            изменениям не из хаоса, а из ясности. Берите эту возможность для себя.
          </p>
        </div>
        <div className="diagnostic-actions">{renderBookingCta("Записаться на диагностику", "DIAGNOSTIC")}</div>
      </section>

      <section className="section-shell grid gap-10" id="sessions">
        <div className="max-w-4xl">
          <h2 className="font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">Индивидуальные сессии и сопровождение</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ServiceCard
            title="Диагностика"
            text="Первая встреча, на которой мы разбираем вашу текущую ситуацию, желаемую точку и то, что мешает перейти к изменениям. 
Подходит, если вы проживаете кризис, внутренний тупик, повторяющийся сценарий или чувствуете, что хотите большего, но пока не понимаете, как к этому подойти. 
На диагностике вы получаете первый контакт с методом, больше ясности по запросу и возможный вектор дальнейшей работы. Продолжительность: 60 минут. Стоимость: 0 рублей."
            cta={renderBookingCta("ЗАПИСАТЬСЯ", "DIAGNOSTIC")}
          />
          <ServiceCard
            title="Сессия"
            text="Глубокая работа с конкретным запросом: отношения, деньги, кризис, внутренний конфликт или состояние, с которым не получается справиться самостоятельно. 
Мы смотрим, как устроена внутренняя конструкция запроса, что удерживает напряжение и где возможен новый шаг. Делаем ту работу, которая возможна на сегодняшний день в безопасном для вас режиме. 
Подходит тем, кто пока не готов к сопровождению, но хочет глубоко разобрать одну важную тему. Продолжительность: 90 минут. Стоимость: 4000 рублей."
            cta={renderBookingCta("ЗАПИСАТЬСЯ", "SESSION")}
          />
        </div>

        <ContentBlock
          title="Индивидуальное сопровождение по вашему запросу"
          text="Формат для тех, кто хочет пройти свою тему глубже и не ограничиваться одной сессией. 
В сопровождении соединяются глубокие расстановочные сессии и поддерживающие встречи, которые помогают интегрировать опыт, замечать сопротивление и не оставаться один на один с процессом изменений. 
Это пространство, где можно двигаться последовательно, с фокусом, структурой и бережной поддержкой."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {supportPackages.map((item) => (
            <PackageCard cta={renderBookingCta("Записаться на первую сессию", "SESSION", item.title)} item={item} key={item.title} />
          ))}
        </div>

        <ContentBlock
          title="Авторские трансформационные программы"
          text="Это структурированные маршруты индивидуального сопровождения по ключевым темам: призвание, деньги и отношения. В отличие от сопровождения по вашему запросу, программа ведёт вас по целостному пути: от диагностики внутренних ограничений к новым решениям, действиям и более зрелому контакту с собой. Внутри есть глубина, структура, поддержка и дополнительные практики для самостоятельной работы."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {authorPrograms.map((item) => (
            <ProgramCard item={item} key={item.title} />
          ))}
        </div>

        <div className="gold-card grid gap-4 p-6 text-center sm:mx-auto sm:max-w-3xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center">
            <HourglassIcon className="h-10 w-10 text-[var(--gold-light)]" />
          </div>
          <p className="text-base leading-7 text-white/82">
            Программы находятся в разработке, но вы уже сейчас можете записаться на диагностику
          </p>
          <div className="flex justify-center">{renderBookingCta("Записаться на диагностику", "DIAGNOSTIC")}</div>
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

      <section className="relative overflow-hidden border-t border-[var(--line)] px-6 pb-16 pt-12 lg:px-10 lg:pb-20">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_auto]">
          <p className="max-w-4xl font-serif text-2xl uppercase leading-relaxed text-[var(--gold-light)]">
            СЕЙЧАС ВАЖЕН НЕ НОВЫЙ РЫВОК, А ВОЗМОЖНОСТЬ УВИДЕТЬ, ЧТО ИМЕННО УДЕРЖИВАЕТ НА МЕСТЕ
          </p>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] bg-[#080807] px-6 py-10 lg:px-10">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.25fr_0.95fr] lg:gap-16">
          <div className="max-w-xl">
            <p className="font-serif text-xl uppercase text-[var(--gold-light)]">Ксения Наумчик</p>
            <p className="mt-4 text-sm leading-7 text-white/68">
              Психологические сессии, диагностика и сопровождение с Ксенией Наумчик. Сервис не является медицинской, психиатрической или экстренной психологической помощью. В случае угрозы жизни или здоровью, острого кризиса или риска причинения вреда себе или другим необходимо обратиться в экстренные службы или медицинскую организацию.
            </p>
            <div className="mt-5 grid gap-3 text-sm leading-6 text-white/66">
              <p>
                E-mail:{" "}
                <Link className="font-normal text-white/78 transition hover:text-[var(--gold-light)]" href="mailto:naumchik.psy@yandex.ru">
                  naumchik.psy@yandex.ru
                </Link>
              </p>
              <div className="grid gap-1">
                <p>
                  Оператор: <span className="text-white/82">ИП Наумчик Ксения Андреевна</span>
                </p>
                <p>ИНН 860105706756, ОГРНИП 325723200087383</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-lg font-semibold text-[var(--gold-light)]">Правовая информация</h2>
            <nav className="mt-5 grid gap-2.5 text-sm text-white/76">
              {footerLegalLinks.map((item) => (
                <Link className="font-normal leading-[1.45] transition hover:text-[var(--gold-light)]" href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
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

function PackageCard({ cta, item }: { cta: ReactNode; item: { title: string; text: string; details: string[]; meta: string[] } }) {
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
      <div>{cta}</div>
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
    </article>
  );
}

function HourglassIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <path d="M14 6h20M14 42h20M18 6v7.5c0 3.4 2 6.5 5.1 7.9l1.8.8-1.8.8A8.7 8.7 0 0 0 18 31.5V42M30 6v7.5c0 3.4-2 6.5-5.1 7.9l-1.8.8 1.8.8A8.7 8.7 0 0 1 30 31.5V42" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M20.5 34.5h7M20.5 13.5h7M21.5 17.5h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity="0.55" />
    </svg>
  );
}
