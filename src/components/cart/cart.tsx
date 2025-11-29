"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, X, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getCart, removeFromCart, getCartTotal, type CartItem } from "@/lib/cart";
import Image from "next/image";

export function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateCart = () => {
      setCart(getCart());
    };

    updateCart();
    
    // Слушаем изменения localStorage
    const handleStorageChange = () => {
      updateCart();
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", updateCart);

    // Проверяем изменения каждые 500ms (для синхронизации между вкладками)
    const interval = setInterval(updateCart, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", updateCart);
      clearInterval(interval);
    };
  }, []);

  const total = getCartTotal();
  const count = cart.length;

  const handleRemove = (tourId: number) => {
    removeFromCart(tourId);
    setCart(getCart());
    // Отправляем событие для обновления других компонентов
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Не показываем корзину, если она пуста и не открыта
  if (count === 0 && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Floating Cart Button - видна везде */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex size-16 items-center justify-center rounded-full bg-[#D9921D] shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95 md:bottom-8 md:right-8 md:size-20"
        aria-label={`Корзина: ${count} ${count === 1 ? 'тур' : count < 5 ? 'тура' : 'туров'}`}
      >
        <ShoppingCart className="size-7 text-white md:size-9" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#D9921D] shadow-md md:size-7 md:text-sm">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Cart Panel */}
          <div className="fixed right-0 top-0 z-[60] h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-[#475C8C]/20 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#121420]">
                  Корзина ({count})
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-[#475C8C] hover:bg-[#475C8C]/10 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="mb-4 size-16 text-[#475C8C]/30" />
                  <p className="text-lg font-medium text-[#121420]">
                    Корзина пуста
                  </p>
                  <p className="mt-2 text-sm text-[#4a4e65]">
                    Добавьте туры, чтобы начать
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 rounded-[20px] border border-[#475C8C]/15 bg-white p-4"
                      >
                        {item.image_url && (
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[12px]">
                            <Image
                              src={item.image_url}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-[#121420] line-clamp-2">
                              {item.title}
                            </h3>
                            {item.price !== null && (
                              <p className="mt-1 text-sm font-semibold text-[#475C8C]">
                                {item.price.toLocaleString("ru-RU")} ₽
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="mt-2 flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="size-3" />
                            <span>Удалить</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-[#475C8C]/20 pt-4">
                    <div className="flex items-center justify-between text-lg font-semibold text-[#121420]">
                      <span>Итого:</span>
                      <span className="text-[#475C8C]">
                        {total.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/krasnaya-polyana/checkout"
                    onClick={() => setIsOpen(false)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#475C8C] px-6 py-3 text-base font-medium text-white transition hover:bg-[#475C8C]/90 shadow-lg"
                  >
                    <span className="text-white">Оформить заказ</span>
                    <ArrowRight className="size-5 text-white" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

