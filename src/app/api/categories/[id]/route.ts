import { NextRequest, NextResponse } from "next/server";
import { checkAuthSession } from "@/lib/auth";
import db from "@/lib/db";

// PUT - обновить категорию
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
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Название категории обязательно" },
        { status: 400 }
      );
    }

    try {
      db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(name, id);
      const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
      
      if (!category) {
        return NextResponse.json(
          { error: "Категория не найдена" },
          { status: 404 }
        );
      }

      return NextResponse.json(category);
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
      { error: "Ошибка при обновлении категории" },
      { status: 500 }
    );
  }
}

// DELETE - удалить категорию
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
    db.prepare("DELETE FROM categories WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при удалении категории" },
      { status: 500 }
    );
  }
}






