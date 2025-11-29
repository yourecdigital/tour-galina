import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

// Логин и хеш пароля
// Логин: Gala2025!
// Пароль: Krasnaya2025!Admin (сильный, но удобный для ввода с телефона)
const ADMIN_LOGIN = "Gala2025!";
const ADMIN_PASSWORD_HASH = "$2a$10$uTEOR/Cw4GSMe.jJ3I5FFun8OU.xqzfUEEgl0K5AyfTm3V3MAxsqi"; // Krasnaya2025!Admin

export async function verifyCredentials(login: string, password: string): Promise<boolean> {
  if (login !== ADMIN_LOGIN) {
    return false;
  }
  
  // Для первого запуска, если хеш не установлен, создаем его
  // В продакшене используйте предварительно сгенерированный хеш
  const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  return isValid;
}

export async function setAuthSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: "/",
    });
  } catch (error: any) {
    console.error("Ошибка при установке сессии:", error);
    throw error;
  }
}

export async function checkAuthSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    return session?.value === "authenticated";
  } catch (error: any) {
    console.error("Ошибка при проверке сессии:", error);
    return false;
  }
}

export async function clearAuthSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
  } catch (error: any) {
    console.error("Ошибка при удалении сессии:", error);
  }
}

