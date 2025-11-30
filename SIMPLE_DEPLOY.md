# Простая инструкция по развертыванию

## Что было исправлено:

1. ✅ `docker-compose.prod.yml` - изменен `expose` на `ports` для публикации порта 3000
2. ✅ Права доступа к папке `data` - добавлена инструкция по установке прав 777
3. ✅ Создана простая пошаговая инструкция

## Инструкция для сервера:

### 1. Удалите старое и клонируйте заново:

```bash
ssh root@185.179.191.27
cd /var/www
rm -rf oktour
git clone <ваш-репозиторий> oktour
cd oktour
```

### 2. Создайте папки и установите права (ВАЖНО!):

```bash
mkdir -p data public/uploads/photo public/uploads/video public/kp
chmod -R 777 data
chmod -R 777 public/uploads public/kp
```

### 3. Создайте .env файл:

```bash
cat > .env << 'EOF'
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8304880903:AAHxEr9U4Ca6E0E-IGxyVMzDL56qocRihWg
TELEGRAM_CHAT_ID=-1003143468391
EOF
```

### 4. Настройте Nginx:

```bash
# Установите Nginx (если не установлен)
apt install -y nginx

# Скопируйте конфигурацию
cp nginx.conf /etc/nginx/sites-available/oktour.travel
ln -sf /etc/nginx/sites-available/oktour.travel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверьте и запустите
nginx -t
systemctl start nginx
systemctl enable nginx
```

### 5. Остановите старые контейнеры:

```bash
# Остановите все контейнеры
docker stop $(docker ps -q) 2>/dev/null || true
```

### 6. Запустите приложение:

```bash
# Соберите и запустите
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Проверьте логи
docker logs tour-galina-app --tail=30
```

### 7. Проверьте работу:

```bash
# Должно работать без ошибок SQLITE_CANTOPEN
curl http://localhost:3000
curl http://localhost:3000/api/tours/
```

## Ключевые моменты:

1. **Права на папку data:** `chmod -R 777 data` - это критически важно!
2. **Порт 3000:** Теперь публикуется в docker-compose.prod.yml
3. **Nginx:** Работает на хосте и проксирует на localhost:3000

## Если что-то не работает:

1. Проверьте права: `ls -ld data` (должно быть drwxrwxrwx)
2. Проверьте логи: `docker logs tour-galina-app --tail=50`
3. Проверьте порт: `ss -tulpn | grep :3000`
4. Перезапустите: `docker-compose -f docker-compose.prod.yml restart`

---

**Полная инструкция:** См. `DEPLOY_INSTRUCTIONS.md`

