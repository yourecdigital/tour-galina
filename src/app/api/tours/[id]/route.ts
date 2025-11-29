import { NextRequest, NextResponse } from "next/server";
import { checkAuthSession } from "@/lib/auth";
import db from "@/lib/db";
import { parseTour } from "@/lib/tours";
import { generateUniqueSlug } from "@/lib/slug";

// GET - получить тур по ID или slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Сначала пытаемся найти по slug, если не найдено - ищем по ID
    let tour: any = null;
    if (id && typeof id === 'string') {
      // Пробуем найти по slug (slug не может быть числом)
      if (!/^\d+$/.test(id)) {
        tour = db.prepare("SELECT * FROM tours WHERE slug = ?").get(id) as any;
      }
      // Если не найден по slug или это число, пробуем найти по ID
      if (!tour) {
        const numericId = parseInt(id, 10);
        if (!isNaN(numericId)) {
          tour = db.prepare("SELECT * FROM tours WHERE id = ?").get(numericId) as any;
        }
      }
    }

    if (!tour) {
      return NextResponse.json(
        { error: "Тур не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(parseTour(tour));
  } catch (error: any) {
    console.error("Ошибка при получении тура:", error);
    return NextResponse.json(
      { error: "Ошибка при получении тура", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - обновить тур
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const data = await request.json();
    const { title, description, price, image_url, photos, videos, category_id, duration, location } = data;

    if (!title) {
      return NextResponse.json(
        { error: "Название обязательно" },
        { status: 400 }
      );
    }

    // Получаем текущий тур для проверки slug
    const currentTour = db.prepare("SELECT slug FROM tours WHERE id = ?").get(id) as { slug: string } | undefined;
    const currentSlug = currentTour?.slug;

    // Генерируем уникальный slug
    const existingTours = db.prepare("SELECT slug FROM tours WHERE slug IS NOT NULL AND id != ?").all(id) as { slug: string }[];
    const existingSlugs = existingTours.map(t => t.slug).filter(s => s); // Фильтруем null/undefined
    const slug = generateUniqueSlug(title, existingSlugs, currentSlug || undefined);

    // Преобразуем массивы в JSON строки
    const photosJson = photos && Array.isArray(photos) ? JSON.stringify(photos) : null;
    const videosJson = videos && Array.isArray(videos) ? JSON.stringify(videos) : null;

    db.prepare(
      "UPDATE tours SET title = ?, description = ?, price = ?, image_url = ?, photos = ?, videos = ?, category_id = ?, duration = ?, location = ?, slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(
      title,
      description || null,
      price || null,
      image_url || null,
      photosJson,
      videosJson,
      category_id || null,
      duration || null,
      location || null,
      slug,
      id
    );

    const tour = db.prepare("SELECT * FROM tours WHERE id = ?").get(id) as any;
    return NextResponse.json(parseTour(tour));
  } catch (error: any) {
    console.error("Ошибка при обновлении тура:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении тура", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - удалить тур
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const { id } = await params;
    db.prepare("DELETE FROM tours WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при удалении тура" },
      { status: 500 }
    );
  }
}

