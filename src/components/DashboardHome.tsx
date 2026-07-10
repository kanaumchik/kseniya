"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
  { href: "#project", label: "О проекте" },
  { href: "#about", label: "Обо мне" },
  { href: "#diagnostic", label: "Диагностика" },
  { href: "#sessions", label: "Сессии и сопровождение" },
  { href: "#faq", label: "FAQ" },
];

const footerLegalLinks = [
  { href: "/legal/privacy-policy", label: "Политика обработки персональных данных" },
  { href: "/legal/offer", label: "Публичная оферта" },
  { href: "/legal/cookie-policy", label: "Политика cookie" },
  { href: "/legal/contacts", label: "Контакты и реквизиты" },
];

const supportPackages = [
  {
    title: "Запуск трансформации",
    text: "Стартовый пакет сессий для тех, кто хочет не ограничиваться одной сессией, а пройти первые этапы глубокой работы с поддержкой и запустить трансформацию, чтобы дальше пройти самостоятельно. Подходит, если у вас есть конкретный запрос, но вы пока не готовы заходить в длительное сопровождение.",
    mobileBreakAfter: "в длительное сопровождение",
    details: ["2 расстановочные сессии по 90 минут", "1 поддерживающая сессия на 60 минут", "всего 4 часа индивидуальной работы"],
    meta: ["Срок: 3-4 недели", "Объём: 3 сессии", "Стоимость: 10 000 рублей"],
  },
  {
    title: "Глубина и поддержка",
    text: "Формат для тех, кто готов идти в трансформацию глубже и с поддержкой. Подходит для объёмных запросов, связанных с отношениями, деньгами, самореализацией, повторяющимися сценариями или внутренними ограничениями. Здесь больше времени на проживание, внимания к нюансам запроса и больше поддержки для осознания и преодоления сопротивления, чтобы новый опыт постепенно становился частью жизни.",
    mobileBreakAfter: "постепенно становился частью жизни",
    details: ["4 расстановочные сессии по 90 минут", "2 поддерживающие сессии по 60 минут", "всего 8 часов индивидуальной работы"],
    meta: ["Срок: 6-8 недель", "Объём: 6 сессий", "Стоимость: 20 000 рублей"],
  },
  {
    title: "От хаоса к гармонии и порядку",
    text: "Сопровождение для периода кризиса, сильных перемен или внутренней пересборки. Подходит при разводе, разрыве отношений, увольнении, потере опоры или состоянии, когда старое уже не работает, а новое ещё не создано. В программе мы чередуем глубокие расстановочные сессии и поддерживающие встречи, чтобы пройти острый период, вернуть опору, собрать ясность и постепенно перейти к новым действиям.",
    mobileBreakAfter: "перейти к новым действиям",
    details: ["4 глубокие расстановочные сессии по 90 минут", "4 поддерживающие сессии по 60 минут", "всего 10 часов индивидуальной работы"],
    meta: ["Срок: 8-12 недель", "Объём: 8 сессий", "Стоимость: 24 000 рублей"],
  },
];

const authorPrograms = [
  {
    title: "Призвание и деньги: раскрыть потенциал и соединить внутреннюю реализацию с деньгами",
    text: "Программа для тех, кто чувствует, что способен на большее и хочет соединить реализацию с доходом и ясным направлением. Подойдёт тем, кто ищет себя, новый профессиональный вектор или хочет перейти из найма в своё дело. В программе мы смотрим, что уже есть внутри вашего опыта, что мешают двигаться дальше, работаем с финансовым мышлением, денежными сценариями и страхом проявляться. Цель программы — увидеть своё направление, собрать внутреннюю опору в реализации и понять, как формировать ценность для других, чтобы она могла становиться источником дохода и большего масштаба.",
    mobileBreakAfter: "хочет перейти из найма в своё дело",
    meta: [],
  },
  {
    title: "Деньги и финансовое расширение: от ограничений к зрелому финансовому мышлению, свободе действий и росту",
    text: "Программа для тех, кто хочет расти в доходе, масштабе и свободе действий, но внутри сталкивается с напряжением, ограничениями или сопротивлением.  Мы работаем с финансовым мышлением, денежными сценариями, внутренними запретами, установками и образами, которые мешают зрелому контакту с деньгами.  Цель программы — изменить восприятие денег и дохода, убрать лишнее напряжение и выстроить более взрослую систему обмена с миром.",
    mobileBreakAfter: "которые мешают зрелому контакту с деньгами",
    meta: [],
  },
  {
    title: "Освобождение и исцеление: от эмоциональной зависимости к здоровым отношениям с собой, другими и миром",
    text: "Программа для женщин, которые устали страдать в отношениях, выбирать неподходящих партнёров, терять себя, ждать и заслуживать любовь. Мы работаем с привязанностью, границами, страхом одиночества, внутренней пустотой, сценариями разрушающих отношений.  Цель программы — вернуть контакт с собой, восстановить внутреннюю опору и постепенно перейти от боли, контроля и эмоциональной зависимости к более зрелым, спокойным и живым отношениям.",
    mobileBreakAfter: "сценариями разрушающих отношений",
    meta: [],
  },
];

