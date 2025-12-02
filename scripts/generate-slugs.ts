// Скрипт для генерации slug для существующих туров
import db from "../src/lib/db";
import { generateUniqueSlug } from "../src/lib/slug";

const tours = db.prepare("SELECT id, title, slug FROM tours").all() as Array<{
  id: number;
  title: string;
  slug: string | null;
}>;

console.log(`Найдено туров: ${tours.length}`);

let updated = 0;
for (const tour of tours) {
  if (!tour.slug) {
    // Получаем все существующие slug
    const existingTours = db
      .prepare("SELECT slug FROM tours WHERE slug IS NOT NULL")
      .all() as Array<{ slug: string }>;
    const existingSlugs = existingTours.map((t) => t.slug);

    // Генерируем уникальный slug
    const slug = generateUniqueSlug(tour.title, existingSlugs);

    // Обновляем тур
    db.prepare("UPDATE tours SET slug = ? WHERE id = ?").run(slug, tour.id);
    console.log(`Обновлен тур "${tour.title}" -> slug: ${slug}`);
    updated++;
  }
}

console.log(`\nОбновлено туров: ${updated}`);
process.exit(0);








