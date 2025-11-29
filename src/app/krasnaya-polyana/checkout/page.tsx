"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, User, Phone, Mail, Send } from "lucide-react";
import Link from "next/link";
import { getCart, clearCart, type CartItem } from "@/lib/cart";
import Image from "next/image";

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    telegram: "",
  });
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToOffer, setAgreedToOffer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cartData = getCart();
    setCart(cartData);

    if (cartData.length === 0) {
      // Если корзина пуста, перенаправляем на страницу туров
      window.location.href = "/krasnaya-polyana";
    }
  }, []);

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.full_name || !formData.phone) {
      setError("Пожалуйста, заполните имя и телефон");
      setLoading(false);
      return;
    }

    if (!agreedToPrivacy || !agreedToOffer) {
      setError("Необходимо согласиться с политикой конфиденциальности и публичной офертой");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          cart,
          total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при отправке заказа");
      }

      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || "Произошла ошибка. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-[28px] border border-[#475C8C]/20 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="size-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-[#121420]">
            Заказ отправлен!
          </h2>
          <p className="mb-6 text-[#4a4e65]">
            Мы свяжемся с вами в ближайшее время для подтверждения заказа.
          </p>
          <Link
            href="/krasnaya-polyana"
            className="inline-flex items-center gap-2 rounded-full bg-[#475C8C] px-6 py-3 text-base font-medium text-white !text-white transition hover:bg-[#475C8C]/90"
          >
            Вернуться к турам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/krasnaya-polyana"
          className="rounded-full p-2 text-[#475C8C] hover:bg-[#475C8C]/10"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-[#121420]">
          Оформление заказа
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Cart Summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#121420]">
            Ваш заказ ({cart.length})
          </h2>
          <div className="space-y-3 rounded-[20px] border border-[#475C8C]/20 bg-white p-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-[16px] border border-[#475C8C]/10 bg-white p-3"
              >
                {item.image_url && (
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[12px]">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-[#121420] line-clamp-2">
                    {item.title}
                  </h3>
                  {item.price !== null && (
                    <p className="mt-1 text-sm font-semibold text-[#475C8C]">
                      {item.price.toLocaleString("ru-RU")} ₽
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[20px] border border-[#475C8C]/20 bg-gradient-to-br from-[#475C8C] to-[#475C8C]/80 p-4 text-white">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Итого:</span>
              <span>{total.toLocaleString("ru-RU")} ₽</span>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#121420]">
            Контактные данные
          </h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[20px] border border-[#475C8C]/20 bg-white p-6"
          >
            {error && (
              <div className="rounded-[12px] bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#121420]">
                <User className="size-4 text-[#475C8C]" />
                Имя и фамилия *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
                className="w-full rounded-[12px] border border-[#475C8C]/20 bg-white px-4 py-3 text-[#121420] placeholder:text-[#475C8C]/50 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                placeholder="Иван Иванов"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#121420]">
                <Phone className="size-4 text-[#475C8C]" />
                Телефон *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="w-full rounded-[12px] border border-[#475C8C]/20 bg-white px-4 py-3 text-[#121420] placeholder:text-[#475C8C]/50 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#121420]">
                <Mail className="size-4 text-[#475C8C]" />
                Email (необязательно)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-[12px] border border-[#475C8C]/20 bg-white px-4 py-3 text-[#121420] placeholder:text-[#475C8C]/50 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                placeholder="ivan@example.com"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#121420]">
                <svg
                  className="size-4 text-[#475C8C]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                </svg>
                Telegram (необязательно)
              </label>
              <input
                type="text"
                value={formData.telegram}
                onChange={(e) =>
                  setFormData({ ...formData, telegram: e.target.value })
                }
                className="w-full rounded-[12px] border border-[#475C8C]/20 bg-white px-4 py-3 text-[#121420] placeholder:text-[#475C8C]/50 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                placeholder="@username"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="mt-1 size-4 rounded border-[#475C8C]/20 text-[#475C8C] focus:ring-2 focus:ring-[#475C8C]"
                />
                <span className="text-sm text-[#4a4e65]">
                  Я согласен(а) с{" "}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    className="text-[#475C8C] hover:underline"
                  >
                    политикой конфиденциальности
                  </Link>
                  {" *"}
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToOffer}
                  onChange={(e) => setAgreedToOffer(e.target.checked)}
                  className="mt-1 size-4 rounded border-[#475C8C]/20 text-[#475C8C] focus:ring-2 focus:ring-[#475C8C]"
                />
                <span className="text-sm text-[#4a4e65]">
                  Я согласен(а) с{" "}
                  <Link
                    href="/public-offer"
                    target="_blank"
                    className="text-[#475C8C] hover:underline"
                  >
                    публичной офертой
                  </Link>
                  {" *"}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || cart.length === 0 || !agreedToPrivacy || !agreedToOffer}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#475C8C] px-6 py-3 text-base font-medium text-white transition hover:bg-[#475C8C]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Отправка...</span>
                </>
              ) : (
                <>
                  <Send className="size-5" />
                  <span>Отправить заказ</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