const projectParagraphs = [
  "Проект создан для людей, которые проходят через кризис, перемены или внутренний переход и чувствуют, что за этим состоянием стоит не только трудность, но и возможность выйти на новый уровень.",
  "Иногда кризис приходит как потеря опоры, профессиональный тупик, сложности в отношениях или ощущение, что вы выросли из прежней жизни, но ещё не понимаете, какой должна быть новая. Внешне всё может выглядеть привычно, но внутри уже есть понимание, что старые способы больше не работают, а новое ещё не собрано.",
  "Я вижу кризис не только как сложный период, но и как точку раскрытия потенциала. Именно в такие моменты человек встречается с тем, что давно просится наружу: с профессиональной силой, которую пора проявить; с эмоциональной зрелостью, которую важно вырастить; с духовной глубиной, которая помогает опереться не только на внешние обстоятельства, но и на внутреннюю правду.",
  "В основе проекта — системный подход, сочетание глубокой расстановочной работы и бережного сопровождения. Это позволяет смотреть на запрос целостно: видеть не только внешнюю ситуацию, но и повторяющиеся сценарии, скрытые связи, сопротивление изменениям и тот потенциал, который пока остаётся заблокированным.",
  "Задача проекта — помочь человеку не просто пережить кризис, а пройти его осознанно: вернуть контакт с собой, увидеть ресурсы, раскрыть внутреннюю силу и постепенно встроить новые решения в реальную жизнь. Для этого в проекте собраны разные форматы работы: диагностика, разовые сессии, пакеты сопровождения и авторские трансформационные программы. Они отличаются глубиной, длительностью и маршрутом, поэтому можно выбрать тот формат, который нужен вам именно сейчас.",
  "На данный момент все форматы проходят в индивидуальном сопровождении. Это значит, что работа строится вокруг вашего запроса и тех процессов, которые действительно важны именно для вас сейчас. Здесь нет универсального сценария, который одинаково накладывается на всех. Есть пространство, в котором можно глубже увидеть себя, бережно пройти изменения и найти опору для следующего шага.",
  "Этот проект о возвращении силы, раскрытии потенциала и возможности идти дальше не из страха, а из зрелого, честного и целостного контакта с собой.",
];

const aboutParagraphs = [
  "Меня зовут Ксения. Я психолог-консультант, терапевт в расстановочном подходе и автор трансформационных программ.",
  "До запуска личного проекта я более 12 лет работала с людьми, адаптацией, обучением, развитием и системами. Мой профессиональный путь связан с HR и продажами, с проектами адаптации, созданием образовательных продуктов и развития наставничества для больших аудиторий.",
  "Я работала с командами, руководителями, экспертами и крупными корпоративными системами. Помогала людям осваиваться в новой роли, раскрывать профессиональный и личный потенциал, выходить в проявленность, усиливать экспертизу и проходить периоды изменений.",
  "Со временем этот опыт соединился с психологией и терапевтической практикой. С 2021 года я развиваюсь в консультировании, веду частную практику, прохожу обучение и работаю с запросами, связанными с кризисами, отношениями, деньгами, самореализацией, внутренними конфликтами и поиском своего направления.",
  "В моей работе соединяются несколько опор: системное мышление, опыт работы с людьми и проектами, качественная психологическая база, глубокий расстановочный подход и умение видеть не только отдельный симптом, а всю внутреннюю конструкцию запроса.",
  "Я смотрю на клиента не как на набор проблем, а как на живую систему, в которой есть опыт, чувства, сценарии, подавленные части, внутренние конфликты, ресурсы и потенциал.",
  "Моя задача - помочь увидеть, как это устроено, что именно мешает двигаться дальше, где человек теряет себя, где отдаёт свою силу, где нереализовывается и не использует ресурсы - и как постепенно вернуться к себе, своим решениям, ясному пути и более зрелому контакту с жизнью.",
];

