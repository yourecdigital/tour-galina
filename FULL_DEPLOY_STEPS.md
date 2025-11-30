# Полная пошаговая инструкция по развертыванию

## Шаг 1: Подключение к серверу

```bash
ssh root@185.179.191.27
```

## Шаг 2: Удаление всего старого

```bash
# Остановите все Docker контейнеры
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Удалите старую директорию проекта
cd /var/www
rm -rf oktour

# Остановите Nginx (если запущен)
systemctl stop nginx 2>/dev/null || true

# Удалите старую конфигурацию Nginx
rm -f /etc/nginx/sites-enabled/oktour.travel
rm -f /etc/nginx/sites-available/oktour.travel

# Проверьте, что порты свободны
ss -tulpn | grep -E ":80|:3000"
```

## Шаг 3: Установка необходимых пакетов

```bash
# Обновите систему
apt update && apt upgrade -y

# Установите необходимые пакеты
apt install -y docker.io docker-compose nginx git curl

# Проверьте установку
docker --version
docker-compose --version
nginx -v
git --version
```

## Шаг 4: Клонирование проекта с GitHub

```bash
# Перейдите в рабочую директорию
cd /var/www

# Клонируйте проект (замените <ваш-репозиторий> на реальный URL)
git clone https://github.com/yourecdigital/tour-galina.git oktour

# Перейдите в директорию проекта
cd oktour

# Проверьте, что файлы скопированы
ls -la
```

## Шаг 5: Создание необходимых папок

```bash
# Создайте все необходимые папки
mkdir -p data
mkdir -p public/uploads/photo
mkdir -p public/uploads/video
mkdir -p public/kp

# Проверьте создание
ls -la data
ls -la public/uploads
ls -la public/kp
```

## Шаг 6: Установка прав доступа (КРИТИЧЕСКИ ВАЖНО!)

```bash
# Установите права 777 для папки data (для работы базы данных)
chmod -R 777 data

# Установите права для папок с загрузками
chmod -R 755 public/uploads
chmod -R 755 public/kp

# Проверьте права
ls -ld data
# Должно быть: drwxrwxrwx (777)

ls -ld public/uploads
# Должно быть: drwxr-xr-x (755)
```

## Шаг 7: Создание .env файла

```bash
# Создайте .env файл с переменными окружения
cat > .env << 'EOF'
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8304880903:AAHxEr9U4Ca6E0E-IGxyVMzDL56qocRihWg
TELEGRAM_CHAT_ID=-1003143468391
EOF

# Проверьте создание файла
cat .env
```

## Шаг 8: Настройка Nginx

```bash
# Скопируйте конфигурацию Nginx
cp nginx.conf /etc/nginx/sites-available/oktour.travel

# Создайте симлинк для активации конфигурации
ln -sf /etc/nginx/sites-available/oktour.travel /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию (если есть)
rm -f /etc/nginx/sites-enabled/default

# Проверьте конфигурацию на ошибки
nginx -t

# Если проверка прошла успешно, запустите Nginx
systemctl start nginx

# Включите автозапуск Nginx при загрузке системы
systemctl enable nginx

# Проверьте статус Nginx
systemctl status nginx

# Проверьте, что Nginx слушает порт 80
ss -tulpn | grep :80
# Должен показать nginx
```

## Шаг 9: Сборка и запуск Docker контейнера

```bash
# Убедитесь, что вы в директории проекта
cd /var/www/oktour

# Проверьте, что docker-compose.prod.yml существует
ls -la docker-compose.prod.yml

# Соберите Docker образ (это может занять несколько минут)
docker-compose -f docker-compose.prod.yml build --no-cache

# Запустите контейнер
docker-compose -f docker-compose.prod.yml up -d

# Проверьте статус контейнера
docker-compose -f docker-compose.prod.yml ps

# Проверьте логи (должны быть без ошибок SQLITE_CANTOPEN)
docker logs tour-galina-app --tail=50
```

## Шаг 10: Проверка работы приложения

```bash
# Проверьте, что приложение отвечает на порту 3000
curl http://localhost:3000

# Проверьте API endpoints
curl http://localhost:3000/api/tours/
curl http://localhost:3000/api/categories/

# Проверьте логи еще раз (не должно быть ошибок)
docker logs tour-galina-app --tail=30 | grep -i error || echo "Ошибок не найдено"
```

## Шаг 11: Настройка файрвола

```bash
# Установите UFW (если не установлен)
apt install -y ufw

# Откройте необходимые порты
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Включите файрвол
ufw --force enable

# Проверьте статус
ufw status
```

## Шаг 12: Проверка доступа извне

