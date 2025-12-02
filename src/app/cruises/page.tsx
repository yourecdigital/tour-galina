import Script from "next/script";

export default function CruisesPage() {
  return (
    <div className="space-y-16">
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

      {/* Виджет круизного оператора */}
      <section className="rounded-[32px] border border-[#475C8C]/20 bg-white p-4 shadow-[var(--shadow-card)]">
        <div id="awidget" />
      </section>

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

