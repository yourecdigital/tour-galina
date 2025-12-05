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

      CREATE TABLE IF NOT EXISTS subcategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE(name, category_id)
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
      CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);
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

      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        quote TEXT,
        photo TEXT,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_team_members_order ON team_members(display_order);
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

    // Миграция: создаем таблицу subcategories если её нет
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS subcategories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
          UNIQUE(name, category_id)
        )
      `).run();
      db.prepare("CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id)").run();
    } catch (e: any) {
      if (!e.message.includes("already exists") && !e.message.includes("duplicate")) {
        console.warn("Ошибка при создании таблицы subcategories:", e.message);
      }
    }

    // Миграция: добавляем поле subcategory_id в tours если его нет
    try {
      // Проверяем, существует ли колонка
      const tableInfo = db.prepare("PRAGMA table_info(tours)").all() as Array<{ name: string }>;
      const hasSubcategoryId = tableInfo.some(col => col.name === "subcategory_id");
      
      if (!hasSubcategoryId) {
        console.log("Добавляем поле subcategory_id в таблицу tours...");
        db.prepare("ALTER TABLE tours ADD COLUMN subcategory_id INTEGER").run();
        console.log("Поле subcategory_id успешно добавлено");
        
        // Создаем индекс после добавления колонки
        try {
          db.prepare("CREATE INDEX IF NOT EXISTS idx_tours_subcategory ON tours(subcategory_id)").run();
          console.log("Индекс idx_tours_subcategory создан");
        } catch (e: any) {
          if (!e.message.includes("already exists") && !e.message.includes("duplicate")) {
            console.warn("Ошибка при создании индекса subcategory_id:", e.message);
          }
        }
      } else {
        console.log("Поле subcategory_id уже существует в таблице tours");
      }
    } catch (e: any) {
      console.error("Критическая ошибка при добавлении поля subcategory_id:", e.message);
      // Не прерываем выполнение, так как это может быть нормально если поле уже существует
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

    // Вставляем начальных членов команды если их нет
    try {
      const teamCount = db.prepare("SELECT COUNT(*) as count FROM team_members").get() as { count: number };
      if (teamCount.count === 0) {
        const insertMember = db.prepare("INSERT INTO team_members (name, role, quote, photo, display_order) VALUES (?, ?, ?, ?, ?)");
        const teamMembers = [
          { name: "Галина", role: "Идейный вдохновитель нашей команды", quote: "Вдохновляет нас искать тонкий баланс между комфортом и приключением.", photo: "/team/1.jpg", order: 0 },
          { name: "Сергей", role: "Горы — символ свободы и внутреннего роста, где чувствуешь себя живым", quote: "Ведёт авторские маршруты и следит, чтобы каждая деталь соответствовала мечте клиента.", photo: "/team/2.jpg", order: 1 },
          { name: "Евгений", role: "Для него горы — не просто отдых, а источник вдохновения и силы", quote: "Отвечает за экспедиции и трекинг, подключая лучшие локальные команды.", photo: "/team/3.jpg", order: 2 },
          { name: "Анна", role: "Читала книги о горных путешествиях, а теперь — это её жизнь", quote: "Создаёт камерные программы с сильным сторителлингом и вниманием к эмоциям.", photo: "/team/4.jpg", order: 3 },
          { name: "Марина", role: "Верит, что каждое путешествие начинается с искреннего внимания к мечтам", quote: "Обеспечивает персональный сервис и заботится о комфорте клиентов на каждом этапе.", photo: "/team/5.jpg", order: 4 },
        ];
        teamMembers.forEach((member) => {
          try {
            insertMember.run(member.name, member.role, member.quote, member.photo, member.order);
          } catch (e: any) {
            console.warn("Ошибка при вставке члена команды:", e.message);
          }
        });
        console.log("Начальные члены команды добавлены в базу данных");
      }
    } catch (e: any) {
      console.warn("Ошибка при инициализации членов команды:", e.message);
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
