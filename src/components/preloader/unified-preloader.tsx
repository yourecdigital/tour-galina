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

export function UnifiedPreloader() {
  const [progress, setProgress] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const [slogan, setSlogan] = useState(travelSlogans[0]);
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Страницы, на которых не нужно показывать прелоадер
  const excludedPaths = ['/team', '/contacts', '/admin', '/admin/login'];

  useEffect(() => {
    // Не показываем прелоадер на исключенных страницах
    if (excludedPaths.some(path => pathname?.startsWith(path))) {
      setIsVisible(false);
      return;
    }

    // Выбираем случайный слоган
    const randomSlogan = travelSlogans[Math.floor(Math.random() * travelSlogans.length)];
    setSlogan(randomSlogan);

    // Если это первая загрузка - используем ту же логику, что и при переходах
    if (isInitialLoad) {
      setIsInitialLoad(false);
      setProgress(1);
      setIsVisible(true);

      const targetProgress = 100;
      const duration = 1500; // Та же длительность, что и при переходах
      const startTime = Date.now();
      let lastDisplayedProgress = 1;

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        
        // Плавное линейное увеличение от 1 до 100
        const currentProgress = 1 + (progressRatio * (targetProgress - 1));
        const displayProgress = Math.min(Math.floor(currentProgress), targetProgress);
        
        // Обновляем только если значение увеличилось и не превышает 100
        if (displayProgress > lastDisplayedProgress && displayProgress <= targetProgress) {
          setProgress(displayProgress);
          lastDisplayedProgress = displayProgress;
        }

        if (displayProgress < targetProgress) {
          requestAnimationFrame(updateProgress);
        } else {
          // Фиксируем на 100% и не меняем больше
          setProgress(100);
          lastDisplayedProgress = 100;
          setTimeout(() => {
            setIsVisible(false);
          }, 200);
        }
      };

      requestAnimationFrame(updateProgress);
    } else {
      // Это переход между страницами
      setProgress(1);
      setIsVisible(true);

      const targetProgress = 100;
      const duration = 1500; // 1.5 секунды для перехода
      const startTime = Date.now();
      let lastDisplayedProgress = 1;

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        
        // Плавное линейное увеличение от 1 до 100
        const currentProgress = 1 + (progressRatio * (targetProgress - 1));
        const displayProgress = Math.min(Math.floor(currentProgress), targetProgress);
        
        // Обновляем только если значение увеличилось и не превышает 100
        if (displayProgress > lastDisplayedProgress && displayProgress <= targetProgress) {
          setProgress(displayProgress);
          lastDisplayedProgress = displayProgress;
        }

        if (displayProgress < targetProgress) {
          requestAnimationFrame(updateProgress);
        } else {
          // Фиксируем на 100% и не меняем больше
          setProgress(100);
          lastDisplayedProgress = 100;
          setTimeout(() => {
            setIsVisible(false);
          }, 200);
        }
      };

      requestAnimationFrame(updateProgress);
    }
  }, [pathname, isInitialLoad]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f7f8fc]"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s ease-out",
      }}
    >
      <div className="flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center">
          <Image
            src="/Preloader/preload.gif"
            alt="Loading"
            width={120}
            height={120}
            className="h-24 w-24 md:h-32 md:w-32"
            unoptimized
            priority
          />
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
              className="h-full rounded-full bg-gradient-to-r from-[#475C8C] to-[#D9921D] transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          {/* Progress Counter */}
          <div className="text-center">
            <span className="text-2xl font-semibold text-[#475C8C] md:text-3xl">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

