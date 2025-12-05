# Полная инструкция по деплою Oktour

## Информация о проекте

- **GitHub репозиторий:** `https://github.com/yourecdigital/tour-galina.git`
- **IP сервера:** `185.179.191.27`
- **Домен:** `oktour.travel`
- **Путь на сервере:** `/var/www/oktour`

---

## Шаг 1: Подключение к серверу

```bash
ssh root@185.179.191.27
```

Введите пароль при запросе.

---

## Шаг 2: Остановка и удаление старого деплоя

```bash
# Перейдите в директорию проекта (если она существует)
cd /var/www/oktour 2>/dev/null || true

# Остановите все Docker контейнеры
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker stop $(docker ps -q) 2>/dev/null || true
docker rm $(docker ps -q) 2>/dev/null || true

# Вернитесь в /var/www и удалите старую папку проекта
cd /var/www
rm -rf oktour

# Проверьте, что папка удалена
ls -la | grep oktour
```

---

## Шаг 3: Обновление системы и установка зависимостей

```bash
# Обновите систему
apt update && apt upgrade -y

# Исправьте возможные проблемы с зависимостями
apt --fix-broken install -y

# Установите Docker через официальный скрипт (рекомендуется)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Установите Docker Compose
apt install -y docker-compose-plugin

# Установите Nginx
apt install -y nginx

# Установите Git (если не установлен)
apt install -y git

# Установите Certbot для SSL
apt install -y certbot python3-certbot-nginx

# Проверьте установку
docker --version
docker compose version
nginx -v
git --version
certbot --version
```

---

## Шаг 4: Клонирование проекта с GitHub

```bash
# Перейдите в рабочую директорию
cd /var/www

# Клонируйте проект
git clone https://github.com/yourecdigital/tour-galina.git oktour

# Перейдите в директорию проекта
cd oktour

# Проверьте, что файлы скопированы
ls -la
```

---

## Шаг 5: Создание необходимых папок и установка прав

**ВАЖНО:** Этот шаг критически важен для работы приложения! Без правильных папок и прав доступа база данных и загрузка файлов не будут работать.

```bash
# Убедитесь, что вы находитесь в директории проекта
cd /var/www/oktour

# 1. Создайте папку для базы данных SQLite
mkdir -p data
echo "Папка data создана для базы данных"

# 2. Создайте папки для загрузки изображений и видео туров
mkdir -p public/uploads/photo
mkdir -p public/uploads/video
echo "Папки для загрузок созданы"

# 3. Создайте папки для видео hero-секций
mkdir -p public/kp          # Видео для страницы Красной Поляны
mkdir -p public/cruises     # Видео для страницы круизов
mkdir -p public/home        # Видео для главной страницы
echo "Папки для hero-видео созданы"

# 4. Создайте папку для фотографий команды (если нужно)
mkdir -p public/team
echo "Папка для фотографий команды создана"

# 5. Установите правильные права доступа (КРИТИЧЕСКИ ВАЖНО!)
# Права 777 нужны для того, чтобы Docker контейнер мог записывать файлы
chmod -R 777 data
chmod -R 777 public/uploads
chmod -R 777 public/kp
chmod -R 777 public/cruises
chmod -R 777 public/home
chmod -R 777 public/team
echo "Права доступа установлены"

# 6. Установите правильного владельца (опционально, но рекомендуется)
# Замените $USER на ваше имя пользователя, если нужно
chown -R $USER:$USER data public/uploads public/kp public/cruises public/home public/team 2>/dev/null || true
echo "Владелец установлен"

# 7. Проверьте, что все папки созданы и имеют правильные права
echo "=== Проверка созданных папок ==="
ls -ld data
ls -ld public/uploads
ls -ld public/kp
ls -ld public/cruises
ls -ld public/home
ls -ld public/team

echo ""
echo "=== Проверка структуры папок ==="
tree -L 3 data public/uploads public/kp public/cruises public/home public/team 2>/dev/null || find data public/uploads public/kp public/cruises public/home public/team -type d | head -20

echo ""
echo "=== Проверка прав доступа ==="
stat -c "%a %n" data public/uploads public/kp public/cruises public/home public/team

echo ""
echo "✅ Все папки созданы и права установлены!"
```

