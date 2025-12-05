# Инструкция по развертыванию на сервере

## Информация о сервере

- **IP адрес:** 185.179.191.27
- **Домен:** oktour.travel
- **SSL:** Let's Encrypt (бесплатный)

## Предварительные требования

1. **Доступ к серверу** по SSH
2. **Docker и Docker Compose** установлены на сервере
3. **Домен настроен** и указывает на IP сервера (A-запись: `oktour.travel -> 185.179.191.27`)

## Шаг 1: Подключение к серверу

```bash
ssh root@185.179.191.27
# или
ssh ваш_пользователь@185.179.191.27
```

## Шаг 2: Установка Docker и Docker Compose

Если Docker еще не установлен:

```bash
# Обновление системы (Ubuntu/Debian)
apt update && apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
apt install docker-compose -y

# Проверка установки
docker --version
docker-compose --version
```

## Шаг 3: Подготовка проекта на сервере

```bash
# Создаем директорию для проекта
mkdir -p /var/www/oktour
cd /var/www/oktour

# Клонируем репозиторий (или загружаем файлы)
git clone https://github.com/yourecdigital/tour-galina.git .

# Или создаем структуру вручную и загружаем файлы через SCP/SFTP
```

## Шаг 4: Создание файлов конфигурации

### Создайте файл `.env` на сервере:

```bash
nano /var/www/oktour/.env
```

Содержимое:
```env
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8304880903:AAHxEr9U4Ca6E0E-IGxyVMzDL56qocRihWg
TELEGRAM_CHAT_ID=-1003143468391
```

### Обновите `docker-compose.yml` для production:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tour-galina-app
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./data:/app/data
      - ./public/uploads:/app/public/uploads
    networks:
      - oktour-network
    # Не публикуем порт наружу, только для nginx
    expose:
      - "3000"

networks:
  oktour-network:
    driver: bridge
```

## Шаг 5: Установка и настройка Nginx

```bash
# Установка Nginx
apt install nginx -y

# Создаем конфигурацию для сайта
nano /etc/nginx/sites-available/oktour.travel
```

Содержимое конфигурации Nginx:

```nginx
# HTTP -> HTTPS редирект
server {
    listen 80;
    listen [::]:80;
    server_name oktour.travel www.oktour.travel;

    # Для Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Редирект на HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS сервер
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name oktour.travel www.oktour.travel;

    # SSL сертификаты (будут добавлены Certbot)
    ssl_certificate /etc/letsencrypt/live/oktour.travel/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/oktour.travel/privkey.pem;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Безопасность
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Логи
    access_log /var/log/nginx/oktour.access.log;
    error_log /var/log/nginx/oktour.error.log;

    # Проксирование на Docker контейнер
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Увеличенный размер загружаемых файлов
    client_max_body_size 100M;
}
```

Активируем конфигурацию:

```bash
# Создаем симлинк
ln -s /etc/nginx/sites-available/oktour.travel /etc/nginx/sites-enabled/

# Проверяем конфигурацию
nginx -t

# Перезагружаем Nginx
systemctl reload nginx
```

## Шаг 6: Установка SSL сертификата (Let's Encrypt)

```bash
# Установка Certbot
apt install certbot python3-certbot-nginx -y

# Получение SSL сертификата
certbot --nginx -d oktour.travel -d www.oktour.travel

# Certbot автоматически обновит конфигурацию Nginx
```

Certbot попросит:
- Email адрес (для уведомлений)
- Согласие с условиями
- Редирект HTTP на HTTPS (выберите 2)

### Автоматическое обновление сертификата

```bash
# Проверка автообновления (должно быть включено по умолчанию)
systemctl status certbot.timer

# Тестовое обновление
certbot renew --dry-run
```

## Шаг 7: Сборка и запуск Docker контейнера

```bash
cd /var/www/oktour

# Сборка образа
docker-compose build

# Запуск контейнера
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

## Шаг 8: Настройка файрвола

