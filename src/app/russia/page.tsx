import { LeadForm } from "@/components/sections/lead-form";
import { MountainSnow, Landmark, Waves } from "lucide-react";

const regions = [
  {
    icon: MountainSnow,
    title: "Байкал & Арктика",
    copy: "Гляциологические экспедиции, фото-сафари, ледовые круизы.",
  },
  {
    icon: Landmark,
    title: "Золотое кольцо и столицы",
    copy: "Гастрономия, современное искусство, приватные гиды.",
  },
  {
    icon: Waves,
    title: "Юг России",
    copy: "Винные маршруты, яхты на Чёрном море, авторские SPA-программы.",
  },
];

export default function RussiaPage() {
  return (
    <div className="space-y-16">
      <section className="full-bleed -mt-10 border border-[#475C8C]/20 bg-white p-0 shadow-[var(--shadow-card)] lg:-mt-16">
        <div className="tv-image-slider tv-moduleid-9986114" />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
            Горячие предложения
          </p>
          <h2 className="text-2xl font-semibold text-[#121420]">
            Онлайн-виджет
          </h2>
          <p className="mt-1 text-sm text-[#4a4e65]">
            Прямое подключение к туроператору: клиенты видят актуальные цены и
            могут фильтровать туры по России в режиме онлайн.
          </p>
        </div>
        <div className="rounded-[32px] border border-[#475C8C]/20 bg-white/80 p-4">
          <div
            className="tv-search-form tv-moduleid-9974431"
            tv-country="47"
          />
        </div>
      </section>

      <header className="space-y-4 rounded-[36px] border border-[#475C8C]/20 bg-white p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
          Туры по России
        </p>
        <h1 className="text-3xl font-semibold text-[#121420] md:text-4xl">
          Интеллигентные маршруты от Калининграда до Камчатки
        </h1>
        <p className="text-base text-[#4a4e65]">
          Работаем с локальными экспертами, бронируем premium-отели, составляем
          road-map под ваши интересы и оперативно обновляем цены на перелёты и
          проживание.
        </p>
        <div className="mt-4">
          <div className="tv-free-button tv-moduleid-9986116" />
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {regions.map((region) => (
          <article
            key={region.title}
            className="rounded-[30px] border border-[#475C8C]/15 bg-gradient-to-br from-white to-[#eef2ff] p-6 shadow-[var(--shadow-card)]"
          >
            <region.icon className="size-10 text-[#475C8C]" />
            <h2 className="mt-4 text-xl font-semibold text-[#121420]">
              {region.title}
            </h2>
            <p className="mt-2 text-sm text-[#4a4e65]">{region.copy}</p>
          </article>
        ))}
      </section>

      <LeadForm title="Расскажите, что хотите увидеть в России" />
    </div>
  );
}

