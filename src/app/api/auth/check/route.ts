import { NextResponse } from "next/server";
import { checkAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const isAuthenticated = await checkAuthSession();
    return NextResponse.json({ authenticated: isAuthenticated });
  } catch (error: any) {
    console.error("Ошибка в /api/auth/check:", error);
    // В случае ошибки считаем, что пользователь не авторизован
    return NextResponse.json({ authenticated: false });
  }
}

