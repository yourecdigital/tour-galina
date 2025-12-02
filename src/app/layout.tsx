import type { Metadata } from "next";
import Script from "next/script";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import { Cart } from "@/components/cart/cart";
import { UnifiedPreloader } from "@/components/preloader/unified-preloader";
import { TourvisorLoader } from "@/components/tourvisor-loader";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oktour • Международное тур агентство",
  description:
    "Премиальный тревел-сервис Oktour: авторские маршруты по России, Европе, Азии и Ближнему Востоку.",
  metadataBase: new URL("https://oktour.example.com"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  keywords: [
    "Oktour",
    "Ok tour",
    "тур агентство Сочи",
    "поиск туров",
    "горящие туры",
    "туристические предложения",
  ],
  openGraph: {
    title: "Oktour — авторские путешествия по всему миру",
    description:
      "Интеллигентный сервис путешествий: Россия, зарубежные туры, лучшие отели, сильная команда тревел-дизайнеров.",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${manrope.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <UnifiedPreloader />
        {/* Tourvisor: перезапуск модулей при смене страниц */}
        <TourvisorLoader />
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-6 lg:py-16">
          {children}
        </main>
        <SiteFooter />
        <Cart />
        {/* Tourvisor: базовый инициализирующий скрипт, обязателен для работы виджетов */}
        <Script
          id="tourvisor-init"
          src="https://tourvisor.ru/module/init.js"
          strategy="beforeInteractive"
        />
        <Script
          id="oktour-schema"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            name: "Oktour",
            alternateName: ["Ok tour", "Oktour Travel"],
            url: "https://oktour.example.com",
            logo: "https://oktour.example.com/logo/logo.png",
            image: "https://oktour.example.com/logo/logo.png",
            description:
              "Oktour — международное туристическое агентство из Сочи. Поиск туров, горящие предложения, VIP-отдых.",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Ул. Калиновая Д. 18 корпус 4",
              addressLocality: "ПГТ Красная поляна",
              addressCountry: "RU",
            },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+7-918-919-77-73",
              contactType: "customer service",
              availableLanguage: ["ru", "en"],
            },
            sameAs: [
              "https://instagram.com",
              "https://youtube.com",
              "https://t.me",
            ],
          })}
        </Script>
        <Script
          id="oktour-website-schema"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Oktour",
            url: "https://oktour.example.com",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://oktour.example.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          })}
        </Script>
      </body>
    </html>
  );
}
