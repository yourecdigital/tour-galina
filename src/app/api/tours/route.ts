import { NextRequest, NextResponse } from "next/server";
import { checkAuthSession } from "@/lib/auth";
import db from "@/lib/db";
import { parseTours } from "@/lib/tours";
import { generateUniqueSlug } from "@/lib/slug";

// GET - получить все туры
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");

    let query = "SELECT * FROM tours ORDER BY created_at DESC";
    let params: any[] = [];

    if (categoryId) {
      query = "SELECT * FROM tours WHERE category_id = ? ORDER BY created_at DESC";
      params = [categoryId];
    }

    const tours = db.prepare(query).all(...params) as any[];
    return NextResponse.json(parseTours(tours));
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении туров" },
      { status: 500 }
    );
  }
}

// POST - создать новый тур
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { title, description, price, image_url, photos, videos, category_id, duration, location } = data;

    if (!title) {
      return NextResponse.json(
        { error: "Название обязательно" },
        { status: 400 }
      );
    }

    // Генерируем уникальный slug
    const existingTours = db.prepare("SELECT slug FROM tours WHERE slug IS NOT NULL").all() as { slug: string }[];
    const existingSlugs = existingTours.map(t => t.slug).filter(s => s); // Фильтруем null/undefined
    const slug = generateUniqueSlug(title, existingSlugs);

    // Преобразуем массивы в JSON строки
    const photosJson = photos && Array.isArray(photos) ? JSON.stringify(photos) : null;
    const videosJson = videos && Array.isArray(videos) ? JSON.stringify(videos) : null;

    const result = db
      .prepare(
        "INSERT INTO tours (title, description, price, image_url, photos, videos, category_id, duration, location, slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        title,
        description || null,
        price || null,
        image_url || null,
        photosJson,
        videosJson,
        category_id || null,
        duration || null,
        location || null,
        slug
      );

    const tour = db.prepare("SELECT * FROM tours WHERE id = ?").get(result.lastInsertRowid) as any;
    return NextResponse.json(parseTours([tour])[0], { status: 201 });
  } catch (error: any) {
    console.error("Ошибка при создании тура:", error);
    return NextResponse.json(
      { error: "Ошибка при создании тура", details: error.message },
      { status: 500 }
    );
  }
}

