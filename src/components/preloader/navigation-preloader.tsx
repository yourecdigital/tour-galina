"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const travelSlogans = [
  "Открываем мир для вас...",
  "Ищем лучшие туры...",
  "Подбираем идеальный отдых...",
  "Путешествуйте с нами...",
  "Ваше приключение начинается...",
  "Открываем новые горизонты...",
  "Создаём незабываемые моменты...",
  "Ваш идеальный тур уже ждёт...",
];

export function NavigationPreloader() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [slogan, setSlogan] = useState(travelSlogans[0]);
  const pathname = usePathname();

  // Страницы, на которых не нужно показывать прелоадер
  const excludedPaths = ['/team', '/contacts', '/admin', '/admin/login'];

  useEffect(() => {
    // Не показываем прелоадер на исключенных страницах
    if (excludedPaths.some(path => pathname?.startsWith(path))) {
      setIsLoading(false);
      return;
    }

    // Выбираем случайный слоган при каждом переходе
    const randomSlogan = travelSlogans[Math.floor(Math.random() * travelSlogans.length)];
    setSlogan(randomSlogan);
    setProgress(1);
    setIsLoading(true);

    // Анимация прогресса от 1 до 100 с плавным равномерным увеличением
    const targetProgress = 100;
    const duration = 1500; // 1.5 секунды для более плавного перехода
    const startTime = Date.now();
    let lastProgress = 1;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      // Линейное увеличение от 1 до 100
      const progressPercent = Math.max(1, Math.min(
        Math.floor(1 + (progressRatio * (targetProgress - 1))),
        targetProgress
      ));

      // Обновляем только если прогресс увеличился (не скачет назад)
      if (progressPercent >= lastProgress && progressPercent < targetProgress) {
        setProgress(progressPercent);
        lastProgress = progressPercent;
        requestAnimationFrame(updateProgress);
      } else if (progressPercent >= targetProgress) {
        setProgress(100);
        // Небольшая задержка перед скрытием для плавности
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      } else {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f7f8fc]"
      style={{
        opacity: isLoading ? 1 : 0,
        transition: "opacity 0.2s ease-out",
      }}
    >
      <div className="flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center">
          <div className="h-[180px] w-[180px] md:h-[168px] md:w-[168px]">
            <Image
              src="/Preloader/preload.gif"
              alt="Loading"
              width={180}
              height={180}
              className="h-full w-full object-contain"
              unoptimized
              priority
            />
          </div>
        </div>

        {/* Slogan */}
        <div className="mb-8 text-center">
          <p className="text-lg font-semibold text-[#475C8C] md:text-xl">
            {slogan}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs md:max-w-md">
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-[#475C8C]/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#475C8C] to-[#D9921D] transition-all duration-150 ease-out"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          {/* Progress Counter */}
          <div className="text-center">
            <span className="text-xl font-semibold text-[#475C8C] md:text-2xl">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

