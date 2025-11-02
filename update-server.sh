#!/bin/bash
# Скрипт для обновления сервера

echo "=== Обновление сервера personnel-tracking ==="

# Переходим в директорию сервера
cd server || exit 1

# Проверяем существование директории uploads
if [ ! -d "uploads" ]; then
    echo "Создаем директорию uploads..."
    mkdir -p uploads
    chmod 755 uploads
fi

# Устанавливаем зависимости (если нужно)
echo "Проверяем зависимости..."
npm install

# Перезапускаем PM2
echo "Перезапускаем сервер..."
pm2 restart personnel-tracking || pm2 restart all

echo "=== Сервер обновлен ==="
echo "Проверьте логи: pm2 logs personnel-tracking"
