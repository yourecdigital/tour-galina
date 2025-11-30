# Исправление проблемы с загрузкой файлов в Docker

## Проблема
Картинки и видео не загружаются на развернутом в Docker сайте, хотя локально всё работало.

## Причины
1. **Nginx не настроен для раздачи статических файлов** - все запросы шли через прокси на Next.js
2. **Отсутствует volume для папки `/kp`** в docker-compose
3. **Неправильные права доступа** к папкам

## Решение

### 1. Обновите файлы на сервере

Скопируйте обновленные файлы:
- `nginx.conf` - добавлена раздача статических файлов
- `docker-compose.prod.yml` - добавлен volume для `/kp`
- `Dockerfile` - создание папки `/kp`

### 2. На сервере создайте папки и установите права

```bash
ssh root@185.179.191.27
cd /var/www/oktour

# Создайте папки если их нет
mkdir -p public/uploads/photo public/uploads/video public/kp

# Установите правильные права
chmod -R 755 public/uploads public/kp
chown -R $USER:$USER public/uploads public/kp
```

### 3. Обновите Nginx конфигурацию

```bash
# Скопируйте обновленный nginx.conf
cp nginx.conf /etc/nginx/sites-available/oktour.travel

# Создайте симлинк (если еще не создан)
ln -sf /etc/nginx/sites-available/oktour.travel /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию (если есть)
rm -f /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
nginx -t

# Если Nginx не запущен, запустите его
systemctl start nginx

# Если Nginx уже запущен, перезагрузите
systemctl reload nginx

# Проверьте статус
systemctl status nginx
```

### 4. Пересоберите и перезапустите Docker контейнеры

```bash
cd /var/www/oktour

# Остановите контейнеры
docker-compose -f docker-compose.prod.yml down

# Пересоберите образ
docker-compose -f docker-compose.prod.yml build --no-cache

# Запустите контейнеры
docker-compose -f docker-compose.prod.yml up -d

# Проверьте логи
docker-compose -f docker-compose.prod.yml logs -f app
```

### 5. Проверьте права доступа внутри контейнера

```bash
# Войдите в контейнер
docker exec -it tour-galina-app sh

# Проверьте права
ls -la /app/public/
ls -la /app/public/uploads/
ls -la /app/public/kp/

# Если нужно, исправьте права (внутри контейнера)
chmod -R 755 /app/public/uploads /app/public/kp
chown -R nextjs:nodejs /app/public/uploads /app/public/kp

# Выйдите
exit
```

### 6. Проверьте работу

1. **Проверьте доступность статических файлов:**
   ```bash
   curl -I http://localhost/uploads/photo/test.jpg
   curl -I http://localhost/kp/d.mp4
   ```

2. **Проверьте логи Nginx:**
   ```bash
   tail -f /var/log/nginx/oktour.access.log
   tail -f /var/log/nginx/oktour.error.log
   ```

3. **Проверьте логи приложения:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f app
   ```

## Что было исправлено

### 1. Nginx конфигурация (`nginx.conf`)
Добавлены блоки для раздачи статических файлов:
- `/uploads/` - загруженные изображения и видео
- `/kp/` - hero видео

Теперь Nginx раздает эти файлы напрямую, без проксирования на Next.js.

### 2. Docker Compose (`docker-compose.prod.yml`)
Добавлен volume для папки `/kp`:
```yaml
- ./public/kp:/app/public/kp
```

### 3. Dockerfile
Добавлено создание папки `/kp`:
```dockerfile
RUN mkdir -p /app/data /app/public/uploads /app/public/kp
```

## Проверка после исправления

1. **Загрузите тестовое изображение** через админ-панель
2. **Проверьте в браузере:** `https://oktour.travel/uploads/photo/[имя-файла]`
3. **Загрузите тестовое видео** для hero секции
4. **Проверьте в браузере:** `https://oktour.travel/kp/d.mp4`

## Если проблема осталась

### Проверьте права доступа на сервере:
```bash
ls -la /var/www/oktour/public/
ls -la /var/www/oktour/public/uploads/
ls -la /var/www/oktour/public/kp/
```

### Проверьте монтирование volumes:
```bash
docker inspect tour-galina-app | grep -A 10 Mounts
```

### Проверьте логи ошибок:
```bash
# Логи Nginx
tail -50 /var/log/nginx/oktour.error.log

# Логи Docker
docker-compose -f docker-compose.prod.yml logs app | grep -i error
```

### Проверьте, что папки существуют:
```bash
docker exec tour-galina-app ls -la /app/public/
docker exec tour-galina-app ls -la /app/public/uploads/
docker exec tour-galina-app ls -la /app/public/kp/
```

## Дополнительные настройки

### Увеличен лимит размера файлов
В `nginx.conf` установлен `client_max_body_size 200M` для загрузки больших видео.

### Кэширование статических файлов
- `/uploads/` - кэш 30 дней
- `/kp/` - кэш 7 дней

### CORS заголовки
Добавлены заголовки для доступа к медиа файлам с любых доменов.

