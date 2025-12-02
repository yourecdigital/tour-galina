"use client";

import { useEffect, useState } from "react";
import { Mountain, Snowflake, Activity, Tag, MapPin, Calendar, Wallet, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { AddToCartModal } from "@/components/cart/add-to-cart-modal";
import { addToCart, type CartItem } from "@/lib/cart";

const activities = [
  {
    icon: Activity,
    title: "Горнолыжные туры",
    copy: "Ски-пассы, прокат оборудования, инструкторы для всех уровней подготовки.",
  },
  {
    icon: Mountain,
    title: "Активный отдых",
    copy: "Треккинг, рафтинг, велотуры, канатные дороги и смотровые площадки.",
  },
  {
    icon: Snowflake,
    title: "SPA и wellness",
    copy: "Горные курорты с термальными источниками, массажи, релаксация.",
  },
];

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

export default function KrasnayaPolyanaPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalTour, setModalTour] = useState<{ title: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [toursRes, categoriesRes] = await Promise.all([
        fetch("/api/tours"),
        fetch("/api/categories"),
      ]);

      const toursData = await toursRes.json();
      const categoriesData = await categoriesRes.json();

      setTours(toursData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTours = selectedCategory
    ? tours.filter((tour) => tour.category_id === selectedCategory)
    : tours;

  return (
    <div className="space-y-16">
      {/* Hero Video Section */}
      <section className="full-bleed relative -mt-10 h-[60vh] md:h-[70vh] lg:h-[80vh] lg:-mt-16 overflow-hidden" style={{ borderRadius: 0 }}>
        {/* Mobile video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover md:hidden"
        >
          <source src="/kp/m.mp4" type="video/mp4" />
        </video>
        {/* Tablet video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hidden md:block lg:hidden absolute inset-0 w-full h-full object-cover"
        >
          <source src="/kp/p.mp4" type="video/mp4" />
        </video>
        {/* Desktop video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hidden lg:block absolute inset-0 w-full h-full object-cover"
        >
          <source src="/kp/d.mp4" type="video/mp4" />
        </video>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center px-4 max-w-4xl">
            <p className="text-sm md:text-base uppercase tracking-[0.4em] text-white/90 mb-4 font-medium">
              Красная Поляна
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              Горнолыжный курорт
              <br />
              <span className="text-[#D9921D]">мирового уровня</span>
            </h1>
            <p className="text-base md:text-lg text-white/95 mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              Зимний и летний отдых в горах Кавказа
            </p>
          </div>
        </div>

        {/* Unified gradient overlay: black top -> white bottom (no transparency in between) */}
        <div 
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.3) 70%, rgba(0, 0, 0, 0.1) 85%, #f7f8fc 100%)'
          }}
        />
      </section>

      <header className="space-y-4 rounded-[36px] border border-[#475C8C]/20 bg-white p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
          Красная Поляна
        </p>
        <h1 className="text-3xl font-semibold text-[#121420] md:text-4xl">
          Горнолыжный курорт мирового уровня
        </h1>
        <p className="text-base text-[#4a4e65]">
          Подбираем туры на Красную Поляну: отели 4-5*, ски-пассы, трансферы,
          экскурсии. Зимний и летний сезоны с актуальными ценами и наличием.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {activities.map((activity) => (
          <article
            key={activity.title}
            className="rounded-[30px] border border-[#475C8C]/15 bg-gradient-to-br from-white to-[#eef2ff] p-6 shadow-[var(--shadow-card)]"
          >
            <activity.icon className="size-10 text-[#475C8C]" />
            <h2 className="mt-4 text-xl font-semibold text-[#121420]">
              {activity.title}
            </h2>
            <p className="mt-2 text-sm text-[#4a4e65]">{activity.copy}</p>
          </article>
        ))}
      </section>

      {/* Tours Section */}
      {tours.length > 0 && (
        <section className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-[#475C8C]/70">
              Наши туры
          </p>
          <h2 className="text-2xl font-semibold text-[#121420]">
              Популярные туры на Красную Поляну
          </h2>
          <p className="mt-1 text-sm text-[#4a4e65]">
              Выберите идеальный тур для вашего отдыха
          </p>
        </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? "bg-[#475C8C] text-white"
                    : "bg-white text-[#475C8C] border border-[#475C8C]/20 hover:bg-[#475C8C]/10"
                }`}
              >
                Все туры
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-[#475C8C] text-white"
                      : "bg-white text-[#475C8C] border border-[#475C8C]/20 hover:bg-[#475C8C]/10"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Tours Grid */}
          {loading ? (
            <div className="text-center py-12 text-[#475C8C]">Загрузка туров...</div>
          ) : filteredTours.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTours.map((tour) => {
                const mainImage = tour.image_url || (tour.photos && tour.photos.length > 0 ? tour.photos[0] : null);
                return (
                  <Link
                    key={tour.id}
                    href={`/krasnaya-polyana/tours/${tour.slug || tour.id}`}
                    className="group block"
                  >
                    <article className="rounded-[28px] border border-[#475C8C]/15 bg-gradient-to-br from-white to-[#eff2ff] p-6 shadow-[var(--shadow-card)] transition-all hover:scale-[1.02] hover:shadow-[0_35px_55px_-25px_rgb(18_20_32_/_0.45)]">
                      {mainImage && (
                        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-[20px]">
                          <img
                            src={mainImage}
                            alt={tour.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-[#121420] group-hover:text-[#475C8C] transition-colors">
                        {tour.title}
                      </h3>
                      {tour.description && (
                        <p className="mt-2 text-sm text-[#4a4e65] line-clamp-3">{tour.description}</p>
                      )}
                      <div className="mt-4 space-y-2">
                        {tour.price && (
                          <div className="flex items-center gap-2 text-base font-semibold text-[#475C8C]">
                            <Wallet size={18} />
                            <span>{tour.price.toLocaleString()} ₽</span>
                          </div>
                        )}
                        {tour.duration && (
                          <div className="flex items-center gap-2 text-sm text-[#4a4e65]">
                            <Calendar size={16} />
                            <span>{tour.duration}</span>
                          </div>
                        )}
                        {tour.location && (
                          <div className="flex items-center gap-2 text-sm text-[#4a4e65]">
                            <MapPin size={16} />
                            <span>{tour.location}</span>
                          </div>
                        )}
                        {tour.category_id && (
                          <div className="flex items-center gap-2 text-sm text-[#475C8C]">
                            <Tag size={16} />
                            <span>
                              {categories.find((c) => c.id === tour.category_id)?.name || "Без категории"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-[#475C8C] group-hover:underline">
                          Подробнее →
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const cartItem: CartItem = {
                              id: tour.id,
                              title: tour.title,
                              price: tour.price,
                              image_url: tour.image_url,
                              slug: tour.slug,
                            };
                            addToCart(cartItem);
                            setModalTour({ title: tour.title });
                          }}
                          className="flex items-center gap-2 rounded-full bg-[#475C8C] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#475C8C]/90"
                        >
                          <ShoppingCart className="size-4" />
                          <span>В корзину</span>
                        </button>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-[#4a4e65]">
              Туры не найдены. Попробуйте выбрать другую категорию.
        </div>
          )}
      </section>
      )}

      {/* Add to Cart Modal */}
      {modalTour && (
        <AddToCartModal
          isOpen={!!modalTour}
          onClose={() => setModalTour(null)}
          tourTitle={modalTour.title}
        />
      )}
    </div>
  );
}

