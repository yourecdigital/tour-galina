import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, setAuthSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: "Логин и пароль обязательны" },
        { status: 400 }
      );
    }

    try {
      const isValid = await verifyCredentials(login, password);

      if (!isValid) {
        return NextResponse.json(
          { error: "Неверный логин или пароль" },
          { status: 401 }
        );
      }

      await setAuthSession();

      return NextResponse.json({ success: true });
    } catch (authError: any) {
      console.error("Ошибка при проверке учетных данных:", authError);
      return NextResponse.json(
        { error: "Ошибка при проверке учетных данных", details: authError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Ошибка в API логина:", error);
    return NextResponse.json(
      { error: "Ошибка сервера", details: error.message },
      { status: 500 }
    );
  }
}

