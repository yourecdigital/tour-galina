# Исправление проблемы с правами доступа при загрузке файлов

## Проблема

При загрузке изображений или видео появляется ошибка:
```
EACCES: permission denied, open '/app/public/uploads/photo/...'
```

Это означает, что пользователь `nextjs` в Docker контейнере не может писать в папку uploads.

## Решение

### 1. Исправьте права на папки на хосте:

```bash
# Перейдите в директорию проекта
cd /var/www/oktour

# Установите права 777 для всех папок с загрузками
chmod -R 777 public/uploads
chmod -R 777 public/kp

# Проверьте права
ls -ld public/uploads
# Должно быть: drwxrwxrwx (777)

ls -ld public/kp
# Должно быть: drwxrwxrwx (777)
```

### 2. Перезапустите контейнер:

```bash
# Перезапустите контейнер
docker-compose -f docker-compose.prod.yml restart

# Проверьте логи
docker logs tour-galina-app --tail=30
```

### 3. Проверьте работу:

Попробуйте загрузить файл через админ-панель. Ошибка должна исчезнуть.

## Почему это происходит?

Папки `public/uploads` и `public/kp` монтируются как volumes с хоста в Docker контейнер. Пользователь `nextjs` (uid 1001) в контейнере должен иметь права на запись в эти папки.

Права 777 позволяют всем пользователям (включая пользователя в контейнере) читать и писать в эти папки.

## Более безопасное решение (опционально)

Если хотите использовать более безопасные права (755), нужно изменить владельца папок на UID пользователя nextjs:

```bash
# Узнайте UID пользователя nextjs в контейнере
docker exec tour-galina-app id nextjs
# Обычно это uid=1001, gid=1001

# Измените владельца папок на этот UID
chown -R 1001:1001 /var/www/oktour/public/uploads
chown -R 1001:1001 /var/www/oktour/public/kp

# Установите права 755
chmod -R 755 /var/www/oktour/public/uploads
chmod -R 755 /var/www/oktour/public/kp

# Перезапустите контейнер
docker-compose -f docker-compose.prod.yml restart
```

Но для простоты и гарантии работы рекомендуется использовать права 777.

## Проверка после исправления

```bash
# Проверьте права
ls -ld /var/www/oktour/public/uploads
ls -ld /var/www/oktour/public/kp

# Попробуйте создать файл из контейнера (тест записи)
docker exec tour-galina-app touch /app/public/uploads/test.txt
docker exec tour-galina-app rm /app/public/uploads/test.txt

# Если команда выполнилась без ошибок - права настроены правильно
```








