# Решение проблем с доступом к сайту

## Проблема: "Не удается открыть эту страницу"

### Шаг 1: Проверка DNS

Проверьте, что домен указывает на правильный IP:

**В Windows (PowerShell):**
```powershell
nslookup oktour.travel
```

**В Linux/Mac:**
```bash
dig oktour.travel +short
# или
nslookup oktour.travel
```

**Должно вернуть:** `185.179.191.27`

Если DNS не настроен:
1. Зайдите в панель управления вашего доменного регистратора
2. Найдите настройки DNS
3. Добавьте A-запись:
   - Имя: `@` или `oktour.travel`
   - Значение: `185.179.191.27`
   - TTL: `3600` (или автоматически)
4. Добавьте A-запись для www:
   - Имя: `www`
   - Значение: `185.179.191.27`
   - TTL: `3600`

**Время распространения DNS:** 5-30 минут (иногда до 48 часов)

### Шаг 2: Проверка доступности сервера

**Проверьте, что сервер доступен:**
```bash
ping 185.179.191.27
```

**Проверьте, что порты открыты:**
```bash
# Windows PowerShell
Test-NetConnection -ComputerName 185.179.191.27 -Port 80
Test-NetConnection -ComputerName 185.179.191.27 -Port 443
Test-NetConnection -ComputerName 185.179.191.27 -Port 22
```

**В Linux/Mac:**
```bash
telnet 185.179.191.27 80
telnet 185.179.191.27 443
telnet 185.179.191.27 22
```

### Шаг 3: Подключение к серверу

Подключитесь к серверу по SSH:
```bash
ssh root@185.179.191.27
# или
ssh ваш_пользователь@185.179.191.27
```

### Шаг 4: Проверка развертывания

После подключения к серверу проверьте:

**1. Проверьте, развернуто ли приложение:**
```bash
cd /var/www/oktour
ls -la
```

Если папки нет, нужно развернуть приложение (см. QUICK_DEPLOY.md)

**2. Проверьте статус Docker контейнера:**
```bash
cd /var/www/oktour
docker-compose -f docker-compose.prod.yml ps
```

Если контейнер не запущен:
```bash
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs
```

**3. Проверьте статус Nginx:**
```bash
systemctl status nginx
```

Если Nginx не запущен:
```bash
systemctl start nginx
systemctl enable nginx
```

**4. Проверьте конфигурацию Nginx:**
```bash
nginx -t
```

**5. Проверьте, что Nginx слушает порты:**
```bash
netstat -tulpn | grep nginx
# или
ss -tulpn | grep nginx
```

Должны быть порты 80 и 443.

**6. Проверьте логи Nginx:**
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

**7. Проверьте файрвол:**
```bash
ufw status
```

Должны быть открыты порты 22, 80, 443:
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Шаг 5: Быстрое развертывание (если не развернуто)

Если приложение еще не развернуто:

```bash
# 1. Создайте директорию
mkdir -p /var/www/oktour
cd /var/www/oktour

# 2. Клонируйте репозиторий
git clone https://github.com/yourecdigital/tour-galina.git .

# 3. Создайте .env файл
nano .env
```

Добавьте в .env:
```env
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8304880903:AAHxEr9U4Ca6E0E-IGxyVMzDL56qocRihWg
TELEGRAM_CHAT_ID=-1003143468391
```

```bash
# 4. Запустите скрипт развертывания
chmod +x deploy.sh
sudo ./deploy.sh
```

Или разверните вручную (см. QUICK_DEPLOY.md)

### Шаг 6: Проверка работы приложения

**Проверьте, что приложение отвечает локально на сервере:**
```bash
curl http://localhost:3000
```

Если не отвечает, проверьте логи:
```bash
docker-compose -f docker-compose.prod.yml logs
```

**Проверьте через Nginx:**
```bash
curl http://localhost
curl https://localhost
```

### Шаг 7: Проверка SSL сертификата

```bash
certbot certificates
```

Если сертификата нет:
```bash
certbot --nginx -d oktour.travel -d www.oktour.travel
```

### Шаг 8: Временное решение (прямой доступ по IP)

Пока DNS не настроен, можно временно использовать IP напрямую:

1. Отредактируйте `/etc/hosts` на вашем компьютере:
   - Windows: `C:\Windows\System32\drivers\etc\hosts`
   - Linux/Mac: `/etc/hosts`

2. Добавьте строку:
   ```
   185.179.191.27 oktour.travel
   ```

3. Сохраните файл (в Windows нужны права администратора)

4. Теперь можно открыть http://oktour.travel (без SSL)

**Внимание:** Это работает только на вашем компьютере!

## Частые проблемы

### Проблема: "Connection refused"
**Решение:** Приложение не запущено или порт закрыт файрволом

### Проблема: "502 Bad Gateway"
**Решение:** Docker контейнер не запущен или Nginx не может подключиться к нему

### Проблема: "404 Not Found"
**Решение:** Nginx не настроен правильно или приложение не развернуто

### Проблема: "SSL certificate error"
**Решение:** SSL сертификат не получен или истек

## Команды для диагностики

```bash
# Статус всех сервисов
systemctl status nginx
systemctl status docker
docker-compose -f docker-compose.prod.yml ps

# Проверка портов
netstat -tulpn | grep -E ':(80|443|3000)'

# Проверка DNS на сервере
dig oktour.travel +short
nslookup oktour.travel

# Проверка доступности
curl -I http://localhost:3000
curl -I http://localhost
curl -I https://localhost

# Логи
docker-compose -f docker-compose.prod.yml logs -f
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```





