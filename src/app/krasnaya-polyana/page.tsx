import { Mountain, Snowflake, Activity } from "lucide-react";
import { LeadForm } from "@/components/sections/lead-form";

const activities = [
  {
    icon: Activity,
    title: "Горнолыжные туры",
    copy: "Ски-пассы, прокат оборудования, инструкторы для всех уровней подготовки.",
  },
  {
    icon: Mountain,
    title: "Активный отдых",
    copy: "Треккинг, рафтинг, велотуры, канатные дороги и смотровые площадки.",
  },
  {
    icon: Snowflake,
    title: "SPA и wellness",
    copy: "Горные курорты с термальными источниками, массажи, релаксация.",
  },
];

export default function KrasnayaPolyanaPage() {
  return (
    <div className="space-y-16">
      <section className="full-bleed -mt-10 border border-[#475C8C]/20 bg-white p-0 shadow-[var(--shadow-card)] lg:-mt-16">
        <div className="tv-image-slider tv-moduleid-9986114" />
      </section>

      <header className="space-y-4 rounded-[36px] border border-[#475C8C]/20 bg-white p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
          Красная Поляна
        </p>
        <h1 className="text-3xl font-semibold text-[#121420] md:text-4xl">
          Горнолыжный курорт мирового уровня
        </h1>
        <p className="text-base text-[#4a4e65]">
          Подбираем туры на Красную Поляну: отели 4-5*, ски-пассы, трансферы,
          экскурсии. Зимний и летний сезоны с актуальными ценами и наличием.
        </p>
        <div className="mt-4">
          <div className="tv-free-button tv-moduleid-9986116" />
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {activities.map((activity) => (
          <article
            key={activity.title}
            className="rounded-[30px] border border-[#475C8C]/15 bg-gradient-to-br from-white to-[#eef2ff] p-6 shadow-[var(--shadow-card)]"
          >
            <activity.icon className="size-10 text-[#475C8C]" />
            <h2 className="mt-4 text-xl font-semibold text-[#121420]">
              {activity.title}
            </h2>
            <p className="mt-2 text-sm text-[#4a4e65]">{activity.copy}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
            Подбор туров
          </p>
          <h2 className="text-2xl font-semibold text-[#121420]">
            Онлайн-поиск туров на Красную Поляну
          </h2>
          <p className="mt-1 text-sm text-[#4a4e65]">
            Используйте форму ниже для поиска туров по датам, отелям и
            категориям размещения.
          </p>
        </div>
        <div className="rounded-[32px] border border-[#475C8C]/20 bg-white/80 p-4">
          <div className="tv-search-form tv-moduleid-9974431" tv-country="47" />
        </div>
      </section>

      <LeadForm title="Поможем подобрать идеальный тур на Красную Поляну" />
    </div>
  );
}

