import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir, unlink } from "fs/promises";
import { join } from "path";
import { checkAuthSession } from "@/lib/auth";

// Рекомендуемые размеры видео
const RECOMMENDED_SIZES = {
  d: { width: 1920, height: 1080, aspectRatio: "16:9", description: "Desktop (ПК)" },
  m: { width: 720, height: 1280, aspectRatio: "9:16", description: "Mobile (Мобильный)" },
  p: { width: 1024, height: 768, aspectRatio: "4:3", description: "Tablet (Планшет)" },
};

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const deviceType = formData.get("deviceType") as string; // "d", "m", or "p"

    if (!file) {
      return NextResponse.json(
        { error: "Файл не найден" },
        { status: 400 }
      );
    }

    if (!deviceType || !["d", "m", "p"].includes(deviceType)) {
      return NextResponse.json(
        { error: "Неверный тип устройства. Допустимые значения: d, m, p" },
        { status: 400 }
      );
    }

    // Проверка типа файла
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (!allowedVideoTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Неподдерживаемый тип видео. Разрешены: MP4, WebM, OGG" },
        { status: 400 }
      );
    }

    // Проверка размера файла (макс 200MB для видео)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимальный размер: 200MB" },
        { status: 400 }
      );
    }

    // Создаем директорию если её нет
    const kpDir = join(process.cwd(), "public", "kp");
    await mkdir(kpDir, { recursive: true });

    // Удаляем старое видео если существует
    const oldFileName = `${deviceType}.mp4`;
    const oldFilePath = join(kpDir, oldFileName);
    try {
      await unlink(oldFilePath);
    } catch (e) {
      // Игнорируем ошибку если файл не существует
    }

    // Сохраняем новое видео
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const newFilePath = join(kpDir, oldFileName);
    await writeFile(newFilePath, buffer);

    const recommendedSize = RECOMMENDED_SIZES[deviceType as keyof typeof RECOMMENDED_SIZES];

    return NextResponse.json({
      success: true,
      message: `Видео для ${recommendedSize.description} успешно загружено`,
      fileName: oldFileName,
      recommendedSize,
    });
  } catch (error: any) {
    console.error("Ошибка загрузки hero видео:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке видео: " + error.message },
      { status: 500 }
    );
  }
}

// GET - получить информацию о текущих видео и рекомендуемых размерах
export async function GET() {
  try {
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const kpDir = join(process.cwd(), "public", "kp");
    const files: string[] = await readdir(kpDir).catch(() => []);

    const videos = {
      d: {
        exists: files.includes("d.mp4"),
        url: "/kp/d.mp4",
        recommended: RECOMMENDED_SIZES.d,
      },
      m: {
        exists: files.includes("m.mp4"),
        url: "/kp/m.mp4",
        recommended: RECOMMENDED_SIZES.m,
      },
      p: {
        exists: files.includes("p.mp4"),
        url: "/kp/p.mp4",
        recommended: RECOMMENDED_SIZES.p,
      },
    };

    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error("Ошибка получения информации о hero видео:", error);
    return NextResponse.json(
      { error: "Ошибка при получении информации о видео" },
      { status: 500 }
    );
  }
}

