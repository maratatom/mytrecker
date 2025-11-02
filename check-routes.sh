#!/bin/bash
# Скрипт для проверки наличия новых маршрутов на сервере

echo "=== Проверка маршрутов timeTracking.js ==="
echo ""
echo "Ищем PATCH маршруты:"
grep -n "router.patch" /home/appuser/personnel-tracking/server/routes/timeTracking.js || echo "❌ PATCH маршруты НЕ найдены!"

echo ""
echo "Ищем DELETE маршруты:"
grep -n "router.delete" /home/appuser/personnel-tracking/server/routes/timeTracking.js || echo "❌ DELETE маршруты НЕ найдены!"

echo ""
echo "=== Проверка маршрутов personnel.js ==="
echo ""
echo "Проверяем поиск (параметр q):"
grep -n "req.query" /home/appuser/personnel-tracking/server/routes/personnel.js || echo "❌ Поиск НЕ найден!"

echo ""
echo "Проверяем hard delete:"
grep -n "hard" /home/appuser/personnel-tracking/server/routes/personnel.js || echo "❌ Hard delete НЕ найден!"

echo ""
echo "=== Проверка завершена ==="


