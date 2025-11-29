import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS } from "@/data/navigation";

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "YouTube", href: "https://youtube.com" },
  { label: "Telegram", href: "https://t.me" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[#121420] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 lg:px-6">
        <div className="space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/5">
            <Image
              src="/logo/logo.png"
              alt="Oktour"
              width={56}
              height={56}
              sizes="56px"
            />
          </div>
          <p className="max-w-md text-base text-white/80">
            Международное туристическое агентство из Сочи. Наш главный офис
            находится в Сочи, откуда команда курирует все направления и
            поддерживает клиентов лично.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} Oktour • Офис в Сочи. Все права
              защищены.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-white/60">
              <Link
                href="/privacy-policy"
                className="hover:text-white/80 transition-colors"
              >
                Политика конфиденциальности
              </Link>
              <Link
                href="/public-offer"
                className="hover:text-white/80 transition-colors"
              >
                Публичная оферта
              </Link>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:justify-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              Навигация
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75 transition hover:border-white/30 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              Мы на связи
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {socialLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-white/70 transition hover:text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

