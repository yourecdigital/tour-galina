import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { LeadForm } from "@/components/sections/lead-form";

const contacts = [
  {
    icon: Phone,
    label: "Телефон / WhatsApp",
    value: "+7 499 123 45 67",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "hello@oktour.global",
  },
  {
    icon: MapPin,
    label: "Офисы",
    value: "Сочи • ул. Воронова, 12",
  },
  {
    icon: Clock,
    label: "График",
    value: "Пн-Пт 10:00—20:00, Сб 11:00—16:00",
  },
];

export default function ContactsPage() {
  return (
    <div className="space-y-16">
      <header className="rounded-[36px] border border-[#475C8C]/20 bg-white p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
          Контакты
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#121420] md:text-4xl">
          На связи в удобном для вас канале
        </h1>
        <p className="mt-4 text-base text-[#4a4e65]">
          Напишите, позвоните или оставьте заявку — travel-дизайнер ответит в
          течение 15 минут в рабочее время.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {contacts.map((contact) => (
          <div
            key={contact.label}
            className="flex items-start gap-4 rounded-[30px] border border-[#475C8C]/15 bg-gradient-to-br from-white to-[#eef2ff] p-6 shadow-[var(--shadow-card)]"
          >
            <contact.icon className="size-8 text-[#475C8C]" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#475C8C]/80">
                {contact.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-[#121420]">
                {contact.value}
              </p>
            </div>
          </div>
        ))}
      </section>

      <LeadForm title="Расскажите о задаче — вернёмся с предложением" />
      <div className="rounded-3xl border border-[#475C8C]/20 bg-white/70 p-6 shadow-[var(--shadow-card)]">
        <div className="TVBGradient TVBMediumSize" />
      </div>
    </div>
  );
}

