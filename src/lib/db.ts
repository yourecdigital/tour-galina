import Database from "better-sqlite3";
import type { Database as DatabaseType } from "better-sqlite3";
import path from "path";
import fs from "fs";

// Ленивое вычисление пути к базе данных
function getDbPath(): string {
  try {
    return path.join(process.cwd(), "data", "tours.db");
  } catch (e: any) {
    console.error("Ошибка при получении пути к базе данных:", e);
    throw e;
  }
}

function getDbDir(): string {
  try {
    const dbPath = getDbPath();
    return path.dirname(dbPath);
  } catch (e: any) {
    console.error("Ошибка при получении директории базы данных:", e);
    throw e;
  }
}

// Создаем директорию если её нет (с обработкой ошибок)
function ensureDbDir(): void {
  try {
    const dbDir = getDbDir();
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  } catch (e: any) {
    console.warn("Ошибка при создании директории базы данных:", e.message);
  }
}

// Ленивая инициализация базы данных
let dbInstance: DatabaseType | null = null;
let dbInitialized = false;

function getDb(): DatabaseType {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    // Создаем директорию перед инициализацией БД
    ensureDbDir();
    const dbPath = getDbPath();
    dbInstance = new Database(dbPath);
    
    // Включаем внешние ключи
    try {
      dbInstance.pragma("foreign_keys = ON");
    } catch (e: any) {
      console.warn("Ошибка при включении внешних ключей:", e.message);
    }

    // Инициализируем схему только один раз
    if (!dbInitialized) {
      initializeSchema(dbInstance);
      dbInitialized = true;
    }
    
    return dbInstance;
  } catch (error: any) {
    console.error("Критическая ошибка инициализации базы данных:", error);
    throw error;
  }
}

function initializeSchema(db: DatabaseType) {
  try {
    // Создание таблиц
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        price INTEGER,
        image_url TEXT,
        photos TEXT,
        videos TEXT,
        category_id INTEGER,
        duration TEXT,
        location TEXT,
        slug TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);

      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tour_id INTEGER NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_bookings_tour ON bookings(tour_id);
    `);

    // Миграция: добавляем поля photos и videos если их нет
    try {
      db.prepare("ALTER TABLE tours ADD COLUMN photos TEXT").run();
    } catch (e: any) {
      if (!e.message.includes("duplicate column name") && !e.message.includes("duplicate column")) {
        console.warn("Ошибка при добавлении поля photos:", e.message);
      }
    }

    try {
      db.prepare("ALTER TABLE tours ADD COLUMN videos TEXT").run();
    } catch (e: any) {
      if (!e.message.includes("duplicate column name") && !e.message.includes("duplicate column")) {
        console.warn("Ошибка при добавлении поля videos:", e.message);
      }
    }

    // Миграция: добавляем поле slug если его нет
    try {
      db.prepare("ALTER TABLE tours ADD COLUMN slug TEXT").run();
    } catch (e: any) {
      if (!e.message.includes("duplicate column name") && !e.message.includes("duplicate column")) {
        console.warn("Ошибка при добавлении поля slug:", e.message);
      }
    }

    // Создаем индекс для slug (отдельно, чтобы не падало если индекс уже существует)
    try {
      db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug)").run();
    } catch (e: any) {
      if (!e.message.includes("already exists") && !e.message.includes("duplicate")) {
        console.warn("Ошибка при создании индекса slug:", e.message);
      }
    }

    // Миграция: добавляем поля email и telegram в bookings если их нет
    try {
      db.prepare("ALTER TABLE bookings ADD COLUMN email TEXT").run();
    } catch (e: any) {
      if (!e.message.includes("duplicate column name") && !e.message.includes("duplicate column")) {
        console.warn("Ошибка при добавлении поля email:", e.message);
      }
    }

    try {
      db.prepare("ALTER TABLE bookings ADD COLUMN telegram TEXT").run();
    } catch (e: any) {
      if (!e.message.includes("duplicate column name") && !e.message.includes("duplicate column")) {
        console.warn("Ошибка при добавлении поля telegram:", e.message);
      }
    }

    // Вставляем начальные категории если их нет (с обработкой ошибок)
    try {
      const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
      if (categoryCount.count === 0) {
        const insertCategory = db.prepare("INSERT INTO categories (name) VALUES (?)");
        const categories = ["Горнолыжные туры", "Активный отдых", "SPA и wellness"];
        categories.forEach((name) => {
          try {
            insertCategory.run(name);
          } catch (e: any) {
            // Игнорируем ошибки дубликатов
            if (!e.message.includes("UNIQUE constraint")) {
              console.warn("Ошибка при вставке категории:", e.message);
            }
          }
        });
      }
    } catch (e: any) {
      console.warn("Ошибка при инициализации категорий:", e.message);
    }
  } catch (e: any) {
    console.error("Критическая ошибка при создании таблиц:", e.message);
    throw e;
  }
}

// Экспортируем функцию для получения базы данных через Proxy для ленивой инициализации
const db = new Proxy({} as DatabaseType, {
  get(_target, prop) {
    const instance = getDb();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export default db;