**Что делают эти папки:**

- **`data/`** — хранит базу данных SQLite (`tours.db`). Должна иметь права 777 для записи.
- **`public/uploads/photo/`** — фотографии туров, загружаемые через админ-панель.
- **`public/uploads/video/`** — видео туров, загружаемые через админ-панель.
- **`public/kp/`** — видео для hero-секции страницы Красной Поляны (файлы: `m.mp4`, `p.mp4`, `d.mp4`).
- **`public/cruises/`** — видео для hero-секции страницы круизов.
- **`public/home/`** — видео для hero-секции главной страницы.
- **`public/team/`** — фотографии членов команды.

**Если что-то пошло не так:**

```bash
# Удалите все папки и создайте заново
cd /var/www/oktour
rm -rf data public/uploads public/kp public/cruises public/home public/team

# Затем выполните команды создания папок снова (см. выше)
```

---

## Шаг 6: Создание .env файла

```bash
# Создайте .env файл с переменными окружения
cat > .env << 'EOF'
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8304880903:AAHxEr9U4Ca6E0E-IGxyVMzDL56qocRihWg
TELEGRAM_CHAT_ID=-1003143468391
EOF

# Проверьте, что файл создан
cat .env
```

---

## Шаг 7: Настройка Nginx

```bash
# Скопируйте конфигурацию Nginx
cp nginx.conf /etc/nginx/sites-available/oktour.travel

# Создайте симлинк для активации
ln -sf /etc/nginx/sites-available/oktour.travel /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию (если есть)
rm -f /etc/nginx/sites-enabled/default

# Проверьте конфигурацию Nginx на ошибки
nginx -t

# Если проверка прошла успешно, перезапустите Nginx
systemctl restart nginx

# Включите автозапуск Nginx при перезагрузке
systemctl enable nginx

# Проверьте статус Nginx
systemctl status nginx
```

---

## Шаг 8: Сборка и запуск Docker контейнера

```bash
# Убедитесь, что вы в директории проекта
cd /var/www/oktour

# Соберите Docker образ (это может занять 10-20 минут)
docker-compose -f docker-compose.prod.yml build --no-cache

# Запустите контейнер в фоновом режиме
docker-compose -f docker-compose.prod.yml up -d

# Проверьте статус контейнера
docker-compose -f docker-compose.prod.yml ps

# Посмотрите логи (первые 50 строк)
docker-compose -f docker-compose.prod.yml logs --tail=50 app
```

---

## Шаг 9: Проверка работы приложения

```bash
# Проверьте, что приложение отвечает на localhost:3000
curl -I http://localhost:3000

# Проверьте API
curl -I http://localhost:3000/api/tours/

# Проверьте, что порт 3000 слушается
ss -tulpn | grep :3000

# Проверьте логи на наличие ошибок
docker-compose -f docker-compose.prod.yml logs app | tail -30
```

Если всё работает, переходите к следующему шагу.

---

## Шаг 10: Настройка DNS (если ещё не настроен)

В панели управления доменом `oktour.travel` добавьте A-записи:

- **Запись `@` (корневой домен):** `185.179.191.27`
- **Запись `www`:** `185.179.191.27`

**Важно:** Подождите 15-60 минут после добавления записей для распространения DNS.

Проверить можно командой:
```bash
# На сервере проверьте DNS
host oktour.travel
```

---

## Шаг 11: Получение SSL сертификата (Let's Encrypt)

**Важно:** Выполняйте этот шаг только после того, как DNS записи разошлись (домен указывает на IP сервера).

