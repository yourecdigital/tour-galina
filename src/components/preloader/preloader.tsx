"use client";

import { useEffect, useState } from "react";
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

export function Preloader() {
  const [progress, setProgress] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const [slogan, setSlogan] = useState(travelSlogans[0]);

  useEffect(() => {
    // Выбираем случайный слоган при загрузке
    const randomSlogan = travelSlogans[Math.floor(Math.random() * travelSlogans.length)];
    setSlogan(randomSlogan);

    let currentProgress = 1;
    const targetProgress = 100;
    const duration = 3000; // 3 секунды для загрузки
    const startTime = Date.now();

    // Функция для обновления прогресса
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min(
        Math.floor((elapsed / duration) * (targetProgress - 1) + 1),
        targetProgress
      );

      if (progressPercent < targetProgress) {
        setProgress(progressPercent);
        requestAnimationFrame(updateProgress);
      } else {
        // Дожидаемся загрузки всех ресурсов
        const checkResources = () => {
          const images = document.querySelectorAll("img");
          const videos = document.querySelectorAll("video");
          let loadedCount = 0;
          const totalResources = images.length + videos.length;

          if (totalResources === 0) {
            setProgress(100);
            setTimeout(() => setIsVisible(false), 300);
            return;
          }

          const checkComplete = () => {
            loadedCount++;
            const resourceProgress = Math.min(
              95 + Math.floor((loadedCount / totalResources) * 5),
              100
            );
            setProgress(resourceProgress);

            if (loadedCount >= totalResources) {
              setTimeout(() => setIsVisible(false), 300);
            }
          };

          images.forEach((img) => {
            if ((img as HTMLImageElement).complete) {
              checkComplete();
            } else {
              img.addEventListener("load", checkComplete, { once: true });
              img.addEventListener("error", checkComplete, { once: true });
            }
          });

          videos.forEach((video) => {
            if ((video as HTMLVideoElement).readyState >= 3) {
              checkComplete();
            } else {
              video.addEventListener("loadeddata", checkComplete, { once: true });
              video.addEventListener("error", checkComplete, { once: true });
            }
          });
        };

        // Минимальное время показа прелоадера
        setTimeout(() => {
          if (document.readyState === "complete") {
            checkResources();
          } else {
            window.addEventListener("load", checkResources, { once: true });
          }
        }, 500);
      }
    };

    requestAnimationFrame(updateProgress);
  }, []);

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
          <div className="h-[200px] w-[200px] md:h-[192px] md:w-[192px]">
            <Image
              src="/Preloader/preload.gif"
              alt="Loading"
              width={200}
              height={200}
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
