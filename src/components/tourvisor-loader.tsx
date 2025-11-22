"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    TV?: {
      loadModules?: () => void;
    };
  }
}

export function TourvisorLoader() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.TV?.loadModules?.();
  }, [pathname]);

  return null;
}


