import type { ReactNode } from "react";

export default function InternationalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-0 lg:px-6 lg:pb-16 lg:pt-0">
      {children}
    </div>
  );
}

