#!/bin/bash

set -e

echo "🚀 Деплой house-admin (admin-doman-horizont.ru)"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd /opt/house-admin

# Проверка наличия docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose не установлен!${NC}"
    exit 1
fi

# Проверка сети backend
if ! docker network ls | grep -q "house-backend_backend-network"; then
    echo -e "${RED}❌ Сеть house-backend_backend-network не найдена!${NC}"
    echo -e "${YELLOW}Сначала запустите backend: cd /opt/house-backend && ./scripts/deploy.sh${NC}"
    exit 1
fi

# Сборка и запуск
echo -e "${YELLOW}Сборка и запуск контейнера...${NC}"
docker-compose -f docker-compose.prod.yml up -d --build

# Проверка статуса
echo -e "\n${YELLOW}Статус контейнеров:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "\n${GREEN}✅ Деплой завершен!${NC}"
echo -e "${GREEN}Admin доступен на:${NC}"
echo -e "  - http://95.163.226.62:8081"
echo -e "  - https://95.163.226.62:8444"
echo -e "  - http://admin-doman-horizont.ru:8081"
echo -e "  - https://admin-doman-horizont.ru:8444"