```bash
# Проверьте доступ по IP адресу
curl http://185.179.191.27

# Или откройте в браузере:
# http://185.179.191.27
```

## Шаг 13: Настройка DNS (если еще не настроен)

В панели управления доменом `oktour.travel` добавьте A-записи:

1. Зайдите в панель управления доменом
2. Найдите раздел "DNS записи" или "DNS Management"
3. Добавьте A-запись:
   - **Имя:** `@` (или оставьте пустым для корневого домена)
   - **Тип:** `A`
   - **Значение:** `185.179.191.27`
   - **TTL:** `3600` (или минимальное значение)

4. Добавьте еще одну A-запись для www:
   - **Имя:** `www`
   - **Тип:** `A`
   - **Значение:** `185.179.191.27`
   - **TTL:** `3600`

5. Подождите 30-60 минут для распространения DNS

6. Проверьте DNS:
   ```bash
   nslookup oktour.travel
   # Должно вернуть: 185.179.191.27
   ```

## Шаг 14: Получение SSL сертификата (после настройки DNS)

```bash
# Установите Certbot
apt install -y certbot python3-certbot-nginx

# Получите SSL сертификат
certbot --nginx -d oktour.travel -d www.oktour.travel

# Certbot спросит:
# 1. Email адрес - введите ваш email
# 2. Согласие с условиями - введите A (Agree)
# 3. Редирект HTTP на HTTPS - выберите 2 (Redirect)

# Проверьте сертификаты
certbot certificates

# Проверьте конфигурацию Nginx
nginx -t

# Перезагрузите Nginx
systemctl reload nginx
```

## Шаг 15: Финальная проверка

```bash
# 1. Проверьте статус всех сервисов
systemctl status nginx
docker-compose -f docker-compose.prod.yml ps

# 2. Проверьте логи
docker logs tour-galina-app --tail=20

# 3. Проверьте доступность
curl -I http://localhost:3000
curl -I http://185.179.191.27

# 4. Если DNS настроен, проверьте домен
curl -I http://oktour.travel
```

## Полезные команды для управления

```bash
# Просмотр логов приложения
docker-compose -f docker-compose.prod.yml logs -f app

# Перезапуск приложения
docker-compose -f docker-compose.prod.yml restart

# Остановка приложения
docker-compose -f docker-compose.prod.yml down

# Запуск приложения
docker-compose -f docker-compose.prod.yml up -d

# Обновление приложения (после git pull)
cd /var/www/oktour
git pull
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps
systemctl status nginx
```

## Решение проблем

### Проблема: Ошибка SQLITE_CANTOPEN

```bash
# Убедитесь, что папка data имеет права 777
chmod -R 777 /var/www/oktour/data
ls -ld /var/www/oktour/data

# Перезапустите контейнер
docker-compose -f docker-compose.prod.yml restart

# Проверьте логи
docker logs tour-galina-app --tail=30
```

### Проблема: Порт 80 занят

```bash
# Найдите процесс, занимающий порт 80
ss -tulpn | grep :80

# Остановите его (например, Apache или другой Nginx)
systemctl stop apache2 2>/dev/null || true
pkill nginx 2>/dev/null || true

# Запустите Nginx заново
systemctl start nginx
```

### Проблема: Nginx не запускается

```bash
# Проверьте конфигурацию
nginx -t

# Проверьте логи
tail -50 /var/log/nginx/error.log

# Запустите Nginx
systemctl start nginx
systemctl status nginx
```

### Проблема: Приложение не отвечает

```bash
# Проверьте логи
docker logs tour-galina-app --tail=50

# Проверьте, что контейнер запущен
docker ps | grep tour-galina

# Проверьте порт 3000
ss -tulpn | grep :3000

# Перезапустите контейнер
docker-compose -f docker-compose.prod.yml restart
```

## Чек-лист успешного развертывания

- [ ] Все пакеты установлены (Docker, Nginx, Git)
- [ ] Проект клонирован с GitHub
- [ ] Папки созданы (data, public/uploads, public/kp)
- [ ] Права установлены (data: 777, uploads/kp: 755)
- [ ] .env файл создан
- [ ] Nginx настроен и запущен
- [ ] Docker контейнер собран и запущен
- [ ] Нет ошибок SQLITE_CANTOPEN в логах
- [ ] Приложение отвечает на localhost:3000
- [ ] API работает (/api/tours/, /api/categories/)
- [ ] Сайт доступен по IP: http://185.179.191.27
- [ ] Файрвол настроен
- [ ] DNS настроен (если нужно)
- [ ] SSL сертификат получен (если DNS настроен)

---

**Готово! Сайт должен быть полностью развернут и работать.**

