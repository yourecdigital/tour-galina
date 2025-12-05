"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Edit, Trash2, Tag, MapPin, Calendar, Wallet, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { FileUploader } from "@/components/ui/file-uploader";

interface Tour {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  photos: string[] | null;
  videos: string[] | null;
  category_id: number | null;
  subcategory_id: number | null;
  duration: string | null;
  location: string | null;
  created_at: string;
}

interface Booking {
  id: number;
  tour_id: number;
  full_name: string;
  phone: string;
  status: string;
  created_at: string;
  tour_title?: string;
}

interface Category {
  id: number;
  name: string;
  created_at: string;
}

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
  category_name?: string;
  created_at: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  quote: string | null;
  photo: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState<"tours" | "categories" | "hero-video" | "hero-video-home" | "hero-video-cruises" | "team">("tours");
  const [showTourForm, setShowTourForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [showTeamMemberForm, setShowTeamMemberForm] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "tour" | "category" | "subcategory" | "team"; id: number; name: string } | null>(null);

  // Проверка аутентификации
  useEffect(() => {
    checkAuth();
  }, []);

  // Загрузка данных
  useEffect(() => {
    if (authenticated) {
      loadTours();
      loadCategories();
      loadSubcategories();
      loadTeamMembers();
    }
  }, [authenticated]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/check");
      const data = await res.json();
      if (!data.authenticated) {
        router.push("/admin/login");
      } else {
        setAuthenticated(true);
      }
    } catch (error) {
      router.push("/admin/login");
    }
  };

  const loadTours = async () => {
    try {
      const res = await fetch("/api/tours");
      const data = await res.json();
      setTours(data);
    } catch (error) {
      console.error("Ошибка загрузки туров:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    }
  };

  const loadSubcategories = async () => {
    try {
      const res = await fetch("/api/subcategories");
      const data = await res.json();
      setSubcategories(data);
    } catch (error) {
      console.error("Ошибка загрузки подкатегорий:", error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const res = await fetch("/api/team-members");
      if (!res.ok) {
        throw new Error(`Ошибка загрузки: ${res.status}`);
      }
      const data = await res.json();
      setTeamMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ошибка загрузки членов команды:", error);
      setTeamMembers([]);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleDeleteTour = (tour: Tour) => {
    setDeleteConfirm({ type: "tour", id: tour.id, name: tour.title });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setLoading(true);
      let url = "";
      if (deleteConfirm.type === "tour") {
        url = `/api/tours/${deleteConfirm.id}`;
      } else if (deleteConfirm.type === "category") {
        url = `/api/categories/${deleteConfirm.id}`;
      } else if (deleteConfirm.type === "subcategory") {
        url = `/api/subcategories/${deleteConfirm.id}`;
      } else if (deleteConfirm.type === "team") {
        url = `/api/team-members/${deleteConfirm.id}`;
      }
      await fetch(url, { method: "DELETE" });
      
      if (deleteConfirm.type === "tour") {
        loadTours();
      } else if (deleteConfirm.type === "category") {
        loadCategories();
        loadSubcategories();
      } else if (deleteConfirm.type === "subcategory") {
        loadSubcategories();
      } else if (deleteConfirm.type === "team") {
        loadTeamMembers();
      }
      setDeleteConfirm(null);
    } catch (error) {
      alert("Ошибка при удалении");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setDeleteConfirm({ type: "category", id: category.id, name: category.name });
  };

  const handleDeleteSubcategory = (subcategory: Subcategory) => {
    setDeleteConfirm({ type: "subcategory", id: subcategory.id, name: subcategory.name });
  };

  const handleDeleteTeamMember = (member: TeamMember) => {
    setDeleteConfirm({ type: "team", id: member.id, name: member.name });
  };

  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-[#475C8C]">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
          <div>
            <h1 className="text-3xl font-semibold text-[#121420]">Админ-панель</h1>
            <p className="mt-1 text-sm text-[#4a4e65]">Управление турами Красной Поляны</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/krasnaya-polyana"
              className="rounded-full px-4 py-2 text-sm font-medium text-[#475C8C] hover:bg-[#475C8C]/10"
            >
              Посмотреть сайт
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full bg-[#475C8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#475C8C]/90"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-[20px] border border-[#475C8C]/20 bg-white p-2 shadow-[var(--shadow-card)]">
          <button
            onClick={() => setActiveTab("tours")}
            className={`flex-1 rounded-[16px] px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "tours"
                ? "bg-[#475C8C] text-white"
                : "text-[#475C8C] hover:bg-[#475C8C]/10"
            }`}
          >
            Туры ({tours.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex-1 rounded-[16px] px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "categories"
                ? "bg-[#475C8C] text-white"
                : "text-[#475C8C] hover:bg-[#475C8C]/10"
            }`}
          >
            Категории ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("hero-video")}
            className={`flex-1 rounded-[16px] px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "hero-video"
                ? "bg-[#475C8C] text-white"
                : "text-[#475C8C] hover:bg-[#475C8C]/10"
            }`}
          >
            Шапка Красная Поляна
          </button>
          <button
            onClick={() => setActiveTab("hero-video-home")}
            className={`flex-1 rounded-[16px] px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "hero-video-home"
                ? "bg-[#475C8C] text-white"
                : "text-[#475C8C] hover:bg-[#475C8C]/10"
            }`}
          >
            Шапка Главная
          </button>
          <button
            onClick={() => setActiveTab("hero-video-cruises")}
            className={`flex-1 rounded-[16px] px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "hero-video-cruises"
                ? "bg-[#475C8C] text-white"
                : "text-[#475C8C] hover:bg-[#475C8C]/10"
            }`}
          >
            Шапка Круизы
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`flex-1 rounded-[16px] px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "team"
                ? "bg-[#475C8C] text-white"
                : "text-[#475C8C] hover:bg-[#475C8C]/10"
            }`}
          >
            Команда ({teamMembers.length})
          </button>
        </div>

        {/* Tours Tab */}
        {activeTab === "tours" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-2xl font-semibold text-[#121420]">Туры</h2>
              <button
                onClick={() => {
                  setEditingTour(null);
                  setShowTourForm(true);
                }}
                className="flex items-center gap-2 rounded-full bg-[#475C8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#475C8C]/90"
              >
                <Plus size={16} />
                Добавить тур
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="rounded-[28px] border border-[#475C8C]/15 bg-gradient-to-br from-white to-[#eff2ff] p-6 shadow-[var(--shadow-card)]"
                >
                  {tour.image_url && (
                    <img
                      src={tour.image_url}
                      alt={tour.title}
                      className="mb-4 h-48 w-full rounded-[20px] object-cover"
                    />
                  )}
                  {!tour.image_url && tour.photos && tour.photos.length > 0 && (
                    <img
                      src={tour.photos[0]}
                      alt={tour.title}
                      className="mb-4 h-48 w-full rounded-[20px] object-cover"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-[#121420]">{tour.title}</h3>
                  {(tour.photos && tour.photos.length > 0) || (tour.videos && tour.videos.length > 0) ? (
                    <div className="mt-2 flex gap-2 text-xs text-[#475C8C]">
                      {tour.photos && tour.photos.length > 0 && (
                        <span>📷 {tour.photos.length} фото</span>
                      )}
                      {tour.videos && tour.videos.length > 0 && (
                        <span>🎥 {tour.videos.length} видео</span>
                      )}
                    </div>
                  ) : null}
                  {tour.description && (
                    <p className="mt-2 text-sm text-[#4a4e65] line-clamp-2">{tour.description}</p>
                  )}
                  <div className="mt-4 space-y-2">
                    {tour.price && (
                      <div className="flex items-center gap-2 text-sm text-[#475C8C]">
                        <Wallet size={16} />
                        <span>{tour.price.toLocaleString()} ₽</span>
                      </div>
                    )}
                    {tour.duration && (
                      <div className="flex items-center gap-2 text-sm text-[#475C8C]">
                        <Calendar size={16} />
                        <span>{tour.duration}</span>
                      </div>
                    )}
                    {tour.location && (
                      <div className="flex items-center gap-2 text-sm text-[#475C8C]">
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
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingTour(tour);
                        setShowTourForm(true);
                      }}
                      className="flex-1 rounded-full bg-[#475C8C]/10 px-4 py-2 text-sm font-medium text-[#475C8C] hover:bg-[#475C8C]/20"
                    >
                      <Edit size={16} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDeleteTour(tour)}
                      disabled={loading}
                      className="flex-1 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-200"
                    >
                      <Trash2 size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-2xl font-semibold text-[#121420]">Категории</h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryForm(true);
                }}
                className="flex items-center gap-2 rounded-full bg-[#475C8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#475C8C]/90"
              >
                <Plus size={16} />
                Добавить категорию
              </button>
            </div>

            <div className="space-y-4">
              {categories.map((category) => {
                const categorySubcategories = subcategories.filter(s => s.category_id === category.id);
                const isExpanded = expandedCategories.has(category.id);
                
                return (
                  <div
                    key={category.id}
                    className="rounded-[20px] border border-[#475C8C]/15 bg-gradient-to-br from-white to-[#eff2ff] shadow-[var(--shadow-card)] overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleCategoryExpansion(category.id)}
                          className="text-[#475C8C] hover:text-[#475C8C]/80"
                        >
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>
                        <Tag className="text-[#475C8C]" size={20} />
                        <span className="font-medium text-[#121420]">{category.name}</span>
                        <span className="text-sm text-[#4a4e65]">
                          ({categorySubcategories.length} подкатегорий)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingSubcategory(null);
                            setEditingCategory(category);
                            setShowSubcategoryForm(true);
                          }}
                          className="rounded-full bg-[#D9921D]/10 p-2 text-[#D9921D] hover:bg-[#D9921D]/20"
                          title="Добавить подкатегорию"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setShowCategoryForm(true);
                          }}
                          className="rounded-full bg-[#475C8C]/10 p-2 text-[#475C8C] hover:bg-[#475C8C]/20"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          disabled={loading}
                          className="rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Подкатегории */}
                    {isExpanded && (
                      <div className="border-t border-[#475C8C]/10 bg-white/50 px-4 py-3 space-y-2">
                        {categorySubcategories.length > 0 ? (
                          categorySubcategories.map((subcategory) => (
                            <div
                              key={subcategory.id}
                              className="flex items-center justify-between rounded-[12px] border border-[#D9921D]/20 bg-gradient-to-r from-[#D9921D]/5 to-transparent p-3"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-[#D9921D]" />
                                <span className="text-sm font-medium text-[#121420]">{subcategory.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingSubcategory(subcategory);
                                    setShowSubcategoryForm(true);
                                  }}
                                  className="rounded-full bg-[#D9921D]/10 p-1.5 text-[#D9921D] hover:bg-[#D9921D]/20"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubcategory(subcategory)}
                                  disabled={loading}
                                  className="rounded-full bg-red-100 p-1.5 text-red-600 hover:bg-red-200"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-[#4a4e65] italic">Нет подкатегорий</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tour Form Modal */}
        {showTourForm && (
          <TourFormModal
            tour={editingTour}
            categories={categories}
            onClose={() => {
              setShowTourForm(false);
              setEditingTour(null);
            }}
            onSuccess={() => {
              loadTours();
              setShowTourForm(false);
              setEditingTour(null);
            }}
          />
        )}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <CategoryFormModal
            category={editingCategory}
            onClose={() => {
              setShowCategoryForm(false);
              setEditingCategory(null);
            }}
            onSuccess={() => {
              loadCategories();
              setShowCategoryForm(false);
              setEditingCategory(null);
            }}
          />
        )}

        {/* Subcategory Form Modal */}
        {showSubcategoryForm && (
          <SubcategoryFormModal
            subcategory={editingSubcategory}
            category={editingCategory}
            categories={categories}
            onClose={() => {
              setShowSubcategoryForm(false);
              setEditingSubcategory(null);
              setEditingCategory(null);
            }}
            onSuccess={() => {
              loadSubcategories();
              setShowSubcategoryForm(false);
              setEditingSubcategory(null);
              setEditingCategory(null);
            }}
          />
        )}

        {/* Hero Video Tab */}
        {activeTab === "hero-video" && (
          <HeroVideoManager apiEndpoint="/api/hero-video" />
        )}

        {/* Hero Video Home Tab */}
        {activeTab === "hero-video-home" && (
          <HeroVideoManager apiEndpoint="/api/hero-video-home" title="Управление шапкой главной страницы" />
        )}

        {/* Hero Video Cruises Tab */}
        {activeTab === "hero-video-cruises" && (
          <HeroVideoManager apiEndpoint="/api/hero-video-cruises" title="Управление шапкой страницы круизов" />
        )}

        {/* Team Tab */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-2xl font-semibold text-[#121420]">Члены команды</h2>
              <button
                onClick={() => {
                  setEditingTeamMember(null);
                  setShowTeamMemberForm(true);
                }}
                className="flex items-center gap-2 rounded-full bg-[#475C8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#475C8C]/90"
              >
                <Plus size={16} />
                Добавить члена команды
              </button>
            </div>

            {teamMembers.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-[20px] border border-[#475C8C]/15 bg-gradient-to-br from-white to-[#eff2ff] p-4 shadow-[var(--shadow-card)]"
                  >
                    <div className="mb-4 aspect-square w-full overflow-hidden rounded-[16px] bg-[#475C8C]/5">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#475C8C]/30">
                          <span className="text-4xl">👤</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-[#121420]">{member.name}</h3>
                    <p className="mt-1 text-sm text-[#4a4e65] line-clamp-2">{member.role}</p>
                    {member.quote && (
                      <p className="mt-2 text-xs text-[#4a4e65] line-clamp-2">{member.quote}</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTeamMember(member);
                          setShowTeamMemberForm(true);
                        }}
                        className="flex-1 rounded-full bg-[#475C8C]/10 px-4 py-2 text-sm font-medium text-[#475C8C] hover:bg-[#475C8C]/20"
                      >
                        <Edit size={16} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeamMember(member)}
                        disabled={loading}
                        className="flex-1 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-200"
                      >
                        <Trash2 size={16} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[20px] border border-[#475C8C]/15 bg-white p-8 text-center">
                <p className="text-[#4a4e65]">Члены команды не найдены. Добавьте первого члена команды.</p>
              </div>
            )}
          </div>
        )}

        {/* Team Member Form Modal */}
        {showTeamMemberForm && (
          <TeamMemberFormModal
            member={editingTeamMember}
            onClose={() => {
              setShowTeamMemberForm(false);
              setEditingTeamMember(null);
            }}
            onSuccess={() => {
              loadTeamMembers();
              setShowTeamMemberForm(false);
              setEditingTeamMember(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <DeleteConfirmModal
            type={deleteConfirm.type}
            name={deleteConfirm.name}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteConfirm(null)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

// Tour Form Component
function TourFormModal({
  tour,
  categories,
  onClose,
  onSuccess,
}: {
  tour: Tour | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [formData, setFormData] = useState({
    title: tour?.title || "",
    description: tour?.description || "",
    price: tour?.price?.toString() || "",
    image_url: tour?.image_url || "",
    category_id: tour?.category_id?.toString() || "",
    subcategory_id: tour?.subcategory_id?.toString() || "",
    duration: tour?.duration || "",
    location: tour?.location || "",
    photos: tour?.photos || [],
    videos: tour?.videos || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Загружаем подкатегории при изменении категории
  useEffect(() => {
    if (formData.category_id) {
      fetch(`/api/subcategories?categoryId=${formData.category_id}`)
        .then(res => res.json())
        .then(data => setSubcategories(data))
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id]);

  // Сбрасываем подкатегорию при изменении категории
  useEffect(() => {
    if (!formData.category_id) {
      setFormData(prev => ({ ...prev, subcategory_id: "" }));
    }
  }, [formData.category_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = {
        title: formData.title,
        description: formData.description || null,
        price: formData.price ? parseInt(formData.price) : null,
        image_url: formData.image_url || null,
        photos: formData.photos.length > 0 ? formData.photos : null,
        videos: formData.videos.length > 0 ? formData.videos : null,
        category_id: formData.category_id && formData.category_id !== "" ? parseInt(formData.category_id) : null,
        subcategory_id: formData.subcategory_id && formData.subcategory_id !== "" ? parseInt(formData.subcategory_id) : null,
        duration: formData.duration || null,
        location: formData.location || null,
      };

      const url = tour ? `/api/tours/${tour.id}` : "/api/tours";
      const method = tour ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка при сохранении");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="w-full max-w-2xl rounded-[28px] border border-[#475C8C]/20 bg-white shadow-[var(--shadow-card)] flex flex-col"
        style={{
          maxHeight: '90vh',
          height: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок - закреплен */}
        <div className="flex-shrink-0 bg-white rounded-t-[28px] px-4 md:px-6 pt-4 md:pt-6 pb-4 border-b border-[#475C8C]/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-2xl font-semibold text-[#121420]">
              {tour ? "Редактировать тур" : "Добавить тур"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#4a4e65] hover:bg-[#475C8C]/10 transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Контент - прокручиваемый */}
        <div 
          className="flex-1 overflow-y-auto px-4 md:px-6"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            minHeight: 0,
            maxHeight: 'calc(90vh - 140px)'
          }}
        >
          {error && (
            <div className="mt-4 mb-4 rounded-[16px] bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}

          <form id="tour-form" onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#121420]">Название *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#121420]">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#121420]">Цена (₽)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#121420]">Категория</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value, subcategory_id: "" })}
                  className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                >
                  <option value="">Без категории</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.category_id && subcategories.length > 0 && (
              <div>
                <label className="mb-2 block text-sm font-medium text-[#121420]">Подкатегория</label>
                <select
                  value={formData.subcategory_id}
                  onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                  className="w-full rounded-[16px] border border-[#D9921D]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D9921D]"
                >
                  <option value="">Без подкатегории</option>
                  {subcategories.map((subcat) => (
                    <option key={subcat.id} value={subcat.id}>
                      {subcat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#121420]">Длительность</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="Например: 3 дня / 2 ночи"
                  className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#121420]">Место</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Например: Красная Поляна"
                  className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#121420]">
                Главное изображение
              </label>
              <FileUploader
                type="photo"
                multiple={false}
                onUpload={(urls) => {
                  if (urls.length > 0) {
                    setFormData({ ...formData, image_url: urls[0] });
                  }
                }}
                existingFiles={formData.image_url ? [formData.image_url] : []}
                onRemove={() => setFormData({ ...formData, image_url: "" })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#121420]">
                Фотографии
              </label>
              <FileUploader
                type="photo"
                multiple={true}
                onUpload={(urls) => {
                  setFormData({
                    ...formData,
                    photos: [...formData.photos, ...urls],
                  });
                }}
                existingFiles={formData.photos}
                onRemove={(url) => {
                  setFormData({
                    ...formData,
                    photos: formData.photos.filter((p) => p !== url),
                  });
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#121420]">
                Видео
              </label>
              <FileUploader
                type="video"
                multiple={true}
                onUpload={(urls) => {
                  setFormData({
                    ...formData,
                    videos: [...formData.videos, ...urls],
                  });
                }}
                existingFiles={formData.videos}
                onRemove={(url) => {
                  setFormData({
                    ...formData,
                    videos: formData.videos.filter((v) => v !== url),
                  });
                }}
              />
              <div className="mt-4">
                <p className="mb-2 text-xs text-[#4a4e65]">
                  Или добавьте ссылку на YouTube или Vimeo:
                </p>
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=... или https://vimeo.com/..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      setFormData({
                        ...formData,
                        videos: [...formData.videos, e.currentTarget.value.trim()],
                      });
                      e.currentTarget.value = "";
                    }
                  }}
                  className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Кнопки - закреплены внизу */}
        <div className="flex-shrink-0 bg-white rounded-b-[28px] px-4 md:px-6 pt-4 pb-4 md:pb-6 border-t border-[#475C8C]/10">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#475C8C]/20 px-4 py-2 text-sm font-medium text-[#475C8C] hover:bg-[#475C8C]/10"
            >
              Отмена
            </button>
            <button
              type="submit"
              form="tour-form"
              disabled={loading}
              className="flex-1 rounded-full bg-[#475C8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#475C8C]/90 disabled:opacity-50"
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category Form Component
function CategoryFormModal({
  category,
  onClose,
  onSuccess,
}: {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = category ? `/api/categories/${category.id}` : "/api/categories";
      const method = category ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка при сохранении");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="mb-6 text-2xl font-semibold text-[#121420]">
          {category ? "Редактировать категорию" : "Добавить категорию"}
        </h2>

        {error && (
          <div className="mb-4 rounded-[16px] bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#121420]">Название *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#475C8C]/20 px-4 py-2 text-sm font-medium text-[#475C8C] hover:bg-[#475C8C]/10"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-[#475C8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#475C8C]/90 disabled:opacity-50"
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Hero Video Manager Component
function HeroVideoManager({ apiEndpoint = "/api/hero-video", title = "Управление шапкой" }: { apiEndpoint?: string; title?: string }) {
  const [videos, setVideos] = useState<{
    d: { exists: boolean; url: string; recommended: any };
    m: { exists: boolean; url: string; recommended: any };
    p: { exists: boolean; url: string; recommended: any };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadVideos();
  }, [apiEndpoint]);

  const loadVideos = async () => {
    try {
      const res = await fetch(apiEndpoint);
      const data = await res.json();
      if (res.ok) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error("Ошибка загрузки информации о видео:", error);
    }
  };

  const handleFileSelect = async (deviceType: "d" | "m" | "p", file: File) => {
    setError("");
    setSuccess("");
    setUploading({ ...uploading, [deviceType]: true });
    setUploadProgress({ ...uploadProgress, [deviceType]: 0 });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("deviceType", deviceType);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress({ ...uploadProgress, [deviceType]: percentComplete });
        }
      });

      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            setSuccess(response.message);
            loadVideos();
            resolve();
          } else {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || "Ошибка загрузки"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Ошибка сети"));
        });

        xhr.open("POST", apiEndpoint);
        xhr.send(formData);
      });

      await uploadPromise;
    } catch (error: any) {
      setError(error.message || "Ошибка при загрузке видео");
    } finally {
      setUploading({ ...uploading, [deviceType]: false });
      setUploadProgress({ ...uploadProgress, [deviceType]: 0 });
    }
  };

  if (!videos) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#475C8C]">Загрузка...</div>
      </div>
    );
  }

  const videoTypes = [
    { key: "d" as const, label: "Desktop (ПК)", icon: "🖥️" },
    { key: "m" as const, label: "Mobile (Мобильный)", icon: "📱" },
    { key: "p" as const, label: "Tablet (Планшет)", icon: "📱" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="mb-4 text-2xl font-semibold text-[#121420]">{title}</h2>
        <p className="mb-6 text-sm text-[#4a4e65]">
          Загрузите видео для фона hero блока. Видео будут автоматически воспроизводиться на соответствующих устройствах.
        </p>

        {error && (
          <div className="mb-4 rounded-[16px] bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}

        {success && (
          <div className="mb-4 rounded-[16px] bg-green-50 p-4 text-sm text-green-600">{success}</div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {videoTypes.map(({ key, label, icon }) => {
            const video = videos[key];
            const isUploading = uploading[key];
            const progress = uploadProgress[key] || 0;

            return (
              <div
                key={key}
                className="rounded-[20px] border border-[#475C8C]/15 bg-gradient-to-br from-white to-[#eff2ff] p-6 shadow-[var(--shadow-card)]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h3 className="font-semibold text-[#121420]">{label}</h3>
                    <p className="text-xs text-[#4a4e65]">
                      {video.recommended.width} × {video.recommended.height}px
                    </p>
                    <p className="text-xs text-[#475C8C]">
                      Соотношение: {video.recommended.aspectRatio}
                    </p>
                  </div>
                </div>

                {video.exists && (
                  <div className="mb-4 rounded-[12px] bg-green-50 p-3 text-center">
                    <p className="text-xs font-medium text-green-700">✓ Видео загружено</p>
                  </div>
                )}

                {!video.exists && (
                  <div className="mb-4 rounded-[12px] bg-yellow-50 p-3 text-center">
                    <p className="text-xs font-medium text-yellow-700">⚠ Видео не загружено</p>
                  </div>
                )}

                <div className="mb-4 space-y-2">
                  <p className="text-xs font-medium text-[#121420]">Рекомендуемые параметры:</p>
                  <div className="rounded-[12px] bg-white p-3 text-xs text-[#4a4e65]">
                    <p>• Разрешение: {video.recommended.width} × {video.recommended.height}px</p>
                    <p>• Соотношение: {video.recommended.aspectRatio}</p>
                    <p>• Формат: MP4</p>
                    <p>• Макс. размер: 200MB</p>
                  </div>
                </div>

                <label className="block">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileSelect(key, file);
                      }
                    }}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <div
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-colors ${
                      isUploading
                        ? "bg-[#475C8C]/50 text-white cursor-not-allowed"
                        : "bg-[#475C8C] text-white hover:bg-[#475C8C]/90"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Загрузка {progress}%</span>
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        <span>{video.exists ? "Заменить видео" : "Загрузить видео"}</span>
                      </>
                    )}
                  </div>
                </label>

                {isUploading && progress > 0 && (
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#475C8C]/10">
                    <div
                      className="h-full bg-[#475C8C] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-[16px] bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">💡 Советы:</p>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Видео должны быть оптимизированы для веб-использования</li>
            <li>Рекомендуется использовать формат MP4 с кодеком H.264</li>
            <li>Видео будут автоматически воспроизводиться в цикле</li>
            <li>При загрузке нового видео старое будет автоматически заменено</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmModal({
  type,
  name,
  onConfirm,
  onCancel,
  loading,
}: {
  type: "tour" | "category" | "subcategory" | "team";
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="size-8 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-[#121420]">
            Подтверждение удаления
          </h2>
          <p className="text-sm text-[#4a4e65]">
            Вы уверены, что хотите удалить{" "}
            {type === "tour" ? "тур" : type === "category" ? "категорию" : type === "subcategory" ? "подкатегорию" : "члена команды"}?
          </p>
        </div>

        <div className="mb-6 rounded-[16px] border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">
            {type === "tour" ? "Тур:" : type === "category" ? "Категория:" : type === "subcategory" ? "Подкатегория:" : "Член команды:"}
          </p>
          <p className="mt-1 text-base font-semibold text-red-700">{name}</p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-full border border-[#475C8C]/20 px-4 py-3 text-sm font-medium text-[#475C8C] hover:bg-[#475C8C]/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Удаление...
              </span>
            ) : (
              "Удалить"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcategory Form Component
function SubcategoryFormModal({
  subcategory,
  category,
  categories,
  onClose,
  onSuccess,
}: {
  subcategory: Subcategory | null;
  category: Category | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(subcategory?.name || "");
  const [categoryId, setCategoryId] = useState<number>(category?.id || subcategory?.category_id || categories[0]?.id || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = subcategory ? `/api/subcategories/${subcategory.id}` : "/api/subcategories";
      const method = subcategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category_id: categoryId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка при сохранении");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-[28px] border border-[#475C8C]/20 bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="mb-6 text-2xl font-semibold text-[#121420]">
          {subcategory ? "Редактировать подкатегорию" : "Добавить подкатегорию"}
        </h2>

        {error && (
          <div className="mb-4 rounded-[16px] bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#121420]">Категория *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
              disabled={!!category || !!subcategory}
              className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {(category || subcategory) && (
              <p className="mt-1 text-xs text-[#4a4e65]">
                Категория: {category?.name || categories.find(c => c.id === (subcategory?.category_id))?.name}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#121420]">Название подкатегории *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#475C8C]/20 px-4 py-2 text-sm font-medium text-[#475C8C] hover:bg-[#475C8C]/10"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-[#D9921D] px-4 py-2 text-sm font-medium text-white hover:bg-[#D9921D]/90 disabled:opacity-50"
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Team Member Form Component
function TeamMemberFormModal({
  member,
  onClose,
  onSuccess,
}: {
  member: TeamMember | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(member?.name || "");
  const [role, setRole] = useState(member?.role || "");
  const [quote, setQuote] = useState(member?.quote || "");
  const [photo, setPhoto] = useState(member?.photo || "");
  const [displayOrder, setDisplayOrder] = useState(member?.display_order?.toString() || "0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = member ? `/api/team-members/${member.id}` : "/api/team-members";
      const method = member ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          quote: quote || null,
          photo: photo || null,
          display_order: parseInt(displayOrder) || 0,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ошибка при сохранении");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="w-full max-w-2xl rounded-[28px] border border-[#475C8C]/20 bg-white shadow-[var(--shadow-card)] flex flex-col"
        style={{
          maxHeight: '90vh',
          height: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок - закреплен */}
        <div className="flex-shrink-0 bg-white rounded-t-[28px] px-6 pt-6 pb-4 border-b border-[#475C8C]/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#121420]">
              {member ? "Редактировать члена команды" : "Добавить члена команды"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#4a4e65] hover:bg-[#475C8C]/10 transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Контент - прокручиваемый */}
        <div 
          className="flex-1 overflow-y-auto px-6"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            minHeight: 0,
            maxHeight: 'calc(90vh - 140px)'
          }}
        >
          {error && (
            <div className="mt-4 mb-4 rounded-[16px] bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}

          <form id="team-member-form" onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#121420]">Имя *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#121420]">Роль *</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#121420]">Цитата</label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={3}
              className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#121420]">Фотография</label>
            <FileUploader
              type="photo"
              multiple={false}
              onUpload={(urls) => {
                if (urls && urls.length > 0) {
                  setPhoto(urls[0]);
                }
              }}
            />
            {photo && (
              <div className="mt-2">
                <img
                  src={photo}
                  alt="Preview"
                  className="h-32 w-32 rounded-[12px] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPhoto("")}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Удалить фотографию
                </button>
              </div>
            )}
            <p className="mt-1 text-xs text-[#4a4e65]">
              Или введите URL фотографии вручную
            </p>
            <input
              type="text"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="/team/1.jpg или URL"
              className="mt-2 w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#121420]">Порядок отображения</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              min="0"
              className="w-full rounded-[16px] border border-[#475C8C]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
            />
            <p className="mt-1 text-xs text-[#4a4e65]">
              Члены команды будут отсортированы по этому значению (меньше = выше)
            </p>
          </div>
          </form>
        </div>

        {/* Футер с кнопками - закреплен */}
        <div className="flex-shrink-0 bg-white rounded-b-[28px] px-6 py-4 border-t border-[#475C8C]/10">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#475C8C]/20 px-4 py-2 text-sm font-medium text-[#475C8C] hover:bg-[#475C8C]/10"
            >
              Отмена
            </button>
            <button
              type="submit"
              form="team-member-form"
              disabled={loading}
              className="flex-1 rounded-full bg-[#475C8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#475C8C]/90 disabled:opacity-50"
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

