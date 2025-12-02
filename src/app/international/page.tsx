import { Globe, Sun, Sailboat } from "lucide-react";
import { LeadForm } from "@/components/sections/lead-form";

const destinations = [
  {
    icon: Globe,
    title: "Европа",
    copy: "Париж, Италия, Скандинавия. Культовые отели, арт-маршруты, гастротуры.",
  },
  {
    icon: Sun,
    title: "Азия и Ближний Восток",
    copy: "Мальдивы, Бали, Дубай. Курируем лучшие курорты под wellness и family.",
  },
  {
    icon: Sailboat,
    title: "Карибы и океания",
    copy: "Яхтинг, частные острова, свадебные церемонии \"под ключ\".",
  },
];

export default function InternationalPage() {
  return (
    <div className="space-y-16">
      <section className="full-bleed -mt-10 border border-[#475C8C]/20 bg-white p-0 shadow-[var(--shadow-card)] lg:-mt-16">
        <div className="tv-image-slider tv-moduleid-9986115" />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
            Динамическая витрина
          </p>
          <h2 className="text-2xl font-semibold text-[#121420]">
            Подбор зарубежных туров
          </h2>
          <p className="mt-2 text-sm text-[#4a4e65]">
            Онлайн-поиск по всем зарубежным направлениям: актуальные цены,
            фильтры по странам, бюджету и формату отдыха.
          </p>
        </div>
        <div className="rounded-[32px] border border-[#475C8C]/20 bg-white/80 p-4">
          <div
            className="tv-search-form tv-moduleid-9974431"
            tv-country="1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86"
          />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {destinations.map((item) => (
          <article
            key={item.title}
            className="rounded-[30px] border border-[#475C8C]/15 bg-white p-6 shadow-[var(--shadow-card)]"
          >
            <item.icon className="size-10 text-[#475C8C]" />
            <h2 className="mt-4 text-xl font-semibold text-[#121420]">
              {item.title}
            </h2>
            <p className="mt-2 text-sm text-[#4a4e65]">{item.copy}</p>
          </article>
        ))}
      </section>

      <LeadForm title="Нужен персональный маршрут за границу?" />
    </div>
  );
}

