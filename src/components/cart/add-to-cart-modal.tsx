"use client";

import { X, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourTitle: string;
}

export function AddToCartModal({
  isOpen,
  onClose,
  tourTitle,
}: AddToCartModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-[#475C8C] hover:bg-[#475C8C]/10"
        >
          <X className="size-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#475C8C]/10">
            <ShoppingCart className="size-8 text-[#475C8C]" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-[#121420]">
            Тур добавлен в корзину!
          </h3>

          <p className="mb-6 text-sm text-[#4a4e65]">
            {tourTitle}
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/krasnaya-polyana/checkout"
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-full bg-[#475C8C] px-6 py-3 text-base font-medium text-white transition hover:bg-[#475C8C]/90"
            >
              <span className="text-white">Перейти к оформлению</span>
              <ArrowRight className="size-5 text-white" />
            </Link>

            <Link
              href="/krasnaya-polyana"
              onClick={onClose}
              className="rounded-full border border-[#475C8C]/20 bg-white px-6 py-3 text-center text-base font-medium text-[#475C8C] transition hover:bg-[#475C8C]/10"
            >
              Смотреть ещё туры
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

