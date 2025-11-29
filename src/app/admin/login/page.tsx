"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  // Проверяем авторизацию только после монтирования компонента
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            router.push("/admin");
          }
        }
      } catch (error) {
        // Игнорируем ошибки проверки авторизации
        console.error("Ошибка проверки авторизации:", error);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка входа");
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
      <div className="w-full max-w-md rounded-[36px] border border-[#475C8C]/20 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#121420]">Админ-панель</h1>
          <p className="mt-2 text-sm text-[#4a4e65]">Войдите для управления турами</p>
        </div>

        {error && (
          <div className="mb-6 rounded-[16px] bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#121420]">Логин</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#475C8C]/50" />
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                autoComplete="username"
                className="w-full rounded-[16px] border border-[#475C8C]/20 bg-white pl-12 pr-4 py-3 text-[#121420] placeholder:text-[#475C8C]/50 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                placeholder="Введите логин"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#121420]">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#475C8C]/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-[16px] border border-[#475C8C]/20 bg-white pl-12 pr-4 py-3 text-[#121420] placeholder:text-[#475C8C]/50 focus:outline-none focus:ring-2 focus:ring-[#475C8C]"
                placeholder="Введите пароль"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#475C8C] px-6 py-3 text-base font-medium text-white hover:bg-[#475C8C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-[#475C8C] hover:text-[#475C8C]/80 hover:underline"
          >
            Вернуться на сайт
          </a>
        </div>
      </div>
    </div>
  );
}

