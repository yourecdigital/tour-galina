import { NextRequest, NextResponse } from "next/server";
import { checkAuthSession } from "@/lib/auth";
import db from "@/lib/db";

// GET - получить члена команды по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = db.prepare("SELECT * FROM team_members WHERE id = ?").get(id);

    if (!member) {
      return NextResponse.json(
        { error: "Член команды не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении члена команды" },
      { status: 500 }
    );
  }
}

// PUT - обновить члена команды
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
    const { name, role, quote, photo, display_order } = await request.json();

    if (!name || !role) {
      return NextResponse.json(
        { error: "Имя и роль обязательны" },
        { status: 400 }
      );
    }

    db.prepare(
      "UPDATE team_members SET name = ?, role = ?, quote = ?, photo = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(name, role, quote || null, photo || null, display_order !== undefined ? display_order : 0, id);

    const member = db.prepare("SELECT * FROM team_members WHERE id = ?").get(id);
    
    if (!member) {
      return NextResponse.json(
        { error: "Член команды не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error: any) {
    console.error("Ошибка при обновлении члена команды:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении члена команды", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - удалить члена команды
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
    db.prepare("DELETE FROM team_members WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при удалении члена команды" },
      { status: 500 }
    );
  }
}

