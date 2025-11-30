# Быстрое развертывание на сервере

## Быстрый старт (5 минут)

### 1. Подключитесь к серверу
```bash
ssh root@185.179.191.27
```

### 2. Загрузите файлы на сервер

**Вариант A: Через Git**
```bash
cd /var/www
git clone https://github.com/yourecdigital/tour-galina.git oktour
cd oktour
```

**Вариант B: Через SCP (с вашего компьютера)**
```bash
scp -r . root@185.179.191.27:/var/www/oktour
```

### 3. Запустите автоматический скрипт развертывания
```bash
cd /var/www/oktour
chmod +x deploy.sh
sudo ./deploy.sh
```

Скрипт автоматически:
- ✅ Установит Docker, Nginx, Certbot
- ✅ Настроит SSL сертификат
- ✅ Настроит Nginx как reverse proxy
- ✅ Запустит приложение в Docker
- ✅ Настроит файрвол

### 4. Проверьте работу
Откройте в браузере: **https://oktour.travel**

---

## Ручное развертывание (если скрипт не работает)

### Шаг 1: Установка зависимостей
```bash
ls
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
apt install docker-compose nginx certbot python3-certbot-nginx -y
```

### Шаг 2: Подготовка проекта
```bash
mkdir -p /var/www/oktour
cd /var/www/oktour
# Загрузите файлы проекта сюда
```

### Шаг 3: Создание .env файла
```bash
nano .env
```
Добавьте:
```env
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8304880903:AAHxEr9U4Ca6E0E-IGxyVMzDL56qocRihWg
TELEGRAM_CHAT_ID=-1003143468391
```

### Шаг 3.5: Создание папок для загрузок
```bash
# Создайте необходимые папки
mkdir -p public/uploads/photo public/uploads/video public/kp

# Установите правильные права доступа
chmod -R 755 public/uploads public/kp
```

### Шаг 4: Настройка Nginx
```bash
# Установите Nginx (если еще не установлен)
apt install nginx -y

# Скопируйте конфигурацию
cp nginx.conf /etc/nginx/sites-available/oktour.travel

# Создайте симлинк
ln -sf /etc/nginx/sites-available/oktour.travel /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию
rm -f /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
nginx -t

# Запустите Nginx (если не запущен) или перезагрузите
systemctl start nginx
systemctl enable nginx  # Автозапуск при загрузке системы
systemctl reload nginx

# Проверьте статус
systemctl status nginx
```

### Шаг 5: Получение SSL сертификата

**⚠️ ВАЖНО: SSL можно получить ТОЛЬКО после настройки DNS!**

Убедитесь, что DNS настроен:
```bash
dig oktour.travel +short
# Должно вернуть: 185.179.191.27
```

Если DNS настроен, получите SSL:
```bash
certbot --nginx -d oktour.travel -d www.oktour.travel
```

**Если DNS еще не настроен:**
- Используйте сайт по HTTP: http://185.179.191.27
- Или настройте hosts файл (см. FIX_DNS.md)
- После настройки DNS получите SSL сертификат

### Шаг 6: Запуск приложения
```bash
cd /var/www/oktour
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Шаг 7: Настройка файрвола
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Важно перед развертыванием

1. **Настройте DNS**: Убедитесь, что домен `oktour.travel` указывает на IP `185.179.191.27`
   - A-запись: `oktour.travel -> 185.179.191.27`
   - A-запись: `www.oktour.travel -> 185.179.191.27`

2. **Проверьте DNS**:
   ```bash
   dig oktour.travel +short
   # Должен вернуть: 185.179.191.27
   ```

3. **Откройте порты** в файрволе сервера:
   - 22 (SSH)
   - 80 (HTTP)
   - 443 (HTTPS)

---

## Полезные команды

```bash
# Просмотр логов приложения
docker-compose -f docker-compose.prod.yml logs -f

# Перезапуск приложения
docker-compose -f docker-compose.prod.yml restart

# Обновление приложения
cd /var/www/oktour
git pull  # или загрузите новые файлы
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps
systemctl status nginx
certbot certificates
```

---

## Решение проблем

### Контейнер не запускается
```bash
docker-compose -f docker-compose.prod.yml logs
```

### Nginx не работает
```bash
nginx -t
tail -f /var/log/nginx/error.log
```

### SSL не работает
```bash
certbot certificates
certbot renew --force-renewal
systemctl reload nginx
```

### Порт занят
```bash
netstat -tulpn | grep :3000
# Остановите процесс, который занимает порт
```

---

Подробная инструкция: см. `DEPLOY_SERVER.md`

