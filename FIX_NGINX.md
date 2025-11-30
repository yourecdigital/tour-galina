# Исправление проблемы с Nginx

## Проблемы с Nginx

### Проблема 1: Nginx не запускается
При выполнении `systemctl start nginx` выдается ошибка:
```
Job for nginx.service failed because the control process exited with error code.
```

**Причины:**
- Ошибка в конфигурации nginx.conf
- SSL сертификаты еще не получены, но конфигурация их требует
- Неправильные пути к файлам

**Решение:**
```bash
# 1. Проверьте логи ошибок
journalctl -xeu nginx.service
tail -50 /var/log/nginx/error.log

# 2. Проверьте конфигурацию
nginx -t

# 3. Если ошибка в SSL сертификатах - используйте конфигурацию без SSL
# (см. ниже)
```

### Проблема 2: Nginx не активен
При выполнении `systemctl reload nginx` выдается ошибка:
```
nginx.service is not active, cannot reload.
```

## Решение проблем

### Если Nginx не запускается из-за SSL сертификатов

Если вы еще не получили SSL сертификат, но в конфигурации указаны пути к нему, Nginx не запустится.

**Временное решение - конфигурация без SSL:**

Используйте конфигурацию, где HTTPS блок закомментирован. Скопируйте обновленный `nginx.conf` на сервер.

**Или создайте конфигурацию вручную:**

```bash
# Создайте простую конфигурацию для начала
cat > /etc/nginx/sites-available/oktour.travel << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name oktour.travel www.oktour.travel;

    # Для Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Проксирование на приложение
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Статические файлы
    location /uploads/ {
        alias /var/www/oktour/public/uploads/;
        expires 30d;
    }

    location /kp/ {
        alias /var/www/oktour/public/kp/;
        expires 7d;
    }

    client_max_body_size 200M;
}
EOF

# Проверьте конфигурацию
nginx -t

# Запустите Nginx
systemctl start nginx
```

### Основное решение

### 1. Проверьте, установлен ли Nginx

```bash
which nginx
# или
nginx -v
```

Если Nginx не установлен:
```bash
apt update
apt install nginx -y
```

### 2. Запустите Nginx

```bash
# Запустите Nginx
systemctl start nginx

# Включите автозапуск при загрузке системы
systemctl enable nginx

# Проверьте статус
systemctl status nginx
```

### 3. Проверьте конфигурацию перед перезагрузкой

```bash
# Проверьте синтаксис конфигурации
nginx -t

# Если есть ошибки, исправьте их
# Если всё ОК, перезагрузите
systemctl reload nginx
```

### 4. Если Nginx не запускается

Проверьте логи ошибок:
```bash
# Логи Nginx
tail -50 /var/log/nginx/error.log

# Системные логи
journalctl -u nginx -n 50
```

### 5. Проверьте, не занят ли порт 80

```bash
# Проверьте, что слушает порт 80
netstat -tulpn | grep :80
# или
ss -tulpn | grep :80

# Если порт занят другим процессом, остановите его
# Например, если Apache:
systemctl stop apache2
systemctl disable apache2
```

### 6. Полная последовательность команд

```bash
# 1. Установка (если нужно)
apt update
apt install nginx -y

# 2. Копирование конфигурации
cp nginx.conf /etc/nginx/sites-available/oktour.travel

# 3. Создание симлинка
ln -sf /etc/nginx/sites-available/oktour.travel /etc/nginx/sites-enabled/

# 4. Удаление дефолтной конфигурации
rm -f /etc/nginx/sites-enabled/default

# 5. Проверка конфигурации
nginx -t

# 6. Запуск Nginx
systemctl start nginx
systemctl enable nginx

# 7. Перезагрузка (теперь должно работать)
systemctl reload nginx

# 8. Проверка статуса
systemctl status nginx
```

## Проверка работы Nginx

После запуска проверьте:

```bash
# Статус службы
systemctl status nginx

# Проверка портов
netstat -tulpn | grep nginx

# Тест HTTP запроса
curl -I http://localhost

# Проверка конфигурации
nginx -T  # Показывает всю конфигурацию
```

## Автозапуск

Убедитесь, что Nginx запускается автоматически при загрузке системы:

```bash
systemctl is-enabled nginx
# Должно вернуть: enabled

# Если disabled, включите:
systemctl enable nginx
```

## Полезные команды

```bash
# Запуск
systemctl start nginx

# Остановка
systemctl stop nginx

# Перезапуск
systemctl restart nginx

# Перезагрузка конфигурации (без остановки)
systemctl reload nginx

# Статус
systemctl status nginx

# Логи в реальном времени
journalctl -u nginx -f
```

