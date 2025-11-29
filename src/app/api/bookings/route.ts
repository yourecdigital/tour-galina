import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Функция для отправки сообщения в Telegram
async function sendToTelegram(data: {
  full_name: string;
  phone: string;
  email?: string;
  telegram?: string;
  tour_title: string;
}) {
  // Используем предоставленные ключи или переменные окружения
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8304880903:AAHxEr9U4Ca6E0E-IGxyVMzDL56qocRihWg";
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "-1003143468391";

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены");
    return false;
  }

  // Формируем сообщение
  let message = `🎫 <b>Новая заявка на бронирование тура</b>\n\n`;
  message += `👤 <b>Клиент:</b> ${data.full_name}\n`;
  message += `📞 <b>Телефон:</b> ${data.phone}\n`;
  
  if (data.email) {
    message += `📧 <b>Email:</b> ${data.email}\n`;
  }
  
  if (data.telegram) {
    message += `💬 <b>Telegram:</b> ${data.telegram}\n`;
  }

  message += `\n🎯 <b>Тур:</b> ${data.tour_title}`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Ошибка отправки в Telegram:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Ошибка при отправке в Telegram:", error);
    return false;
  }
}

// POST - создать заявку на бронирование
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { tour_id, full_name, phone, email, telegram } = data;

    // Валидация
    if (!tour_id || !full_name || !phone) {
      return NextResponse.json(
        { error: "Имя и телефон обязательны для заполнения" },
        { status: 400 }
      );
    }

    // Проверка формата телефона (базовая)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Неверный формат телефона" },
        { status: 400 }
      );
    }

    // Проверка существования тура и получение названия
    const tour = db.prepare("SELECT id, title FROM tours WHERE id = ?").get(tour_id) as { id: number; title: string } | undefined;
    if (!tour) {
      return NextResponse.json(
        { error: "Тур не найден" },
        { status: 404 }
      );
    }

    // Создаем заявку (email и telegram опциональны)
    const result = db
      .prepare("INSERT INTO bookings (tour_id, full_name, phone, email, telegram) VALUES (?, ?, ?, ?, ?)")
      .run(tour_id, full_name.trim(), phone.trim(), email?.trim() || null, telegram?.trim() || null);

    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(result.lastInsertRowid);

    // Отправляем в Telegram
    await sendToTelegram({
      full_name: full_name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      telegram: telegram?.trim(),
      tour_title: tour.title,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("Ошибка при создании заявки:", error);
    return NextResponse.json(
      { error: "Ошибка при создании заявки" },
      { status: 500 }
    );
  }
}

// GET - получить все заявки (только для админа)
export async function GET(request: NextRequest) {
  try {
    const { checkAuthSession } = await import("@/lib/auth");
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const bookings = db
      .prepare(`
        SELECT 
          b.*,
          t.title as tour_title
        FROM bookings b
        LEFT JOIN tours t ON b.tour_id = t.id
        ORDER BY b.created_at DESC
      `)
      .all();

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при получении заявок" },
      { status: 500 }
    );
  }
}