const diagnosticParagraphs = [
  "Диагностика - это первая встреча, на которой мы разбираем вашу текущую ситуацию и смотрим, что на самом деле происходит глубже.",
  "Она подойдёт, если вы проживаете кризис, находитесь в точке перемен, хотите изменений, но пока не понимаете, как к ним подойти. Или если вы уже пробовали что-то менять, но снова упираетесь в повторяющиеся сценарии, внутреннее сопротивление, сомнения или ощущение тупика.",
  "На диагностике мы определяем вашу текущую точку: что происходит сейчас, что болит, что не устраивает, куда вы хотите прийти и что мешает сделать этот переход. Мы смотрим не только на внешние обстоятельства, но и на внутренние причины: чувства, установки, сценарии, скрытые конфликты и привычные способы реагирования.",
  "Также на встрече происходит первое соприкосновение с методом. Через диагностику в поле можно увидеть то, что не осознается в жизни: внутренние связи, истинные цели и источники напряжения.",
  "По итогам диагностики у вас появится больше ясности: что с вами происходит, в чём может быть корень запроса, какие опоры уже есть и какой формат работы может подойти дальше.",
  "Диагностика - это возможность остановиться, посмотреть на свою ситуацию глубже и сделать первый шаг к изменениям не из хаоса, а из ясности. Берите эту возможность для себя.",
];

const faqItems = [
  ["Чем диагностика отличается от сессии?", "Диагностика помогает определить запрос, увидеть текущую ситуацию и подобрать подходящий формат работы. Сессия - это уже глубокая проработка конкретной темы."],
  ["Можно ли прийти на одну сессию?", "Да. Разовая сессия подходит, если у вас есть конкретный запрос и вы хотите глубоко с ним поработать. Если в процессе станет понятно, что теме нужно больше времени, можно будет выбрать формат сопровождения."],
  ["Что такое поддерживающая сессия?", "Это встреча, на которой мы собираем опыт после глубокой работы, разбираем реакции и изменения, возвращаем фокус и помогаем новым осознаниям перейти в реальную жизнь."],
  ["Чем сопровождение отличается от программы?", "Сопровождение по запросу строится вокруг вашей конкретной темы. Авторская программа имеет последовательный маршрут и обязательные блоки, но сохраняет индивидуальную работу с тем, что поднимается именно у вас."],
  ["Можно ли выбрать формат после диагностики?", "Да. Диагностика как раз помогает понять, какой формат будет наиболее подходящим: разовая сессия, сопровождение по вашему запросу или авторская программа."],
];

const formatChoiceItems = [
  {
    title: "Диагностика",
    text: "Выбирайте диагностику, если пока сложно сформулировать запрос, понять причины происходящего и определить, с чего начать работу",
    icon: "magnifier",
  },  
  {
    title: "Разовая сессия",
    text: "Подойдёт, если у вас есть один конкретный запрос, который хочется проработать за одну встречу, или вы хотите познакомиться с моим методом",
    icon: "person",
  },
  {
    title: "Запуск трансформации",
    text: "Выбирайте этот формат, если одной встречи недостаточно, но вы пока не готовы к длительному сопровождению и хотите сделать первые устойчивые шаги к изменениям",
    icon: "rocket",
  },
  {
    title: "Глубина и поддержка",
    text: "Подойдёт, если проблема повторяется, затрагивает несколько сфер жизни или требует более глубокой работы с внутренними причинами и привычными сценариями",
    icon: "lotus",
  },
  {
    title: "От хаоса к гармонии и порядку",
    text: "Выбирайте этот формат, если вы переживаете кризис, период перемен или внутреннюю перегрузку и хотите вернуть ясность, опору и порядок в жизни",
    icon: "spiral",
  },
  {
    title: "Авторские программы",
    text: "Подойдут, если вы хотите пройти последовательный маршрут по теме призвания, денег или отношений и получить поддержку на всём пути изменений",
    icon: "mountain",
  },
];

