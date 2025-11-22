import { Ship, Anchor, Waves } from "lucide-react";
import { LeadForm } from "@/components/sections/lead-form";

const cruiseTypes = [
  {
    icon: Ship,
    title: "Морские круизы",
    copy: "Средиземное море, Норвежские фьорды, Карибы — комфортабельные лайнеры и экскурсионные программы.",
  },
  {
    icon: Anchor,
    title: "Речные круизы",
    copy: "Волга, Нева, Енисей. Круизы по России с остановками в исторических городах.",
  },
  {
    icon: Waves,
    title: "Яхтинг и чартеры",
    copy: "Приватные яхты, катера, парусники для индивидуальных и корпоративных программ.",
  },
];

export default function CruisesPage() {
  return (
    <div className="space-y-16">
      <section className="full-bleed -mt-10 border border-[#475C8C]/20 bg-white p-0 shadow-[var(--shadow-card)] lg:-mt-16">
        <div className="tv-image-slider tv-moduleid-9986122" />
      </section>

      <header className="space-y-4 rounded-[36px] border border-[#475C8C]/20 bg-white p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
          Круизы
        </p>
        <h1 className="text-3xl font-semibold text-[#121420] md:text-4xl">
          Морские и речные круизы по всему миру
        </h1>
        <p className="text-base text-[#4a4e65]">
          Подбираем круизы на лайнерах премиум-класса, речные маршруты по России,
          приватные яхты и чартеры. Все варианты с актуальными ценами и наличием.
        </p>
        <div className="mt-4">
          <div className="tv-free-button tv-moduleid-9986116" />
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {cruiseTypes.map((type) => (
          <article
            key={type.title}
            className="rounded-[30px] border border-[#475C8C]/15 bg-gradient-to-br from-white to-[#eef2ff] p-6 shadow-[var(--shadow-card)]"
          >
            <type.icon className="size-10 text-[#475C8C]" />
            <h2 className="mt-4 text-xl font-semibold text-[#121420]">
              {type.title}
            </h2>
            <p className="mt-2 text-sm text-[#4a4e65]">{type.copy}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
            Подбор круизов
          </p>
          <h2 className="text-2xl font-semibold text-[#121420]">
            Онлайн-поиск круизов
          </h2>
          <p className="mt-1 text-sm text-[#4a4e65]">
            Используйте форму ниже для поиска круизов по направлениям, датам и
            категориям кают.
          </p>
        </div>
        <div className="rounded-[32px] border border-[#475C8C]/20 bg-white/80 p-4">
          <div className="tv-search-form tv-moduleid-9974431" />
        </div>
      </section>

      <LeadForm title="Нужна помощь с выбором круиза?" />
    </div>
  );
}

