"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, MapPin, Calendar, Wallet, Image as ImageIcon, Video, Play, ShoppingCart } from "lucide-react";
import { addToCart, type CartItem } from "@/lib/cart";
import { AddToCartModal } from "@/components/cart/add-to-cart-modal";

interface Tour {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  photos: string[] | null;
  videos: string[] | null;
  category_id: number | null;
  duration: string | null;
  location: string | null;
  slug: string | null;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

export default function TourPage() {
  const params = useParams();
  const router = useRouter();
  const [tour, setTour] = useState<Tour | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({ full_name: "", phone: "" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);

  useEffect(() => {
    loadTour();
  }, [params.slug]);

  const loadTour = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tours/${params.slug}`);
      if (!res.ok) {
        router.push("/krasnaya-polyana");
        return;
      }
      const tourData = await res.json();
      setTour(tourData);

      // Загружаем категорию
      if (tourData.category_id) {
        const categoriesRes = await fetch("/api/categories");
        const categories = await categoriesRes.json();
        const cat = categories.find((c: Category) => c.id === tourData.category_id);
        setCategory(cat || null);
      }
    } catch (error) {
      console.error("Ошибка загрузки тура:", error);
      router.push("/krasnaya-polyana");
    } finally {
      setLoading(false);
    }
  };

  const getVideoEmbedUrl = (url: string): string | null => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Прямая ссылка на видео
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-[#475C8C]">Загрузка...</div>
      </div>
    );
  }

  if (!tour) {
    return null;
  }

  const mainImage = tour.image_url || (tour.photos && tour.photos.length > 0 ? tour.photos[0] : null);
  const allPhotos = tour.image_url
    ? [tour.image_url, ...(tour.photos || [])]
    : tour.photos || [];

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/krasnaya-polyana"
        className="inline-flex items-center gap-2 text-[#475C8C] hover:text-[#475C8C]/80"
      >
        <ArrowLeft size={20} />
        <span>Вернуться к турам</span>
      </Link>

      {/* Hero Section */}
      {mainImage ? (
        <div className="relative h-[400px] w-full overflow-hidden rounded-[36px] border border-[#475C8C]/20 shadow-[var(--shadow-card)] md:h-[500px]">
          <img
            src={mainImage}
            alt={tour.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-3xl font-semibold md:text-4xl">{tour.title}</h1>
            {tour.price && (
              <div className="mt-2 flex items-center gap-2 text-2xl font-bold">
                <Wallet size={24} />
                <span>{tour.price.toLocaleString()} ₽</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-[36px] border border-[#475C8C]/20 bg-gradient-to-br from-[#475C8C] to-[#475C8C]/80 p-8 shadow-[var(--shadow-card)]">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">{tour.title}</h1>
          {tour.price && (
            <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-white">
              <Wallet size={24} />
              <span>{tour.price.toLocaleString()} ₽</span>
            </div>
          )}
        </div>
      )}

      {/* Tour Info */}
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Description */}
          {tour.description && (
            <section className="rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="mb-4 text-2xl font-semibold text-[#121420]">Описание</h2>
              <p className="text-[#4a4e65] leading-relaxed whitespace-pre-line">{tour.description}</p>
            </section>
          )}

          {/* Photos Gallery */}
          {allPhotos.length > 0 && (
            <section className="rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-[#121420]">
                <ImageIcon className="text-[#475C8C]" size={24} />
                Фотографии ({allPhotos.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allPhotos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(photo)}
                    className="group relative aspect-video overflow-hidden rounded-[20px] border border-[#475C8C]/15 transition-transform hover:scale-105"
                  >
                    <img
                      src={photo}
                      alt={`${tour.title} - фото ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Videos */}
          {tour.videos && tour.videos.length > 0 && (
            <section className="rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-[#121420]">
                <Video className="text-[#475C8C]" size={24} />
                Видео ({tour.videos.length})
              </h2>
              <div className="space-y-6">
                {tour.videos.map((videoUrl, index) => {
                  const embedUrl = getVideoEmbedUrl(videoUrl);
                  return (
                    <div key={index} className="overflow-hidden rounded-[20px] border border-[#475C8C]/15">
                      {embedUrl ? (
                        <div className="relative aspect-video w-full">
                          {embedUrl.includes("youtube.com") || embedUrl.includes("vimeo.com") ? (
                            <iframe
                              src={embedUrl}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={embedUrl}
                              controls
                              className="h-full w-full"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-[#475C8C]/10">
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-full bg-[#475C8C] px-6 py-3 text-white hover:bg-[#475C8C]/90"
                          >
                            <Play size={20} />
                            <span>Открыть видео</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 text-xl font-semibold text-[#121420]">Информация о туре</h3>
            <div className="space-y-4">
              {category && (
                <div className="flex items-center gap-3">
                  <Tag className="text-[#475C8C]" size={20} />
                  <div>
                    <p className="text-xs text-[#4a4e65]">Категория</p>
                    <p className="font-medium text-[#121420]">{category.name}</p>
                  </div>
                </div>
              )}
              {tour.duration && (
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#475C8C]" size={20} />
                  <div>
                    <p className="text-xs text-[#4a4e65]">Длительность</p>
                    <p className="font-medium text-[#121420]">{tour.duration}</p>
                  </div>
                </div>
              )}
              {tour.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="text-[#475C8C]" size={20} />
                  <div>
                    <p className="text-xs text-[#4a4e65]">Место</p>
                    <p className="font-medium text-[#121420]">{tour.location}</p>
                  </div>
                </div>
              )}
              {tour.price && (
                <div className="flex items-center gap-3">
                  <Wallet className="text-[#475C8C]" size={20} />
                  <div>
                    <p className="text-xs text-[#4a4e65]">Цена</p>
                    <p className="text-xl font-semibold text-[#121420]">
                      {tour.price.toLocaleString()} ₽
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div className="rounded-[28px] border border-[#475C8C]/20 bg-gradient-to-br from-[#475C8C] to-[#475C8C]/80 p-6 text-white shadow-[var(--shadow-card)]">
            <h3 className="mb-2 text-xl font-semibold">Забронировать тур</h3>
            <p className="mb-4 text-sm opacity-90">
              Заполните форму, и мы свяжемся с вами в ближайшее время
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (!tour) return;
                  const cartItem: CartItem = {
                    id: tour.id,
                    title: tour.title,
                    price: tour.price,
                    image_url: tour.image_url,
                    slug: tour.slug,
                  };
                  addToCart(cartItem);
                  setShowAddToCartModal(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-base font-medium text-[#475C8C] hover:bg-white/90 transition-colors"
              >
                <ShoppingCart className="size-5" />
                <span>Добавить в корзину</span>
              </button>
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full rounded-full border border-white/20 bg-transparent px-6 py-3 text-base font-medium text-white hover:bg-white/10 transition-colors"
              >
                Забронировать напрямую
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute right-4 top-4 text-white hover:text-white/80"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
          <img
            src={selectedImage}
            alt={tour.title}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingFormModal
          tourTitle={tour.title}
          tourId={tour.id}
          onClose={() => {
            setShowBookingForm(false);
            setBookingSuccess(false);
            setBookingError("");
            setBookingData({ full_name: "", phone: "" });
          }}
        />
      )}

      {/* Add to Cart Modal */}
      {showAddToCartModal && tour && (
        <AddToCartModal
          isOpen={showAddToCartModal}
          onClose={() => setShowAddToCartModal(false)}
          tourTitle={tour.title}
        />
      )}
    </div>
  );
}

// Booking Form Component
function BookingFormModal({
  tourTitle,
  tourId,
  onClose,
}: {
  tourTitle: string;
  tourId: number;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({ full_name: "", phone: "", email: "", telegram: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: tourId,
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          telegram: formData.telegram.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка при отправке заявки");
      }

      setSuccess(true);
      // Закрываем форму через 2 секунды
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#121420]">Забронировать тур</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#4a4e65] hover:bg-[#475C8C]/10"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="rounded-[16px] bg-green-50 p-4 text-center">
              <div className="mb-2 text-4xl">✓</div>
              <h3 className="mb-2 text-lg font-semibold text-green-800">
                Заявка отправлена!
              </h3>
              <p className="text-sm text-green-700">
                Мы свяжемся с вами в ближайшее время
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-[#4a4e65]">
              Тур: <span className="font-medium text-[#121420]">{tourTitle}</span>
            </p>

            {error && (
              <div className="mb-4 rounded-[16px] bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#121420]">
                  ФИО *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                  placeholder="Иванов Иван Иванович"
                  className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#121420]">
                  Номер телефона *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  placeholder="+7 (999) 123-45-67"
                  className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#121420]">
                  Email (необязательно)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="ivan@example.com"
                  className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#121420]">
                  Telegram (необязательно)
                </label>
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) =>
                    setFormData({ ...formData, telegram: e.target.value })
                  }
                  placeholder="@username"
                  className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-[#475C8C]/20 px-4 py-3 text-sm font-medium text-[#475C8C] hover:bg-[#475C8C]/10"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full bg-[#475C8C] px-4 py-3 text-sm font-medium text-white hover:bg-[#475C8C]/90 disabled:opacity-50"
                >
                  {loading ? "Отправка..." : "Отправить заявку"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