```bash
# Установка UFW (если не установлен)
apt install ufw -y

# Разрешаем SSH
ufw allow 22/tcp

# Разрешаем HTTP и HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Включаем файрвол
ufw enable

# Проверка статуса
ufw status
```

## Шаг 9: Проверка работы

1. Откройте в браузере: https://oktour.travel
2. Проверьте SSL сертификат (должен быть валидный)
3. Проверьте работу сайта

## Шаг 10: Настройка автозапуска

```bash
# Docker Compose автоматически запускает контейнеры при перезагрузке
# Но можно добавить в systemd для надежности

nano /etc/systemd/system/oktour.service
```

Содержимое:

```ini
[Unit]
Description=Oktour Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/oktour
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Активируем:

```bash
systemctl daemon-reload
systemctl enable oktour.service
```

## Управление приложением

### Обновление приложения

```bash
cd /var/www/oktour

# Остановка контейнера
docker-compose down

# Обновление кода (если используете Git)
git pull

# Пересборка образа
docker-compose build --no-cache

# Запуск
docker-compose up -d
```

### Просмотр логов

```bash
# Логи приложения
docker-compose logs -f app

# Логи Nginx
tail -f /var/log/nginx/oktour.access.log
tail -f /var/log/nginx/oktour.error.log
```

### Перезапуск сервисов

```bash
# Перезапуск приложения
docker-compose restart

# Перезапуск Nginx
systemctl restart nginx

# Перезапуск всего сервера
reboot
```

## Резервное копирование

### Создание бэкапа

```bash
# Создаем скрипт бэкапа
nano /root/backup-oktour.sh
```

Содержимое:

```bash
#!/bin/bash
BACKUP_DIR="/root/backups/oktour"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Бэкап базы данных
cp /var/www/oktour/data/tours.db $BACKUP_DIR/tours_$DATE.db

# Бэкап загруженных файлов
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/oktour/public/uploads

# Удаляем старые бэкапы (старше 7 дней)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Делаем исполняемым:

```bash
chmod +x /root/backup-oktour.sh
```

### Автоматический бэкап (cron)

```bash
# Редактируем crontab
crontab -e

# Добавляем строку (бэкап каждый день в 2:00)
0 2 * * * /root/backup-oktour.sh
```

## Мониторинг

### Проверка статуса

```bash
# Статус контейнера
docker-compose ps

# Использование ресурсов
docker stats tour-galina-app

# Статус Nginx
systemctl status nginx

# Статус SSL сертификата
certbot certificates
```

## Решение проблем

### Контейнер не запускается

```bash
# Проверьте логи
docker-compose logs app

# Проверьте конфигурацию
docker-compose config
```

### Nginx не работает

```bash
# Проверьте конфигурацию
nginx -t

# Проверьте логи
tail -f /var/log/nginx/error.log
```

### SSL сертификат не работает

```bash
# Проверьте сертификат
certbot certificates

# Обновите сертификат вручную
certbot renew --force-renewal

# Перезагрузите Nginx
systemctl reload nginx
```

### Проблемы с портами

```bash
# Проверьте, какие порты заняты
netstat -tulpn | grep :3000
netstat -tulpn | grep :80
netstat -tulpn | grep :443
```

## Безопасность

### Рекомендации:

1. **Регулярно обновляйте систему:**
   ```bash
   apt update && apt upgrade -y
   ```

2. **Используйте сильные пароли** для SSH и баз данных

3. **Настройте fail2ban** для защиты от брутфорса:
   ```bash
   apt install fail2ban -y
   systemctl enable fail2ban
   ```

4. **Регулярно проверяйте логи:**
   ```bash
   tail -f /var/log/nginx/oktour.access.log
   ```

5. **Используйте SSH ключи** вместо паролей

## Контакты и поддержка

При возникновении проблем проверьте:
- Логи приложения: `docker-compose logs -f`
- Логи Nginx: `/var/log/nginx/oktour.error.log`
- Статус сервисов: `systemctl status nginx docker`










