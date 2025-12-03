import Script from "next/script";

export default function CruisesPage() {
  return (
    <div className="space-y-16">
      {/* Hero Video Section */}
      <section className="full-bleed relative -mt-10 h-[60vh] md:h-[70vh] lg:h-[80vh] lg:-mt-16 overflow-hidden" style={{ borderRadius: 0 }}>
        {/* Mobile video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover md:hidden"
        >
          <source src="/cruises/m.mp4" type="video/mp4" />
        </video>
        {/* Tablet video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hidden md:block lg:hidden absolute inset-0 w-full h-full object-cover"
        >
          <source src="/cruises/p.mp4" type="video/mp4" />
        </video>
        {/* Desktop video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hidden lg:block absolute inset-0 w-full h-full object-cover"
        >
          <source src="/cruises/d.mp4" type="video/mp4" />
        </video>
        
        {/* Unified gradient overlay: black top -> white bottom (no transparency in between) */}
        <div 
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.3) 70%, rgba(0, 0, 0, 0.1) 85%, #f7f8fc 100%)'
          }}
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center px-4 max-w-4xl">
            <p className="text-sm md:text-base uppercase tracking-[0.4em] text-white/95 mb-4 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              Морские и речные круизы
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
              <span className="text-[#D9921D] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">Откройте мир с палубы</span>
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              Премиум-лайнеры, речные маршруты и приватные яхты по всему миру
            </p>
          </div>
        </div>
      </section>

      {/* Виджет круизного оператора */}
      <section className="rounded-[32px] border border-[#475C8C]/20 bg-white p-4 shadow-[var(--shadow-card)]">
        <div id="awidget" />
      </section>

      <header className="space-y-4 rounded-[36px] border border-[#475C8C]/20 bg-white p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
          Круизы
        </p>
        <h1 className="text-3xl font-semibold text-[#121420] md:text-4xl">
          Морские и речные круизы по всему миру
        </h1>
        <p className="text-base text-[#4a4e65]">
          Подбираем круизы на лайнерах премиум-класса, речные маршруты по
          России, приватные яхты и чартеры. Все варианты с актуальными ценами и
          наличием.
        </p>
      </header>

      {/* Завершающий блок с пояснением */}
      <section className="rounded-[32px] border border-[#475C8C]/15 bg-gradient-to-br from-white to-[#f7f8fc] p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
          Как это работает
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[#121420] md:text-3xl">
          Мы сопровождаем вас на каждом этапе путешествия
        </h2>
        <p className="mt-3 text-base text-[#4a4e65]">
          Через модуль выше вы видите актуальные предложения круизного оператора
          в режиме реального времени. После подбора и предварительного расчёта
          мы берём на себя все детали: подтверждение брони, оформление документов,
          подбор перелётов и помощь с любыми вопросами до и во время круиза.
        </p>
        <p className="mt-3 text-sm text-[#4a4e65]">
          Если вы хотите обсудить индивидуальный маршрут, VIP-сервис или
          забронировать несколько кают для группы — свяжитесь с нами через раздел
          «Контакты», и персональный менеджер подберёт оптимальное решение.
        </p>
      </section>

      <Script id="cruise-widget-config" strategy="afterInteractive">
        {`
          window.awidgetInfo = {
            host: 'https://cruisenavigator.ru',
            agentId: '9921db41-e59c-4f4f-8c7d-556fbb94b619',
            background: '#ffffff'
          };
        `}
      </Script>
      <Script
        id="cruise-widget-runner"
        src="https://cruisenavigator.ru/widget/runner.js"
        strategy="afterInteractive"
      />
    </div>
  );
}

