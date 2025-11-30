# Настройка SSL сертификата

## Важно: SSL работает только с доменом!

SSL сертификат **нельзя** получить для IP адреса. Нужен настроенный домен.

## Порядок действий

### 1. Сначала настройте DNS

Домен `oktour.travel` должен указывать на IP `185.179.191.27`:

**В панели управления доменом добавьте:**
- A-запись: `@` → `185.179.191.27`
- A-запись: `www` → `185.179.191.27`

**Проверьте DNS:**
```bash
nslookup oktour.travel
# Должно вернуть: 185.179.191.27
```

**Подождите 5-30 минут** для распространения DNS.

### 2. Затем получите SSL сертификат

После того, как DNS настроен, подключитесь к серверу:

```bash
ssh root@185.179.191.27
```

**Установите Certbot (если еще не установлен):**
```bash
apt update
apt install certbot python3-certbot-nginx -y
```

**Получите SSL сертификат:**

**Вариант 1: С указанием email (рекомендуется):**
```bash
# Замените your-email@example.com на ваш реальный email
certbot --nginx -d oktour.travel -d www.oktour.travel --email your-email@example.com --agree-tos --non-interactive --redirect
```

**Вариант 2: Интерактивно (Certbot спросит email):**
```bash
certbot --nginx -d oktour.travel -d www.oktour.travel
# Certbot спросит:
# 1. Email адрес (для уведомлений) - введите ваш email
# 2. Согласие с условиями - введите `A` (Agree)
# 3. Редирект HTTP на HTTPS - выберите `2` (Redirect)
```

Certbot автоматически:
- ✅ Получит SSL сертификат от Let's Encrypt
- ✅ Настроит Nginx для работы с HTTPS
- ✅ Настроит автоматическое обновление сертификата

### Изменение email адреса

Если нужно изменить email после получения сертификата:

```bash
# Способ 1: Измените в конфигурации
nano /etc/letsencrypt/cli.ini
# Добавьте или измените строку: email = your-email@example.com

# Способ 2: При обновлении сертификата
certbot renew --email your-new-email@example.com --agree-tos

# Способ 3: Перевыпустите сертификат
certbot --nginx -d oktour.travel -d www.oktour.travel --email your-new-email@example.com --force-renewal --agree-tos --non-interactive
```

### 3. Проверка SSL

После получения сертификата:

```bash
# Проверьте сертификаты
certbot certificates

# Проверьте конфигурацию Nginx
nginx -t

# Перезагрузите Nginx
systemctl reload nginx
```

**Откройте в браузере:** https://oktour.travel

Должен быть валидный SSL сертификат (зеленый замочек).

## Автоматическое обновление

Let's Encrypt сертификаты действительны 90 дней. Certbot автоматически обновляет их.

**Проверка автообновления:**
```bash
systemctl status certbot.timer
```

**Тестовое обновление:**
```bash
certbot renew --dry-run
```

## Если DNS еще не настроен

### Временное решение: HTTP без SSL

Пока DNS не настроен, можно использовать сайт **без SSL**:

1. **Доступ по IP:** http://185.179.191.27
2. **Или через hosts файл:** http://oktour.travel (см. FIX_DNS.md)

**Внимание:** Без SSL данные передаются незашифрованными!

### После настройки DNS

Как только DNS настроен и работает:
1. Подключитесь к серверу
2. Запустите: `certbot --nginx -d oktour.travel -d www.oktour.travel`
3. SSL будет настроен автоматически

## Проверка работы SSL

### Онлайн проверка:
- https://www.ssllabs.com/ssltest/analyze.html?d=oktour.travel
- https://www.sslshopper.com/ssl-checker.html#hostname=oktour.travel

### С сервера:
```bash
# Проверка сертификата
openssl s_client -connect oktour.travel:443 -servername oktour.travel

# Проверка через curl
curl -I https://oktour.travel
```

## Решение проблем с SSL

### Проблема: "Domain does not point to this server"

**Решение:** DNS еще не настроен или не распространился. Подождите и проверьте:
```bash
dig oktour.travel +short
# Должно вернуть: 185.179.191.27
```

### Проблема: "Connection refused" при получении сертификата

**Решение:** 
1. Убедитесь, что порт 80 открыт в файрволе:
   ```bash
   ufw allow 80/tcp
   ```
2. Убедитесь, что Nginx запущен:
   ```bash
   systemctl status nginx
   ```

### Проблема: "Certificate has expired"

**Решение:** Обновите сертификат:
```bash
certbot renew --force-renewal
systemctl reload nginx
```

### Проблема: "Mixed Content" (часть сайта загружается по HTTP)

**Решение:** Убедитесь, что все ссылки на ресурсы используют HTTPS или относительные пути.

## Конфигурация Nginx для SSL

После получения сертификата, Certbot автоматически обновит `/etc/nginx/sites-available/oktour.travel`.

**Проверьте конфигурацию:**
```bash
cat /etc/nginx/sites-available/oktour.travel
```

Должны быть:
- `ssl_certificate` - путь к сертификату
- `ssl_certificate_key` - путь к ключу
- Редирект с HTTP на HTTPS

## Безопасность SSL

Рекомендуемые настройки уже включены в `nginx.conf`:
- TLS 1.2 и 1.3
- Современные шифры
- HSTS заголовок
- Безопасные заголовки

## Резюме

1. ✅ **Сначала:** Настройте DNS (A-записи на 185.179.191.27)
2. ✅ **Затем:** Получите SSL сертификат через Certbot
3. ✅ **Результат:** https://oktour.travel с валидным SSL

**Без настроенного DNS SSL получить нельзя!**


