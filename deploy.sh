#!/bin/bash

# Скрипт для автоматического развертывания на сервере

set -e

echo "🚀 Начало развертывания Oktour..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Пожалуйста, запустите скрипт с правами root (sudo)${NC}"
    exit 1
fi

# Переменные
PROJECT_DIR="/var/www/oktour"
DOMAIN="oktour.travel"

echo -e "${YELLOW}📦 Шаг 1: Установка зависимостей...${NC}"

# Обновление системы
apt update && apt upgrade -y

# Установка Docker (если не установлен)
if ! command -v docker &> /dev/null; then
    echo "Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Установка Docker Compose
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
fi

# Установка Nginx
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
fi

# Установка Certbot
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
fi

echo -e "${GREEN}✓ Зависимости установлены${NC}"

echo -e "${YELLOW}📁 Шаг 2: Создание директории проекта...${NC}"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

echo -e "${GREEN}✓ Директория создана${NC}"

echo -e "${YELLOW}🔧 Шаг 3: Настройка Docker...${NC}"

# Проверка наличия docker-compose.prod.yml
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}Ошибка: файл docker-compose.prod.yml не найден${NC}"
    echo "Пожалуйста, скопируйте файлы проекта в $PROJECT_DIR"
    exit 1
fi

# Создание .env файла, если его нет
if [ ! -f ".env" ]; then
    echo "Создание .env файла..."
    cat > .env << EOF
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8304880903:AAHxEr9U4Ca6E0E-IGxyVMzDL56qocRihWg
TELEGRAM_CHAT_ID=-1003143468391
EOF
    echo -e "${YELLOW}⚠️  Не забудьте обновить TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env${NC}"
fi

# Создание необходимых директорий
mkdir -p data public/uploads/photo public/uploads/video public/kp

# Установка правильных прав доступа (важно для базы данных!)
chmod -R 777 data
chmod -R 755 public/uploads public/kp
chown -R $USER:$USER public/uploads public/kp 2>/dev/null || true

# Сборка образа
echo "Сборка Docker образа..."
docker-compose -f docker-compose.prod.yml build

echo -e "${GREEN}✓ Docker настроен${NC}"

echo -e "${YELLOW}🌐 Шаг 4: Настройка Nginx...${NC}"

# Копирование конфигурации Nginx
if [ -f "nginx.conf" ]; then
    cp nginx.conf /etc/nginx/sites-available/$DOMAIN
    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    
    # Удаляем дефолтную конфигурацию
    rm -f /etc/nginx/sites-enabled/default
    
    # Проверка конфигурации
    nginx -t
    
    # Перезагрузка Nginx
    systemctl reload nginx
    
    echo -e "${GREEN}✓ Nginx настроен${NC}"
else
    echo -e "${YELLOW}⚠️  Файл nginx.conf не найден, пропускаем настройку Nginx${NC}"
fi

echo -e "${YELLOW}🔒 Шаг 5: Настройка SSL...${NC}"

# Проверка DNS
echo "Проверка DNS записи для $DOMAIN..."
IP=$(dig +short $DOMAIN | tail -n1)
SERVER_IP=$(curl -s ifconfig.me)

if [ "$IP" != "185.179.191.27" ] && [ "$IP" != "$SERVER_IP" ]; then
    echo -e "${YELLOW}⚠️  Предупреждение: DNS запись может быть не настроена правильно${NC}"
    echo "   Ожидаемый IP: 185.179.191.27"
    echo "   Текущий IP домена: $IP"
    read -p "Продолжить? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Получение SSL сертификата
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "Получение SSL сертификата..."
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || {
        echo -e "${RED}Ошибка при получении SSL сертификата${NC}"
        echo "Убедитесь, что:"
        echo "1. Домен указывает на IP сервера (185.179.191.27)"
        echo "2. Порты 80 и 443 открыты в файрволе"
        exit 1
    }
else
    echo "SSL сертификат уже существует"
    certbot renew --dry-run
fi

echo -e "${GREEN}✓ SSL настроен${NC}"

echo -e "${YELLOW}🚀 Шаг 6: Запуск приложения...${NC}"

# Запуск контейнера
docker-compose -f docker-compose.prod.yml up -d

# Ожидание запуска
sleep 5

# Проверка статуса
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Приложение запущено${NC}"
else
    echo -e "${RED}✗ Ошибка при запуске приложения${NC}"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

echo -e "${YELLOW}🔥 Шаг 7: Настройка файрвола...${NC}"

# Установка UFW
if ! command -v ufw &> /dev/null; then
    apt install ufw -y
fi

# Настройка правил
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Включение файрвола (если еще не включен)
if ! ufw status | grep -q "Status: active"; then
    echo "y" | ufw enable
fi

echo -e "${GREEN}✓ Файрвол настроен${NC}"

echo -e "${GREEN}✅ Развертывание завершено!${NC}"
echo ""
echo "🌐 Приложение доступно по адресу: https://$DOMAIN"
echo ""
echo "📋 Полезные команды:"
echo "   Просмотр логов: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Перезапуск: docker-compose -f docker-compose.prod.yml restart"
echo "   Остановка: docker-compose -f docker-compose.prod.yml down"
echo "   Статус: docker-compose -f docker-compose.prod.yml ps"
echo ""


