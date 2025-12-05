import { NextRequest, NextResponse } from "next/server";
import { checkAuthSession } from "@/lib/auth";
import db from "@/lib/db";

// GET - получить все подкатегории или по category_id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");

    let query = `
      SELECT s.*, c.name as category_name 
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY c.name, s.name
    `;
    let params: any[] = [];

    if (categoryId) {
      query = `
        SELECT s.*, c.name as category_name 
        FROM subcategories s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.category_id = ?
        ORDER BY s.name
      `;
      params = [categoryId];
    }

    const subcategories = db.prepare(query).all(...params);
    return NextResponse.json(subcategories);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении подкатегорий" },
      { status: 500 }
    );
  }
}

// POST - создать новую подкатегорию
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const { name, category_id } = await request.json();

    if (!name || !category_id) {
      return NextResponse.json(
        { error: "Название подкатегории и категория обязательны" },
        { status: 400 }
      );
    }

    // Проверяем существование категории
    const category = db.prepare("SELECT id FROM categories WHERE id = ?").get(category_id);
    if (!category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    try {
      const result = db.prepare("INSERT INTO subcategories (name, category_id) VALUES (?, ?)").run(name, category_id);
      const subcategory = db.prepare(`
        SELECT s.*, c.name as category_name 
        FROM subcategories s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.id = ?
      `).get(result.lastInsertRowid);
      return NextResponse.json(subcategory, { status: 201 });
    } catch (error: any) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return NextResponse.json(
          { error: "Подкатегория с таким названием уже существует в этой категории" },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании подкатегории" },
      { status: 500 }
    );
  }
}

