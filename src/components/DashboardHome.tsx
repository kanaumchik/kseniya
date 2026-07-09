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

      <section className="relative min-h-[640px] overflow-hidden border-b border-[var(--line)]">
        <Image
          alt="Психолог в тёмном интерьере"
          className="hero-image object-cover object-center"
          fill
          priority
          sizes="100vw"
          src="/images/background_3000x1024.jpg"
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

      <section className="section-shell grid gap-7" id="project">
        <div className="max-w-4xl">
          <h2 className="font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">О проекте</h2>
        </div>
        <div className="grid max-w-5xl gap-5 text-base leading-8 text-white/72">
          <p>Этот проект родился как пространство для поддержки, трансформации и переосмысления опыта.</p>
          <p>
            Сюда можно прийти в период кризиса, перемен, внутреннего поиска или усталости от повторяющихся сценариев -
            когда привычные способы больше не работают, а новое ещё не собрано. Когда внутри есть ощущение: «Я могу
            больше. Во мне есть потенциал. Но что-то удерживает меня на месте».
          </p>
          <p>
            Я верю, что кризис - это не только точка боли. Это момент, в котором человек встречается с необходимостью
            перестроиться: увидеть, что больше не служит жизни, найти новые опоры, вернуть контакт с собой и начать
            действовать иначе.
          </p>
          <p>
            В основе проекта - системный подход, расстановочная работа, психологическая база и поддерживающий формат
            сопровождения. Мне важно не просто провести человека через глубокую сессию, а помочь ему выдержать процесс
            изменений, заметить сопротивление, сохранить фокус и постепенно встроить новые осознания в жизнь.
          </p>
          <p>
            Здесь есть разные форматы работы: диагностика, разовые сессии, пакеты сопровождения и авторские
            трансформационные программы. Все они созданы для того, чтобы человек мог не оставаться один на один со своим
            запросом, а проходить путь глубже, яснее и бережнее.
          </p>
          <p>
            Этот проект - про внутреннюю силу, раскрытие потенциала и возможность идти дальше даже тогда, когда внешние
            обстоятельства кажутся нестабильными.
          </p>
        </div>
      </section>

      <section className="section-shell grid gap-7 border-t border-[var(--line)]" id="diagnostic">
        <div className="max-w-4xl">
          <h2 className="font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">Диагностика</h2>
        </div>
        <div className="grid max-w-5xl gap-5 text-base leading-8 text-white/72">
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
            <PackageCard cta={renderBookingCta("Записаться на диагностику", "DIAGNOSTIC")} item={item} key={item.title} />
          ))}
        </div>

        <ContentBlock
          title="Индивидуальное сопровождение по авторским программам"
          text="В этом формате я веду вас по последовательным блокам программы, с глубокой индивидуальной работой. Каждая программа включает расстановочные сессии на ключевые темы, поддерживающие сессии и дополнительные самостоятельные задания. Базовый маршрут - короткий структурированный формат по выбранной теме. Глубокое погружение - расширенный формат индивидуального сопровождения, когда важно пройти программу глубже и объёмнее."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {authorPrograms.map((item) => (
            <ProgramCard cta={renderBookingCta("Записаться на диагностику", "DIAGNOSTIC")} item={item} key={item.title} />
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

      <section className="section-shell grid gap-7 border-t border-[var(--line)]" id="about">
        <div className="max-w-4xl">
          <h2 className="font-serif text-3xl text-[var(--gold-light)] sm:text-4xl">Обо мне</h2>
        </div>
        <div className="grid max-w-5xl gap-5 text-base leading-8 text-white/72">
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

function ProgramCard({ cta, item }: { cta: ReactNode; item: { title: string; text: string; meta: string[] } }) {
  return (
    <article className="gold-card grid gap-3 p-5">
      <h4 className="font-serif text-xl text-[var(--gold-light)]">{item.title}</h4>
      <p className="text-sm leading-6 text-white/72">{item.text}</p>
      <div className="grid gap-1 text-sm font-semibold text-white/86">
        {item.meta.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div>{cta}</div>
    </article>
  );
}
