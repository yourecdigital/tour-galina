# Развертывание приложения в Docker

## Предварительные требования

1. **Docker Desktop** должен быть установлен и запущен
2. **Docker Compose** (обычно входит в Docker Desktop)

## Быстрый старт

### 1. Запустите Docker Desktop

Убедитесь, что Docker Desktop запущен и работает.

### 2. Соберите и запустите контейнер

```bash
# Сборка образа
docker-compose build

# Запуск контейнера
docker-compose up -d

# Просмотр логов
docker-compose logs -f
```

### 3. Откройте приложение

Приложение будет доступно по адресу: http://localhost:3000

## Управление контейнером

```bash
# Остановить контейнер
docker-compose down

# Перезапустить контейнер
docker-compose restart

# Просмотр статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f app

# Остановить и удалить контейнер с данными
docker-compose down -v
```

## Переменные окружения

Переменные окружения можно настроить в файле `.env` или через `docker-compose.yml`:

```env
TELEGRAM_BOT_TOKEN=ваш_токен
TELEGRAM_CHAT_ID=ваш_chat_id
```

Или отредактируйте `docker-compose.yml` напрямую.

## Персистентность данных

- **База данных SQLite**: сохраняется в `./data/tours.db` (монтируется как volume)
- **Загруженные файлы**: сохраняются в `./public/uploads/` (монтируется как volume)

## Сборка без docker-compose

```bash
# Сборка образа
docker build -t tour-galina:latest .

# Запуск контейнера
docker run -d \
  --name tour-galina-app \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/public/uploads:/app/public/uploads \
  -e TELEGRAM_BOT_TOKEN=ваш_токен \
  -e TELEGRAM_CHAT_ID=ваш_chat_id \
  tour-galina:latest
```

## Проверка работоспособности

После запуска контейнера проверьте:

1. Статус контейнера: `docker-compose ps`
2. Логи: `docker-compose logs app`
3. Healthcheck: `docker inspect tour-galina-app | grep -A 10 Health`

## Решение проблем

### Контейнер не запускается

```bash
# Проверьте логи
docker-compose logs app

# Проверьте статус
docker-compose ps
```

### Проблемы с базой данных

Убедитесь, что папка `data` существует и имеет правильные права доступа:

```bash
mkdir -p data
chmod 755 data
```

### Проблемы с загруженными файлами

Убедитесь, что папка `public/uploads` существует:

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

## Production развертывание

Для production рекомендуется:

1. Использовать `.env` файл для секретов
2. Настроить reverse proxy (nginx)
3. Использовать SSL/TLS сертификаты
4. Настроить мониторинг и логирование
5. Использовать managed database вместо SQLite









