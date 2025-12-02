// Простой скрипт для удаления всех туров из базы данных
import db from "../src/lib/db";

console.log("Удаление всех туров из базы данных...");

try {
  const count = db.prepare("SELECT COUNT(*) as count FROM tours").get() as { count: number };
  console.log(`Найдено туров: ${count.count}`);

  if (count.count > 0) {
    db.prepare("DELETE FROM tours").run();
    console.log("✓ Все туры успешно удалены!");
  } else {
    console.log("Туров в базе данных нет.");
  }
} catch (error: any) {
  console.error("Ошибка при удалении туров:", error.message);
  process.exit(1);
}

process.exit(0);








