import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { checkAuthSession } from "@/lib/auth";

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
    const type = formData.get("type") as string; // "photo" or "video"

    if (!file) {
      return NextResponse.json(
        { error: "Файл не найден" },
        { status: 400 }
      );
    }

    // Проверка типа файла
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

    if (type === "photo" && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Неподдерживаемый тип изображения. Разрешены: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    if (type === "video" && !allowedVideoTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Неподдерживаемый тип видео. Разрешены: MP4, WebM, OGG" },
        { status: 400 }
      );
    }

    // Проверка размера файла (макс 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимальный размер: 50MB" },
        { status: 400 }
      );
    }

    // Создаем директорию если её нет
    const uploadsDir = join(process.cwd(), "public", "uploads", type);
    await mkdir(uploadsDir, { recursive: true });

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;
    const filePath = join(uploadsDir, fileName);

    // Сохраняем файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Возвращаем URL файла
    const fileUrl = `/uploads/${type}/${fileName}`;

    return NextResponse.json({ url: fileUrl, fileName });
  } catch (error: any) {
    console.error("Ошибка загрузки файла:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке файла: " + error.message },
      { status: 500 }
    );
  }
}



