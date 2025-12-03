# Простая инструкция по развертыванию на сервере

## Шаг 1: Подготовка сервера

```bash
# Подключитесь к серверу
ssh root@185.179.191.27

# Обновите систему
apt update && apt upgrade -y

# Установите необходимые пакеты
apt install -y docker.io docker-compose nginx git
```

## Шаг 2: Клонирование проекта

```bash
# Перейдите в рабочую директорию
cd /var/www

# Удалите старую версию (если есть)
rm -rf oktour

# Клонируйте проект с GitHub
git clone <ваш-репозиторий> oktour

# Перейдите в директорию проекта
cd oktour
```

## Шаг 3: Создание необходимых папок и файлов

```bash
# Создайте папки для данных
mkdir -p data public/uploads/photo public/uploads/video public/kp

# Установите правильные права доступа (важно!)
chmod -R 777 data
chmod -R 755 public/uploads public/kp

# Создайте .env файл
cat > .env << 'EOF'
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8304880903:AAHxEr9U4Ca6E0E-IGxyVMzDL56qocRihWg
TELEGRAM_CHAT_ID=-1003143468391
EOF
```

## Шаг 4: Настройка Nginx

```bash
# Скопируйте конфигурацию Nginx
cp nginx.conf /etc/nginx/sites-available/oktour.travel

# Создайте симлинк
ln -sf /etc/nginx/sites-available/oktour.travel /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию
rm -f /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
nginx -t

# Запустите Nginx
systemctl start nginx
systemctl enable nginx

# Проверьте статус
systemctl status nginx
```

## Шаг 5: Остановка старых контейнеров (если есть)

```bash
# Остановите все контейнеры, которые могут занимать порты
docker stop $(docker ps -q) 2>/dev/null || true

# Проверьте, что порт 80 свободен
ss -tulpn | grep :80
```

## Шаг 6: Запуск приложения в Docker

```bash
# Перейдите в директорию проекта
cd /var/www/oktour

# Соберите Docker образ
docker-compose -f docker-compose.prod.yml build --no-cache

# Запустите контейнер
docker-compose -f docker-compose.prod.yml up -d

# Проверьте статус
docker-compose -f docker-compose.prod.yml ps

# Проверьте логи
docker-compose -f docker-compose.prod.yml logs -f app
```

## Шаг 7: Проверка работы

```bash
# Проверьте, что приложение отвечает
curl http://localhost:3000

# Проверьте API
curl http://localhost:3000/api/tours/

# Проверьте логи (не должно быть ошибок SQLITE_CANTOPEN)
docker logs tour-galina-app --tail=30
```

## Шаг 8: Настройка файрвола

```bash
# Установите UFW (если не установлен)
apt install -y ufw

# Откройте необходимые порты
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Включите файрвол
ufw --force enable

# Проверьте статус
ufw status
```

## Шаг 9: Настройка DNS (если еще не настроен)

В панели управления доменом `oktour.travel` добавьте A-записи:
- `@` → `185.179.191.27`
- `www` → `185.179.191.27`

Подождите 30-60 минут для распространения DNS.

## Шаг 10: Получение SSL сертификата (после настройки DNS)

```bash
# Установите Certbot
apt install -y certbot python3-certbot-nginx

# Получите SSL сертификат
certbot --nginx -d oktour.travel -d www.oktour.travel

# Certbot автоматически обновит конфигурацию Nginx
```

## Проверка после развертывания

1. **Сайт доступен по IP:** http://185.179.191.27
2. **Сайт доступен по домену:** http://oktour.travel (после настройки DNS)
3. **API работает:** http://oktour.travel/api/tours/
4. **Админка доступна:** http://oktour.travel/admin

## Полезные команды

```bash
# Просмотр логов приложения
docker-compose -f docker-compose.prod.yml logs -f app

# Перезапуск приложения
docker-compose -f docker-compose.prod.yml restart

# Остановка приложения
docker-compose -f docker-compose.prod.yml down

# Обновление приложения
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
# Убедитесь, что папка data существует и имеет правильные права
chmod -R 777 /var/www/oktour/data
docker-compose -f docker-compose.prod.yml restart
```

### Проблема: Порт 80 занят

```bash
# Найдите процесс, занимающий порт 80
ss -tulpn | grep :80

# Остановите его (например, если это Apache)
systemctl stop apache2
systemctl disable apache2
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

## Важные замечания

1. **Права доступа:** Папка `data` должна иметь права 777 для работы базы данных
2. **Порт 3000:** Должен быть опубликован в docker-compose.prod.yml
3. **Nginx:** Должен работать на хосте, а не в Docker
4. **DNS:** Должен быть настроен перед получением SSL сертификата







