import { NextRequest, NextResponse } from "next/server";
import { checkAuthSession } from "@/lib/auth";
import db from "@/lib/db";

// PUT - обновить подкатегорию
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
    const { name, category_id } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Название подкатегории обязательно" },
        { status: 400 }
      );
    }

    try {
      if (category_id) {
        // Проверяем существование категории
        const category = db.prepare("SELECT id FROM categories WHERE id = ?").get(category_id);
        if (!category) {
          return NextResponse.json(
            { error: "Категория не найдена" },
            { status: 404 }
          );
        }
        db.prepare("UPDATE subcategories SET name = ?, category_id = ? WHERE id = ?").run(name, category_id, id);
      } else {
        db.prepare("UPDATE subcategories SET name = ? WHERE id = ?").run(name, id);
      }
      
      const subcategory = db.prepare(`
        SELECT s.*, c.name as category_name 
        FROM subcategories s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.id = ?
      `).get(id);
      
      if (!subcategory) {
        return NextResponse.json(
          { error: "Подкатегория не найдена" },
          { status: 404 }
        );
      }

      return NextResponse.json(subcategory);
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
      { error: "Ошибка при обновлении подкатегории" },
      { status: 500 }
    );
  }
}

// DELETE - удалить подкатегорию
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
    db.prepare("DELETE FROM subcategories WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при удалении подкатегории" },
      { status: 500 }
    );
  }
}

