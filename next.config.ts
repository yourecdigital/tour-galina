import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Нужен standalone-вывод, чтобы Docker мог скопировать /app/.next/standalone
  output: "standalone",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
