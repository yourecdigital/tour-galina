import type { NextConfig } from "next";

// Для серверного деплоя через Docker нам НЕ нужен статический export,
// иначе падает сборка из‑за API маршрутов (output: "export" запрещает их).
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
