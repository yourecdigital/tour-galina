import { NextRequest, NextResponse } from "next/server";

// Функция для отправки сообщения в Telegram
async function sendToTelegram(data: {
  full_name: string;
  phone: string;
  email?: string;
  telegram?: string;
  cart: Array<{
    id: number;
    title: string;
    price: number | null;
  }>;
  total: number;
}) {
  // Используем предоставленные ключи или переменные окружения
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8304880903:AAHxEr9U4Ca6E0E-IGxyVMzDL56qocRihWg";
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "-1003143468391";

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены");
    return false;
  }

  // Формируем сообщение
  let message = `🛒 <b>Новый заказ с сайта</b>\n\n`;
  message += `👤 <b>Клиент:</b> ${data.full_name}\n`;
  message += `📞 <b>Телефон:</b> ${data.phone}\n`;
  
  if (data.email) {
    message += `📧 <b>Email:</b> ${data.email}\n`;
  }
  
  if (data.telegram) {
    message += `💬 <b>Telegram:</b> ${data.telegram}\n`;
  }

  message += `\n📦 <b>Заказанные туры:</b>\n`;
  data.cart.forEach((item, index) => {
    message += `${index + 1}. ${item.title}`;
    if (item.price !== null) {
      message += ` - ${item.price.toLocaleString("ru-RU")} ₽`;
    }
    message += `\n`;
  });

  message += `\n💰 <b>Итого:</b> ${data.total.toLocaleString("ru-RU")} ₽`;

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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { full_name, phone, email, telegram, cart, total } = data;

    // Валидация
    if (!full_name || !phone) {
      return NextResponse.json(
        { error: "Имя и телефон обязательны" },
        { status: 400 }
      );
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: "Корзина пуста" },
        { status: 400 }
      );
    }

    // Отправляем в Telegram
    const sent = await sendToTelegram({
      full_name,
      phone,
      email: email || undefined,
      telegram: telegram || undefined,
      cart,
      total,
    });

    if (!sent) {
      // Если Telegram не настроен, просто логируем
      console.log("Заказ получен (Telegram не настроен):", data);
    }

    return NextResponse.json({
      success: true,
      message: "Заказ успешно отправлен",
    });
  } catch (error: any) {
    console.error("Ошибка при обработке заказа:", error);
    return NextResponse.json(
      { error: "Ошибка при обработке заказа" },
      { status: 500 }
    );
  }
}


