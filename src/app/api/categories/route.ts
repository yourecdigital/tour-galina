import { NextRequest, NextResponse } from "next/server";
import { checkAuthSession } from "@/lib/auth";
import db from "@/lib/db";

// GET - получить все категории
export async function GET() {
  try {
    const categories = db.prepare("SELECT * FROM categories ORDER BY name").all();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении категорий" },
      { status: 500 }
    );
  }
}

// POST - создать новую категорию
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Название категории обязательно" },
        { status: 400 }
      );
    }

    try {
      const result = db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
      const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(result.lastInsertRowid);
      return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return NextResponse.json(
          { error: "Категория с таким названием уже существует" },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании категории" },
      { status: 500 }
    );
  }
}









