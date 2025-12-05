"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LeadForm } from "@/components/sections/lead-form";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  quote: string | null;
  photo: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const res = await fetch("/api/team-members");
      if (!res.ok) {
        throw new Error(`Ошибка загрузки: ${res.status}`);
      }
      const data = await res.json();
      setTeam(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ошибка загрузки команды:", error);
      setTeam([]);
    } finally {
      setLoading(false);
    }
  };
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
        {loading ? (
          <div className="col-span-2 text-center py-12 text-[#475C8C]">
            Загрузка команды...
          </div>
        ) : team.length > 0 ? (
          team.map((person) => (
            <article
              key={person.id}
              className="rounded-[30px] border border-[#475C8C]/20 bg-white/90 p-6 shadow-[var(--shadow-card)]"
            >
              <div className="grid gap-4">
                <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[#475C8C]/5">
                  {person.photo ? (
                    <Image
                      src={person.photo}
                      alt={person.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      priority={person.display_order === 0}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#475C8C]/30">
                      <span className="text-4xl">👤</span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121420]/30 to-transparent" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#121420]">
                    {person.name}
                  </h2>
                  <p className="mt-1 text-sm font-medium uppercase tracking-[0.3em] text-[#475C8C]/70">
                    {person.role}
                  </p>
                  {person.quote && (
                    <p className="mt-3 text-sm text-[#4a4e65]">{person.quote}</p>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-[#4a4e65]">
            Члены команды не найдены
          </div>
        )}
      </section>

      <LeadForm title="Познакомьтесь с travel-дизайнером Oktour" />
    </div>
  );
}

