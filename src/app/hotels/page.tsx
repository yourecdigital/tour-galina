import { Building2, Star, Smile } from "lucide-react";

const benefits = [
  {
    icon: Building2,
    title: "Прямые договоры",
    copy: "Preferred-статусы в сетях Marriott, Accor, Minor, Mandarin Oriental.",
  },
  {
    icon: Star,
    title: "Апгрейды и бонусы",
    copy: "Согласовываем ранний заезд, spa-кредиты, авторские welcome-наборы.",
  },
  {
    icon: Smile,
    title: "Гибкие условия",
    copy: "Персональные условия отмены и пост-оплаты для корпоративных клиентов.",
  },
];

export default function HotelsPage() {
  return (
    <div className="space-y-16">
      <section className="full-bleed -mt-10 border border-[#475C8C]/20 bg-white p-0 shadow-[var(--shadow-card)] lg:-mt-16">
        <div className="tv-image-slider tv-moduleid-9986122" />
      </section>

      <section className="space-y-4 rounded-[36px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
          Страны и отели
        </p>
        <h2 className="text-2xl font-semibold text-[#121420]">
          Подбор по направлениям
        </h2>
        <div className="rounded-[32px] border border-dashed border-[#475C8C]/30 bg-white/80 p-4">
          <div className="tv-country tv-moduleid-9986121" />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="rounded-[30px] border border-[#475C8C]/15 bg-gradient-to-b from-white to-[#F7F8FC] p-6 shadow-[var(--shadow-card)]"
          >
            <benefit.icon className="size-10 text-[#475C8C]" />
            <h2 className="mt-4 text-xl font-semibold text-[#121420]">
              {benefit.title}
            </h2>
            <p className="mt-2 text-sm text-[#4a4e65]">{benefit.copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

