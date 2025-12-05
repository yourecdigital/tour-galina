import { NextRequest, NextResponse } from "next/server";
import { checkAuthSession } from "@/lib/auth";
import db from "@/lib/db";

// GET - получить всех членов команды
export async function GET() {
  try {
    const members = db.prepare("SELECT * FROM team_members ORDER BY display_order ASC, created_at ASC").all();
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении членов команды" },
      { status: 500 }
    );
  }
}

// POST - создать нового члена команды
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const { name, role, quote, photo, display_order } = await request.json();

    if (!name || !role) {
      return NextResponse.json(
        { error: "Имя и роль обязательны" },
        { status: 400 }
      );
    }

    const order = display_order !== undefined ? display_order : 0;

    const result = db
      .prepare("INSERT INTO team_members (name, role, quote, photo, display_order) VALUES (?, ?, ?, ?, ?)")
      .run(name, role, quote || null, photo || null, order);

    const member = db.prepare("SELECT * FROM team_members WHERE id = ?").get(result.lastInsertRowid);
    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    console.error("Ошибка при создании члена команды:", error);
    return NextResponse.json(
      { error: "Ошибка при создании члена команды", details: error.message },
      { status: 500 }
    );
  }
}

