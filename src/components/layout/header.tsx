"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NAV_LINKS } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleNavigate = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#252525]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <Link href="/" className="flex items-center" onClick={handleNavigate}>
          <div className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/5">
            <Image
              src="/logo/logo.png"
              alt="Oktour"
              width={44}
              height={44}
              sizes="44px"
              priority
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive =
              href === "/"
                ? pathname === href
                : pathname?.startsWith(href) ?? false;

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <div className="tv-free-button tv-moduleid-9986116" />
          </div>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 text-white lg:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Открыть меню"
          >
            {open ? <X size={20} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-[#1a1a1a] px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl bg-white/5 px-4 py-3 text-white/90 hover:bg-white/10"
                onClick={handleNavigate}
              >
                {label}
              </Link>
            ))}
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="tv-free-button tv-moduleid-9986116" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

