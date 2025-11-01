#!/bin/bash

# Скрипт обновления приложения на сервере
# Использование: 
#   1. Загрузите на сервер: scp update-server.sh appuser@your-server:/home/appuser/
#   2. Подключитесь к серверу: ssh appuser@your-server
#   3. Запустите: bash update-server.sh

set -e  # Остановка при ошибке

echo "🔄 Начинаем обновление приложения..."

# Переход в директорию приложения
cd /home/appuser/personnel-tracking

# 1. Получение последних изменений из git
echo "📥 Получение изменений из git..."
git pull origin main

# 2. Установка зависимостей сервера
echo "📦 Установка зависимостей сервера..."
cd server
npm install --production

# 3. Установка зависимостей клиента и сборка
echo "📦 Установка зависимостей клиента..."
cd ../client
npm install

echo "🔨 Сборка клиентского приложения..."
npm run build

# 4. Перезапуск приложения через PM2
echo "♻️ Перезапуск приложения..."
cd ../server
pm2 restart personnel-tracking

# 5. Проверка статуса
echo ""
echo "✅ Обновление завершено!"
echo ""
echo "📊 Статус приложения:"
pm2 status personnel-tracking

echo ""
echo "📋 Последние логи (для проверки):"
pm2 logs personnel-tracking --lines 10 --nostream