```bash
# Получите SSL сертификат для домена
certbot --nginx -d oktour.travel -d www.oktour.travel

# Certbot попросит:
# 1. Email адрес (для уведомлений) - введите ваш email
# 2. Согласие с условиями - введите Y
# 3. Редирект HTTP на HTTPS - выберите 2 (Redirect)

# После успешного получения сертификата проверьте его
certbot certificates

# Проверьте, что Nginx перезагрузился
systemctl status nginx
```

---

## Шаг 12: Настройка файрвола (опционально)

```bash
# Установите UFW (если не установлен)
apt install -y ufw

# Откройте необходимые порты
ufw allow 22/tcp    # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

# Включите файрвол
ufw --force enable

# Проверьте статус
ufw status
```

---

## Шаг 13: Финальная проверка

```bash
# 1. Проверьте статус всех сервисов
systemctl status nginx
docker-compose -f docker-compose.prod.yml ps

# 2. Проверьте доступность сайта
curl -I http://oktour.travel
curl -I https://oktour.travel

# 3. Проверьте логи на ошибки
docker-compose -f docker-compose.prod.yml logs app | grep -i error

# 4. Проверьте SSL сертификат
certbot certificates
```

---

## Проверка в браузере

Откройте в браузере:
- **HTTP:** `http://oktour.travel` (должен редиректить на HTTPS)
- **HTTPS:** `https://oktour.travel`
- **Админка:** `https://oktour.travel/admin`
- **API:** `https://oktour.travel/api/tours/`

---

## Полезные команды для управления

### Просмотр логов
```bash
# Логи приложения
docker-compose -f docker-compose.prod.yml logs -f app

# Логи Nginx
tail -f /var/log/nginx/oktour.access.log
tail -f /var/log/nginx/oktour.error.log
```

### Перезапуск приложения
```bash
cd /var/www/oktour
docker-compose -f docker-compose.prod.yml restart
```

### Обновление приложения (после git push)
```bash
cd /var/www/oktour
git pull
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f app
```

### Остановка приложения
```bash
cd /var/www/oktour
docker-compose -f docker-compose.prod.yml down
```

### Проверка использования ресурсов
```bash
docker stats tour-galina-app
```

---

## Решение проблем

### Проблема: Ошибка SQLITE_CANTOPEN

```bash
# Убедитесь, что папка data существует и имеет правильные права
chmod -R 777 /var/www/oktour/data
docker-compose -f docker-compose.prod.yml restart
```

### Проблема: Порт 3000 не отвечает

```bash
# Проверьте, что контейнер запущен
docker ps | grep tour-galina

# Проверьте логи
docker-compose -f docker-compose.prod.yml logs app

# Перезапустите контейнер
docker-compose -f docker-compose.prod.yml restart
```

### Проблема: Nginx не работает

```bash
# Проверьте конфигурацию
nginx -t

# Проверьте логи
tail -50 /var/log/nginx/error.log

# Перезапустите Nginx
systemctl restart nginx
```

### Проблема: SSL сертификат не работает

```bash
# Проверьте сертификат
certbot certificates

# Обновите сертификат вручную
certbot renew --force-renewal

# Перезагрузите Nginx
systemctl reload nginx
```

---

## Важные замечания

1. **Права доступа:** Папка `data` должна иметь права 777 для работы базы данных
2. **Порт 3000:** Должен быть опубликован в docker-compose.prod.yml
3. **Nginx:** Должен работать на хосте, а не в Docker
4. **DNS:** Должен быть настроен перед получением SSL сертификата
5. **SSL:** Certbot автоматически обновляет сертификаты, но можно проверить: `certbot renew --dry-run`

---

## Быстрая команда для обновления (после git push)

```bash
ssh root@185.179.191.27
cd /var/www/oktour
git pull
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f app
```

---

**Готово!** Сайт должен быть доступен по адресу `https://oktour.travel`



!!! certbot --nginx -d oktour.travel