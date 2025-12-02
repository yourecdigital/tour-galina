import Image from "next/image";
import { LeadForm } from "@/components/sections/lead-form";

const team = [
  {
    name: "Галина",
    role: "Идейный вдохновитель нашей команды",
    quote:
      "Вдохновляет нас искать тонкий баланс между комфортом и приключением.",
    photo: "/team/1.jpg",
  },
  {
    name: "Сергей",
    role:
      "Горы — символ свободы и внутреннего роста, где чувствуешь себя живым",
    quote:
      "Ведёт авторские маршруты и следит, чтобы каждая деталь соответствовала мечте клиента.",
    photo: "/team/2.jpg",
  },
  {
    name: "Евгений",
    role:
      "Для него горы — не просто отдых, а источник вдохновения и силы",
    quote:
      "Отвечает за экспедиции и трекинг, подключая лучшие локальные команды.",
    photo: "/team/3.jpg",
  },
  {
    name: "Анна",
    role:
      "Читала книги о горных путешествиях, а теперь — это её жизнь",
    quote:
      "Создаёт камерные программы с сильным сторителлингом и вниманием к эмоциям.",
    photo: "/team/4.jpg",
  },
  {
    name: "Марина",
    role:
      "Верит, что каждое путешествие начинается с искреннего внимания к мечтам",
    quote:
      "Обеспечивает персональный сервис и заботится о комфорте клиентов на каждом этапе.",
    photo: "/team/5.jpg",
  },
  {
    name: "Юрий",
    role:
      "Цифровые технологии — это мост между мечтами о путешествиях и их воплощением",
    quote:
      "Создаёт контент для социальных сетей, развивает маркетинг и отвечает за IT-инфраструктуру проекта.",
    photo: "/team/6.png",
  },
];

export default function TeamPage() {
  return (
    <div className="space-y-16">
      <header className="rounded-[36px] border border-[#475C8C]/20 bg-white p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
          Наша команда
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#121420] md:text-4xl">
          Люди, которые ведут вас от первой заявки до возвращения домой
        </h1>
        <p className="mt-4 text-base text-[#4a4e65]">
          В Oktour мы соединяем эмоциональный интелект и технологии. Каждый
          проект ведёт travel-дизайнер и куратор по направлению.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {team.map((person) => (
          <article
            key={person.name}
            className="rounded-[30px] border border-[#475C8C]/20 bg-white/90 p-6 shadow-[var(--shadow-card)]"
          >
            <div className="grid gap-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[#475C8C]/5">
                <Image
                  src={person.photo}
                  alt={person.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority={person.name === "Галина"}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121420]/30 to-transparent" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#121420]">
                  {person.name}
                </h2>
                <p className="mt-1 text-sm font-medium uppercase tracking-[0.3em] text-[#475C8C]/70">
                  {person.role}
                </p>
                <p className="mt-3 text-sm text-[#4a4e65]">{person.quote}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <LeadForm title="Познакомьтесь с travel-дизайнером Oktour" />
    </div>
  );
}

