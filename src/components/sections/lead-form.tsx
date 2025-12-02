"use client";

interface LeadFormProps {
  title?: string;
  /**
   * Показывать ли блок "Быстрый подбор тура" с кнопкой Tourvisor.
   * По умолчанию включено, на странице круизов отключаем.
   */
  showQuickBlock?: boolean;
}

export function LeadForm({
  title = "Пора обсудить маршрут",
  showQuickBlock = true,
}: LeadFormProps) {
  return (
    <section
      id="lead-form"
      className="rounded-[32px] border border-[#475C8C]/20 bg-white p-6 shadow-[0_40px_80px_rgba(18,20,32,0.12)] md:p-10"
    >
      <div className="space-y-6">
        <div>
          {showQuickBlock && (
            <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/80">
              Быстрый подбор тура
            </p>
          )}
          <h3 className="mt-3 text-2xl font-semibold text-[#121420] md:text-3xl">
            {title}
          </h3>
          {showQuickBlock && (
            <p className="mt-2 text-base text-[#4a4e65]">
              Нажмите кнопку ниже — онлайн-ассистент подключит менеджера Oktour
              и отправит заявку напрямую туроператору.
            </p>
          )}
        </div>
        {showQuickBlock && (
          <div className="rounded-[28px] border border-dashed border-[#475C8C]/30 bg-[#f7f8fc] p-6">
            <div className="tv-free-button tv-moduleid-9986116" />
          </div>
        )}
      </div>
    </section>
  );
}

