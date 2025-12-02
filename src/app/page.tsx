import Link from "next/link";
import {
  Plane,
  Compass,
  Umbrella,
  Mountain,
  Ship,
  Star,
  Shield,
  Headphones,
  Sparkles,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/sections/lead-form";

const popularDirections = [
  {
    title: "Сочи + Абхазия",
    description: "Отели 4-5*, лечебные программы, семейные туры",
  },
  {
    title: "Турция / Анталия",
    description: "Горящие предложения all inclusive, виллы на 6-10 гостей",
  },
  {
    title: "ОАЭ / Дубай",
    description: "Shopping, safari, гастрономические маршруты",
  },
  {
    title: "Таиланд",
    description: "Пхукет, Самуи, комбинированные острова",
  },
];

const tourCategories = [
  {
    icon: Umbrella,
    title: "Пляжный отдых",
    text: "Турция, ОАЭ, Мальдивы, Куба — проверенные отели и чартеры.",
  },
  {
    icon: Mountain,
    title: "Горнолыжные туры",
    text: "Красная Поляна, Австрия, Италия — ski-pass, прокат, школа.",
  },
  {
    icon: Ship,
    title: "Круизы и яхты",
    text: "Средиземное море, Норвежские фьорды, Карибы, private-чартер.",
  },
  {
    icon: Compass,
    title: "Экскурсионные туры",
    text: "Европа, Кавказ, Узбекистан — гид, трансферы, входные билеты.",
  },
];

const reasons = [
  { icon: Star, title: "Собственные тарифы", text: "Эксклюзивные цены от партнёров и direct договоры с отелями." },
  {
    icon: Shield,
    title: "Гарантии и договор",
    text: "Работаем официально, страхуем туры, консультируем в рабочие часы.",
  },
  { icon: Headphones, title: "Персональный менеджер", text: "Один куратор ведёт клиента от заявки до возвращения." },
];

const reviews = [
  {
    name: "Ирина и Алексей",
    text: "Летали в Турцию срочно: нашли отель с private-бассейном, всё оформили за сутки. Поддержка на связи всё время.",
  },
  {
    name: "Компания \"СтройИнвест\"",
    text: "Организовали корпоратив в Сочи: перелёт, трансферы, конференц-зал, экскурсии. Удобно и прозрачно.",
  },
  {
    name: "Мария К.",
    text: "ОАЭ + Мальдивы: подбор VIP-отелей, визы, рестораны. Очень понравился подход и рекомендации.",
  },
];

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero Video Section */}
      <section className="full-bleed relative -mt-10 h-[60vh] md:h-[70vh] lg:h-[80vh] lg:-mt-16 overflow-hidden" style={{ borderRadius: 0 }}>
        {/* Mobile video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover md:hidden"
        >
          <source src="/home/m.mp4" type="video/mp4" />
        </video>
        {/* Tablet video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hidden md:block lg:hidden absolute inset-0 w-full h-full object-cover"
        >
          <source src="/home/p.mp4" type="video/mp4" />
        </video>
        {/* Desktop video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hidden lg:block absolute inset-0 w-full h-full object-cover"
        >
          <source src="/home/d.mp4" type="video/mp4" />
        </video>
        
        {/* Unified gradient overlay: black top -> white bottom (no transparency in between) */}
        <div 
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.5) 70%, rgba(0, 0, 0, 0.2) 85%, #f7f8fc 100%)'
          }}
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center px-4 max-w-4xl">
            <p className="text-sm md:text-base uppercase tracking-[0.4em] text-white/95 mb-4 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              Международное турагентство
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
              Ваше идеальное путешествие начинается здесь
            </h1>
            <p className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              <span className="text-[#D9921D] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">Надёжные туры и комфортный отдых по всему миру — с заботой о каждой детали.</span>
            </p>
            <p className="text-base md:text-lg text-white/95 mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              Лучшие направления по России, Европе, Азии и Ближнему Востоку — от надёжных туроператоров.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-[#475C8C]/15 bg-white p-6 shadow-[0_30px_70px_rgba(18,20,32,0.15)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]">
              Международное турагентство
            </p>
            <h1 className="text-3xl font-semibold text-[#121420] md:text-5xl">
              Найдём тур за 15 минут — от горячих предложений до VIP-отдыха
            </h1>
            <p className="text-base text-[#4a4e65]">
              Лучшие направления по России, Европе, Азии и Ближнему Востоку — от надёжных туроператоров.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/contacts#lead-form">Получить подбор</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/russia">Смотреть направления</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: "350+", label: "отелей по спецтарифу" },
                { value: "10:00—20:00", label: "поддержка в будни" },
                { value: "12", label: "лет опыта" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#475C8C]/15 bg-[#f4f6ff] p-4"
                >
                  <p className="text-2xl font-semibold text-[#475C8C]">
                    {item.value}
                  </p>
                  <p className="text-sm text-[#4a4e65]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-[#475C8C]/20 bg-[#252525] p-6 text-white">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">
              Поиск тура онлайн
            </p>
            <p className="mt-2 text-lg font-semibold">
              Минимальные цены на пакеты прямо сейчас
            </p>
            <p className="mt-2 text-sm text-white/70">
              Он автоматически подбирает самые выгодные предложения по
              популярным направлениям. Менеджер свяжется в рабочее время, чтобы
              подтвердить бронь.
            </p>
            <div className="mt-6 rounded-[24px] bg-white/95 p-4">
              <div className="tv-min-price tv-moduleid-9986125" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-[#475C8C]/15 bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-[#121420]">
            Поиск туров и предложения Oktour
          </h2>
          <p className="text-base text-[#4a4e65]">
            Мы ежедневно обновляем каталог, чтобы по запросам вроде «поиск туров
            онлайн», «горящие туры Сочи», «Ok tour», «oktour» наш сайт выдавал
            самые точные результаты. На страницах{" "}
            <Link href="/russia" className="text-[#475C8C] underline underline-offset-2">
              туров по России
            </Link>{" "}
            и{" "}
            <Link href="/international" className="text-[#475C8C] underline underline-offset-2">
              зарубежных направлений
            </Link>{" "}
            размещены прямые витрины с фильтрами и спецпредложениями.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[#4a4e65]">
            <li>Горящие путёвки и сезонные акции обновляются автоматически.</li>
            <li>Фирменные подборки «Oktour» включают авиаперелёт, отель и трансфер.</li>
            <li>Поиск туров доступен 24/7 через виджеты, менеджер отвечает в рабочие часы.</li>
          </ul>
          <p className="text-sm text-[#4a4e65]">
            Добавьте наш сайт в закладки — так запросы «ok tour» и «oktour»
            всегда будут вести к официальному ресурсу Oktour.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
              Популярные направления
            </p>
            <h2 className="text-3xl font-semibold text-[#121420]">
              Что бронируют чаще всего
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/international">Все направления</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {popularDirections.map((direction) => (
            <article
              key={direction.title}
              className="flex items-center justify-between rounded-[28px] border border-[#475C8C]/15 bg-white p-5 shadow-[var(--shadow-card)]"
            >
              <div>
                <h3 className="text-xl font-semibold text-[#121420]">
                  {direction.title}
                </h3>
                <p className="text-sm text-[#4a4e65]">{direction.description}</p>
              </div>
              <Plane className="hidden size-10 text-[#475C8C] md:block" />
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
          Форматы отдыха
        </p>
        <h2 className="text-3xl font-semibold text-[#121420]">
          Подберём тур под ваш сценарий
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {tourCategories.map((category) => (
            <article
              key={category.title}
              className="flex gap-4 rounded-[28px] border border-[#475C8C]/15 bg-gradient-to-br from-white to-[#eff2ff] p-6 shadow-[var(--shadow-card)]"
            >
              <category.icon className="size-10 text-[#475C8C]" />
              <div>
                <h3 className="text-xl font-semibold text-[#121420]">
                  {category.title}
                </h3>
                <p className="mt-2 text-sm text-[#4a4e65]">{category.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-[32px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
          <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
            Горящие туры
          </p>
          <h2 className="text-2xl font-semibold text-[#121420]">
            Лента актуальных акций
          </h2>
          <p className="text-sm text-[#4a4e65]">
            Виджет обновляется автоматически и подгружает топовые предложения от
            туроператоров.
          </p>
          <div className="rounded-[28px] border border-dashed border-[#475C8C]/30 bg-white/80 p-4">
            <div className="tv-image-slider tv-moduleid-9986115" />
          </div>
        </div>
        <div className="space-y-4 rounded-[32px] border border-[#475C8C]/20 bg-[#252525] p-6 text-white shadow-[var(--shadow-card)]">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            Почему выбирают Oktour
          </p>
          <h2 className="text-2xl font-semibold">Классический сервис + технологии</h2>
          <div className="space-y-4">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="flex gap-3 rounded-[24px] bg-white/10 p-4"
              >
                <reason.icon className="size-8 text-[#D9921D]" />
                <div>
                  <p className="text-base font-semibold">{reason.title}</p>
                  <p className="text-sm text-white/70">{reason.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[36px] border border-[#475C8C]/15 bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
              Отзывы клиентов
            </p>
            <h2 className="text-3xl font-semibold text-[#121420]">
              Нам доверяют семьи и корпорации
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#475C8C]/10 px-4 py-2 text-sm text-[#475C8C]">
            <Sparkles className="size-4" />
            Рейтинг 4.9 / 5
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="rounded-[24px] border border-[#475C8C]/10 bg-[#f7f8fc] p-4"
            >
              <p className="text-sm text-[#4a4e65]">{review.text}</p>
              <p className="mt-3 text-sm font-semibold text-[#121420]">
                {review.name}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[36px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
              Как выглядит процесс
            </p>
            <h2 className="text-3xl font-semibold text-[#121420]">
              Забронируем тур в три шага
            </h2>
            <div className="space-y-3 text-sm text-[#4a4e65]">
              <div className="flex gap-3">
                <CalendarCheck className="mt-1 size-5 text-[#475C8C]" />
                <p>
                  <strong>1. Заявка.</strong> Заполняете форму ниже или выбираете тур
                  в виджете.
                </p>
              </div>
              <div className="flex gap-3">
                <Headphones className="mt-1 size-5 text-[#475C8C]" />
                <p>
                  <strong>2. Консультация.</strong> Менеджер отправляет подборку,
                  согласовывает детали, помогает с оплатой.
                </p>
              </div>
              <div className="flex gap-3">
                <Shield className="mt-1 size-5 text-[#475C8C]" />
                <p>
                  <strong>3. Поддержка.</strong> Документы, трансферы, страховки,
                  контакты на месте — всё под контролем.
                </p>
              </div>
            </div>
          </div>
          <LeadForm title="Оставьте заявку — мы свяжемся в течение 15 минут" />
        </div>
      </section>
    </div>
  );
}