export function DashboardHome({ id, name, email, role, timeZone, slots, users }: DashboardHomeProps) {
  const currentUser = id && name && email ? { id, name, email } : undefined;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [insightHint, setInsightHint] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

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

  async function handleGetInsight() {
    setIsInsightLoading(true);
    setInsightError(null);

    try {
      const params = insightHint ? `?exclude=${encodeURIComponent(insightHint)}` : "";
      const response = await fetch(`/api/hints${params}`, { cache: "no-store" });
      const data = (await response.json()) as { hint?: string; error?: string };

      if (!response.ok || !data.hint) {
        throw new Error(data.error || "Не удалось получить подсказку");
      }

      setInsightHint(data.hint);
    } catch {
      setInsightError("Сейчас не удалось получить подсказку. Попробуйте ещё раз.");
    } finally {
      setIsInsightLoading(false);
    }
  }

  function scrollToInsight() {
    setIsMobileMenuOpen(false);
    document.getElementById("insight")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 text-white lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-6 px-5 py-3.5 lg:px-8">
          <Link href="/" className="min-w-0 shrink-0 max-w-[13.5rem] leading-none sm:max-w-none">
            <p className="whitespace-nowrap font-serif text-[0.9rem] uppercase leading-[1.1] text-[var(--gold-light)] sm:text-xl sm:whitespace-nowrap">
              Ксения Наумчик
            </p>
            <p className="mt-1 max-w-[12rem] text-[0.52rem] uppercase leading-[1.1] text-[var(--muted)] sm:max-w-none sm:text-[0.62rem]">
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
              <button
                className="rounded-md border border-[rgba(214,174,82,0.28)] bg-[rgba(214,174,82,0.08)] px-4 py-3 text-left text-sm font-semibold text-[var(--gold-light)] transition hover:border-[var(--gold)] hover:text-white"
                type="button"
                onClick={scrollToInsight}
              >
                ✦ Получить подсказку
              </button>
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
                <SignOutButton className="rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-sm font-medium text-white/86 transition hover:border-[var(--gold)] hover:text-[var(--gold-light)]" />
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
              <span className="sm:hidden">
                Пространство для поддержки,
                <br />
                трансформации и переосмысления
                <br />
                опыта с системным подходом и глубиной
              </span>
              <span className="hidden sm:inline">
                Пространство для поддержки, трансформации
                <br />
                и переосмысления опыта с системным подходом и глубиной
              </span>
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
          <MobileReadMoreParagraphs className="" mobileBreakAfter="ещё не собрано" paragraphs={projectParagraphs} />
        </div>
      </section>

      <section className="section-shell grid gap-7 border-t border-[var(--line)]" id="about">
        <div className="max-w-4xl">
          <h2 className="font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">Обо мне</h2>
        </div>
        <div className="about-copy">
          <MobileReadMoreParagraphs className="" mobileBreakAfter="проходить периоды изменений" paragraphs={aboutParagraphs} />
        </div>
      </section>

      <section className="section-shell diagnostic-section grid gap-7 border-t border-[var(--line)]" id="diagnostic">
        <div className="diagnostic-header">
          <h2 className="font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">Диагностика</h2>
        </div>
        <div className="diagnostic-copy">
          <MobileReadMoreParagraphs className="" mobileBreakAfter="сомнения или ощущение тупика" paragraphs={diagnosticParagraphs} />
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
На диагностике вы получаете первый контакт с методом, больше ясности по запросу и возможный вектор дальнейшей работы."
            mobileBreakAfter="как к этому подойти"
            facts={["Продолжительность: 60 минут", "Стоимость: 0 рублей"]}
            cta={renderBookingCta("ЗАПИСАТЬСЯ", "DIAGNOSTIC")}
          />
          <ServiceCard
            title="Сессия"
            text="Глубокая работа с конкретным запросом: отношения, деньги, кризис, внутренний конфликт или состояние, с которым не получается справиться самостоятельно. 
Мы смотрим, как устроена внутренняя конструкция запроса, что удерживает напряжение и где возможен новый шаг. Делаем ту работу, которая возможна на сегодняшний день в безопасном для вас режиме. 
Подходит тем, кто пока не готов к сопровождению, но хочет глубоко разобрать одну важную тему."
            mobileBreakAfter="где возможен новый шаг"
            facts={["Продолжительность: 90 минут", "Стоимость: 4000 рублей"]}
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

        <FormatChoiceBlock />
      </section>

      <InsightSection
        error={insightError}
        hint={insightHint}
        isLoading={isInsightLoading}
        onGetInsight={handleGetInsight}
      />

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
            <div className="grid gap-2 text-sm leading-6 text-white/66">
              <p>
                Оператор данных: <span className="font-semibold text-white/82">ИП Наумчик Ксения Андреевна</span>
              </p>
              <p>
                ИНН <span className="font-semibold text-white/82">860105706756</span>, ОГРНИП{" "}
                <span className="font-semibold text-white/82">325723200087383</span>
              </p>
              <p className="mt-4">
                E-mail:{" "}
                <Link className="font-semibold text-white/82 transition hover:text-[var(--gold-light)]" href="mailto:naumchik.psy@yandex.ru">
                  naumchik.psy@yandex.ru
                </Link>
              </p>
              <p>
                Телефон:{" "}
                <Link className="font-semibold text-white/82 transition hover:text-[var(--gold-light)]" href="tel:+79829202342">
                  +7 982 920 2342
                </Link>
              </p>
            </div>
            <div className="mt-10 max-w-xl">
              <p className="text-sm font-semibold leading-7 text-white/68">
                Сессия не заменяет медицинскую помощь: при признаках психических расстройств рекомендуется обратиться к психиатру.
              </p>
              <div className="mt-5 grid gap-2 text-sm leading-6 text-white/72">
                <p className="font-semibold text-white">Экстренная помощь</p>
                <Link className="w-fit text-lg font-semibold text-white transition hover:text-[var(--gold-light)]" href="tel:+74959895050">
                  +7 (495) 989-50-50
                </Link>
                <p className="max-w-sm text-white/76">Горячая линия психологической помощи МЧС России</p>
              </div>
            </div>
          </div>

          <div>
            <Link className="font-serif text-lg font-semibold text-[var(--gold-light)] transition hover:text-white" href="/legal">
              Правовая информация
            </Link>
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

function ServiceCard({
  title,
  text,
  cta,
  mobileBreakAfter,
  facts,
}: {
  title: string;
  text: string;
  cta: ReactNode;
  mobileBreakAfter?: string;
  facts?: string[];
}) {
  return (
    <article className="gold-card grid gap-4 p-5">
      <h3 className="font-serif text-2xl text-[var(--gold-light)]">{title}</h3>
      <MobileReadMoreText
        className="text-sm leading-7 text-white/74"
        expandedContent={
          facts ? (
            <div className="service-card-facts">
              {facts.map((fact) => (
                <p key={fact}>{fact}</p>
              ))}
            </div>
          ) : undefined
        }
        mobileBreakAfter={mobileBreakAfter}
        text={text}
      />
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

function FormatChoiceBlock() {
  return (
    <div className="format-choice">
      <div className="max-w-4xl">
        <h3 className="font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">Как выбрать формат</h3>
      </div>

      <div className="mt-6 grid gap-3 sm:mt-7">
        {formatChoiceItems.map((item) => (
          <article className="format-choice-item" key={item.title}>
            <div className="format-choice-summary">
              <span className="format-choice-icon">
                <FormatChoiceIcon name={item.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold leading-6 text-[var(--gold-light)] sm:text-lg">{item.title}</span>
                <span className="mt-1 block text-sm leading-6 text-white/70 sm:text-base sm:leading-7">{item.text}</span>
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function FormatChoiceIcon({ name }: { name: string }) {
  if (name === "magnifier") {
    return <MagnifierIcon />;
  }

  if (name === "rocket") {
    return <RocketIcon />;
  }

  if (name === "lotus") {
    return <LotusIcon />;
  }

  if (name === "spiral") {
    return <SpiralIcon />;
  }

  if (name === "mountain") {
    return <MountainIcon />;
  }

  return <PersonIcon />;
}

function InsightSection({
  hint,
  isLoading,
  error,
  onGetInsight,
}: {
  hint: string | null;
  isLoading: boolean;
  error: string | null;
  onGetInsight: () => void;
}) {
  return (
    <section className="insight-section border-t border-[var(--line)]" id="insight">
      <div className="insight-bg" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-6 px-6 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-16">
        <div className="max-w-xl">
          <h2 className="insight-title font-serif uppercase leading-[1.05] text-[var(--gold-light)]">
            Получить подсказку
          </h2>
          <div className="insight-copy">
            <p>
              Иногда нам не нужен большой ответ, достаточно одной фразы, которая вернёт внимание, поможет остановиться,
              выдохнуть и увидеть ситуацию иначе.
            </p>
            <p>
              Задайте внутри себя вопрос или просто подумайте о том, что сейчас волнует. Затем нажмите на кнопку - и
              получите короткую подсказку.
            </p>
            <p>
              Это не предсказание и не готовое решение. Это фраза для внутренней работы с возникающими образами и
              связями в нашем подсознании.
            </p>
          </div>
          <button className="hero-gold-button insight-button mt-5" type="button" onClick={onGetInsight} disabled={isLoading}>
            {isLoading ? "Ищу подсказку" : "Получить подсказку"}
          </button>
          {error ? <p className="mt-4 text-sm leading-6 text-[#ff8a63]">{error}</p> : null}
        </div>

        <div className="insight-card-wrap">
          {hint ? (
            <article className="insight-card">
              <SparkleIcon className="insight-card-sparkle top" />
              <p className="insight-card-text">{hint}</p>
            </article>
          ) : null}
        </div>

        <div className="insight-steps lg:col-span-2">
          <InsightStep
            icon={<PromptImageIcon alt="" src="/images/head-for-prompt-trimmed.png" />}
            number="1."
            title="Сформулируйте вопрос внутри себя"
            text="Подумайте о том, что сейчас важно и волнует именно вас."
          />
          <InsightStep
            icon={<PromptImageIcon alt="" src="/images/star-for-prompt-trimmed.png" />}
            number="2."
            title="Получите фразу и заметьте первый отклик"
            text="Прочитайте подсказку и обратите внимание на свои ощущения, мысли и образы."
          />
          <InsightStep
            icon={<PromptImageIcon alt="" src="/images/leaf-for-prompt-trimmed.png" />}
            number="3."
            title="О чем эта фраза для вас?"
            text="Прислушайтесь: что эта фраза подсветила именно сейчас? Какой один маленький шаг она предлагает сделать?"
          />
        </div>
      </div>
    </section>
  );
}

function InsightStep({ number, icon, title, text }: { number: string; icon: ReactNode; title: string; text: string }) {
  return (
    <article className="insight-step">
      <span className="insight-step-number">{number}</span>
      <span className="insight-step-line" aria-hidden="true" />
      <span className="min-w-0">
        <span className="insight-step-heading">
          <span className="insight-step-icon">{icon}</span>
          <span>{title}</span>
        </span>
        <span className="mt-3 block text-sm leading-6 text-white/66">{text}</span>
      </span>
    </article>
  );
}

function PromptImageIcon({ src, alt }: { src: string; alt: string }) {
  return <Image alt={alt} className="insight-step-image-icon" height={110} src={src} width={110} />;
}

function PackageCard({
  cta,
  item,
}: {
  cta: ReactNode;
  item: { title: string; text: string; details: string[]; meta: string[]; mobileBreakAfter?: string };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const previewText = item.mobileBreakAfter ? makePreviewText(item.text, item.mobileBreakAfter) : item.text;

  return (
    <article className="gold-card package-card flex h-full flex-col gap-3 p-5">
      <h4 className="font-serif text-xl text-[var(--gold-light)]">{item.title}</h4>
      {item.mobileBreakAfter ? (
        <>
          <div>
            <p className="text-sm leading-6 text-white/72">
              {isOpen ? item.text : previewText}
              {!isOpen ? (
                <button
                  className="ml-1 inline border-0 bg-transparent p-0 align-baseline text-[var(--gold-light)] underline decoration-[rgba(216,179,90,0.7)] decoration-1 underline-offset-4 transition hover:text-white"
                  style={{ font: "inherit" }}
                  type="button"
                  onClick={() => setIsOpen(true)}
                >
                  Далее
                </button>
              ) : null}
            </p>
            {isOpen ? (
              <>
                <ul className="mt-3 grid gap-1 text-sm text-white/70">
                  {item.details.map((detail) => (
                    <li key={detail}>- {detail}</li>
                  ))}
                </ul>
                {item.meta.length > 0 ? (
                  <div className="mt-3 grid gap-1 text-sm font-semibold text-white/86">
                    {item.meta.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ) : null}
                <button
                  className="mt-3 inline border-0 bg-transparent p-0 text-[var(--gold-light)] underline decoration-[rgba(216,179,90,0.7)] decoration-1 underline-offset-4 transition hover:text-white"
                  style={{ font: "inherit" }}
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  Свернуть
                </button>
              </>
            ) : null}
          </div>
        </>
      ) : (
        <MobileReadMoreText className="text-sm leading-6 text-white/72" mobileBreakAfter={item.mobileBreakAfter} text={item.text} />
      )}
      <div className="package-card-action mt-auto">{cta}</div>
    </article>
  );
}

function ProgramCard({ item }: { item: { title: string; text: string; meta: string[]; mobileBreakAfter?: string } }) {
  return (
    <article className="gold-card grid gap-3 p-5">
      <h4 className="font-serif text-xl text-[var(--gold-light)]">{item.title}</h4>
      <MobileReadMoreText className="text-sm leading-6 text-white/72" mobileBreakAfter={item.mobileBreakAfter} text={item.text} />
      <div className="grid gap-1 text-sm font-semibold text-white/86">
        {item.meta.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </article>
  );
}

function MobileReadMoreText({
  text,
  mobileBreakAfter,
  className,
  expandedContent,
}: {
  text: string;
  mobileBreakAfter?: string;
  className: string;
  expandedContent?: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const previewText = mobileBreakAfter ? makePreviewText(text, mobileBreakAfter) : text;

  if (!mobileBreakAfter) {
    return (
      <>
        <p className={className}>{text}</p>
        {expandedContent}
      </>
    );
  }

  return (
    <>
      <div>
        <p className={className}>
          {isOpen ? text : previewText}
          {!isOpen ? (
            <button
              className="ml-1 inline border-0 bg-transparent p-0 align-baseline text-[var(--gold-light)] underline decoration-[rgba(216,179,90,0.7)] decoration-1 underline-offset-4 transition hover:text-white"
              style={{ font: "inherit" }}
              type="button"
              onClick={() => setIsOpen(true)}
            >
              Далее
            </button>
          ) : null}
        </p>
        {isOpen && expandedContent ? expandedContent : null}
        {isOpen ? (
          <button
            className="mt-2 inline border-0 bg-transparent p-0 text-[var(--gold-light)] underline decoration-[rgba(216,179,90,0.7)] decoration-1 underline-offset-4 transition hover:text-white"
            style={{ font: "inherit" }}
            type="button"
            onClick={() => setIsOpen(false)}
          >
          Свернуть
        </button>
      ) : null}
      </div>
    </>
  );
}

function MobileReadMoreParagraphs({
  paragraphs,
  mobileBreakAfter,
  className,
}: {
  paragraphs: string[];
  mobileBreakAfter?: string;
  className: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const previewParagraphs = mobileBreakAfter ? makePreviewParagraphs(paragraphs, mobileBreakAfter) : paragraphs;

  if (!mobileBreakAfter) {
    return (
      <>
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className={className}>
            {paragraph}
          </p>
        ))}
      </>
    );
  }

  return (
    <>
      <div>
        {(isOpen ? paragraphs : previewParagraphs).map((paragraph, index, visibleParagraphs) => {
          const isLastVisibleParagraph = index === visibleParagraphs.length - 1;

          return (
            <p key={paragraph} className={className}>
              {paragraph}
              {!isOpen && isLastVisibleParagraph ? (
                <button
                  className="ml-1 inline border-0 bg-transparent p-0 align-baseline text-[var(--gold-light)] underline decoration-[rgba(216,179,90,0.7)] decoration-1 underline-offset-4 transition hover:text-white"
                  style={{ font: "inherit" }}
                  type="button"
                  onClick={() => setIsOpen(true)}
                >
                  Далее
                </button>
              ) : null}
            </p>
          );
        })}
        {isOpen ? (
          <button
            className="mt-2 inline border-0 bg-transparent p-0 text-[var(--gold-light)] underline decoration-[rgba(216,179,90,0.7)] decoration-1 underline-offset-4 transition hover:text-white"
            style={{ font: "inherit" }}
            type="button"
            onClick={() => setIsOpen(false)}
          >
          Свернуть
        </button>
      ) : null}
      </div>
    </>
  );
}

function makePreviewText(text: string, breakAfter: string) {
  const index = text.indexOf(breakAfter);
  if (index === -1) {
    return text;
  }

  return `${text.slice(0, index + breakAfter.length)}…`;
}

function makePreviewParagraphs(paragraphs: string[], breakAfter: string) {
  const index = paragraphs.findIndex((paragraph) => paragraph.includes(breakAfter));
  if (index === -1) {
    return paragraphs;
  }

  return paragraphs.slice(0, index + 1).map((paragraph, paragraphIndex) => {
    if (paragraphIndex !== index) {
      return paragraph;
    }

    return makePreviewText(paragraph, breakAfter);
  });
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

function PersonIcon() {
  return (
    <svg aria-hidden="true" className="size-9" fill="none" viewBox="0 0 48 48">
      <path d="M24 21.5a5.8 5.8 0 1 0 0-11.6 5.8 5.8 0 0 0 0 11.6Z" stroke="currentColor" strokeWidth="2" />
      <path d="M18.2 28.2c1.1-2.7 3-4.1 5.8-4.1s4.7 1.4 5.8 4.1" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M16.2 20.2c-3.7 2.7-6.1 6.9-6.1 11.5 0 5.2 6.2 7.1 13.9 7.1s13.9-1.9 13.9-7.1c0-4.6-2.4-8.8-6.1-11.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M16 34.4h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function MagnifierIcon() {
  return (
    <svg aria-hidden="true" className="size-9" fill="none" viewBox="0 0 48 48">
      <circle cx="21.8" cy="21.8" r="6.6" stroke="currentColor" strokeWidth="2.2" />
      <path d="m26.6 26.6 7.7 7.7" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg aria-hidden="true" className="size-9" fill="none" viewBox="0 0 48 48">
      <path d="M28.5 8.8c4.8-1.7 8.7-.7 10.7.2.9 2 1.9 5.9.2 10.7-1.7 5-6.1 9.9-13.3 14.9l-8.4-8.4c5-7.2 9.9-11.7 14.8-13.4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M18.2 26.6 10 28.2l5.6-8.4M25.4 33.8 23.8 42l8.4-5.6M30.6 17.4l-8 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M32.2 20.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function LotusIcon() {
  return (
    <svg aria-hidden="true" className="size-9" fill="none" viewBox="0 0 48 48">
      <path d="M24 35.8c-5.9-4.3-8.8-8.9-8.8-13.8 0-4.1 2.2-7.5 4.5-9.8 1.9 2.1 3.3 4.5 4.3 7.1 1-2.6 2.4-5 4.3-7.1 2.3 2.3 4.5 5.7 4.5 9.8 0 4.9-2.9 9.5-8.8 13.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M19.8 33.8c-6.8-.9-11-4-12.6-9.2 3.4-.8 6.3-.5 8.7.7M28.2 33.8c6.8-.9 11-4 12.6-9.2-3.4-.8-6.3-.5-8.7.7M14.4 37.8h19.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function SpiralIcon() {
  return (
    <svg aria-hidden="true" className="size-9" fill="none" viewBox="0 0 48 48">
      <path d="M24 39.5c8.6 0 15.5-6.9 15.5-15.5S32.6 8.5 24 8.5 8.5 15.4 8.5 24 15.4 39.5 24 39.5Z" stroke="currentColor" strokeWidth="2" />
      <path d="M24 33.3a9.3 9.3 0 1 0-9.3-9.3 6.4 6.4 0 1 0 6.4-6.4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M24 29a5 5 0 1 0-5-5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function MountainIcon() {
  return (
    <svg aria-hidden="true" className="size-9" fill="none" viewBox="0 0 48 48">
      <path d="m6.8 37.8 11.6-21.1 7.2 12.1 4.8-7.4 10.8 16.4H6.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="m15.8 21.5 3.8 3.3 3.4-2.4M27.8 25.6l3.3 2.4 2.5-1.7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M31.6 9.8v5.8M28.7 12.7h5.8" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 32 32">
      <path d="M16 3.5c1.1 6 3.5 9.4 9.5 10.5-6 1.1-8.4 4.5-9.5 10.5C14.9 18.5 12.5 15.1 6.5 14 12.5 12.9 14.9 9.5 16 3.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}


