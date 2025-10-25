#!/bin/bash

# Скрипт развертывания Personnel Tracker на VPS Debian 12
# Запустите: bash deploy-script.sh

set -e  # Остановка при ошибке

echo "🚀 Начинаем развертывание Personnel Tracker..."

# 1. Обновление системы
echo "📦 Обновление системы..."
apt update && apt upgrade -y

# 2. Установка необходимых пакетов
echo "📦 Установка базовых пакетов..."
apt install -y curl wget git nginx ufw fail2ban htop

# 3. Установка Node.js 18 LTS
echo "📦 Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Проверка установки
echo "✅ Node.js версия: $(node --version)"
echo "✅ npm версия: $(npm --version)"

# 4. Установка MongoDB
echo "📦 Установка MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Запуск и автозапуск MongoDB
systemctl start mongod
systemctl enable mongod

echo "✅ MongoDB установлен и запущен"

# 5. Настройка файрвола
echo "🔒 Настройка файрвола..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000
ufw --force enable

echo "✅ Файрвол настроен"

# 6. Установка PM2
echo "📦 Установка PM2..."
npm install -g pm2

# 7. Создание пользователя для приложения
echo "👤 Создание пользователя приложения..."
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser

# 8. Создание директории приложения
echo "📁 Создание директории приложения..."
mkdir -p /var/www/personnel-tracking
chown -R appuser:appuser /var/www/personnel-tracking

echo "✅ Базовая настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Переключитесь на пользователя appuser: su - appuser"
echo "2. Клонируйте репозиторий: git clone https://github.com/maratatom/mytrecker.git"
echo "3. Настройте приложение согласно инструкциям"
echo ""
echo "🔗 Полезные команды:"
echo "- Проверка статуса MongoDB: sudo systemctl status mongod"
echo "- Проверка статуса Nginx: sudo systemctl status nginx"
echo "- Просмотр логов: sudo journalctl -f"
