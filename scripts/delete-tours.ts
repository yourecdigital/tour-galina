// Скрипт для удаления туров из базы данных
import db from "../src/lib/db";

// Получаем все туры
const tours = db.prepare("SELECT id, title, slug FROM tours ORDER BY id").all() as Array<{
  id: number;
  title: string;
  slug: string | null;
}>;

console.log(`\nНайдено туров: ${tours.length}\n`);

if (tours.length === 0) {
  console.log("Туров в базе данных нет.");
  process.exit(0);
}

// Выводим список туров
console.log("Список туров:");
tours.forEach((tour) => {
  console.log(`  ID: ${tour.id} | Slug: ${tour.slug || 'нет'} | Название: ${tour.title}`);
});

console.log("\nВыберите действие:");
console.log("1. Удалить все туры");
console.log("2. Удалить конкретный тур по ID");
console.log("3. Выход");

// Для автоматического удаления всех туров, раскомментируйте следующую строку:
// const deleteAll = true;

// Если нужно удалить все туры автоматически:
if (process.argv.includes('--all')) {
  console.log("\nУдаление всех туров...");
  db.prepare("DELETE FROM tours").run();
  console.log("Все туры удалены.");
  process.exit(0);
}

// Если нужно удалить конкретный тур по ID:
const tourIdArg = process.argv.find(arg => arg.startsWith('--id='));
if (tourIdArg) {
  const tourId = parseInt(tourIdArg.split('=')[1], 10);
  if (isNaN(tourId)) {
    console.error("Неверный ID тура");
    process.exit(1);
  }
  
  const tour = db.prepare("SELECT id, title FROM tours WHERE id = ?").get(tourId) as { id: number; title: string } | undefined;
  if (!tour) {
    console.error(`Тур с ID ${tourId} не найден`);
    process.exit(1);
  }
  
  console.log(`\nУдаление тура: ${tour.title} (ID: ${tour.id})...`);
  db.prepare("DELETE FROM tours WHERE id = ?").run(tourId);
  console.log("Тур удален.");
  process.exit(0);
}

console.log("\nДля удаления используйте:");
console.log("  npm run delete-tours -- --all          (удалить все туры)");
console.log("  npm run delete-tours -- --id=1         (удалить тур с ID=1)");
process.exit(0);



