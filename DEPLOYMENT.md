# Инструкция по развертыванию на VPS

## Обновление кода на сервере

### 1. Подключитесь к серверу по SSH
```bash
ssh user@ohr.naguman.ru
```

### 2. Перейдите в директорию проекта
```bash
cd /home/appuser/personnel-tracking  # или путь, где находится проект
# или
cd ~/personnel-tracking
```

### 3. Обновите код из репозитория (если используете Git)
```bash
git pull origin main
```

### 4. Или обновите файлы вручную
Скопируйте следующие файлы на сервер:

**server/routes/timeTracking.js** - должен содержать:
- `PATCH /:id/remarks` - обновление замечаний
- `PATCH /:id` - обновление времени прибытия/убытия и замечаний
- `DELETE /:id` - удаление записи

**server/routes/personnel.js** - должен содержать:
- `GET /` с поддержкой параметра `q` для поиска
- `DELETE /:id` с поддержкой `?hard=true` для полного удаления

**client/build/** - собранная версия фронтенда (после `npm run build`)

### 5. Установите зависимости (если нужно)
```bash
cd server
npm install
```

### 6. Убедитесь, что директория uploads существует
```bash
cd server
mkdir -p uploads
chmod 755 uploads
```

### 7. Перезапустите сервер через PM2
```bash
cd server
pm2 restart personnel-tracking
# или
pm2 restart all
```

### 8. Проверьте логи
```bash
pm2 logs personnel-tracking
# или
pm2 logs
```

### 9. Проверьте, что сервер работает
```bash
curl http://localhost:5000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"password":"123098"}'
```

### 10. Пересоберите фронтенд (если нужно)
На локальной машине:
```bash
cd client
npm run build
```

Затем загрузите содержимое `client/build/` на сервер в директорию, которую обслуживает Nginx (обычно `/var/www/html` или `/home/appuser/personnel-tracking/client/build`).

### 11. Перезапустите Nginx
```bash
sudo nginx -t  # Проверка конфигурации
sudo systemctl reload nginx
```

## Проверка работоспособности

1. Проверьте API: `curl http://localhost:5000/api/personnel`
2. Проверьте фронтенд: откройте `https://ohr.naguman.ru` в браузере
3. Проверьте логи: `pm2 logs`

## Возможные проблемы

### Проблема: Новые маршруты не работают
**Решение:** Убедитесь, что файлы `server/routes/timeTracking.js` и `server/routes/personnel.js` обновлены и сервер перезапущен.

### Проблема: Ошибки при удалении файлов
**Решение:** Проверьте права доступа к директории `uploads/`:
```bash
chmod 755 server/uploads
chown -R appuser:appuser server/uploads
```

### Проблема: Фронтенд не обновился
**Решение:** 
1. Убедитесь, что вы пересобрали фронтенд: `cd client && npm run build`
2. Проверьте, что Nginx обслуживает правильную директорию
3. Очистите кэш браузера (Ctrl+Shift+R)


