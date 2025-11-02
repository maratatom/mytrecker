# Быстрое обновление сервера

## Что нужно обновить на сервере ohr.naguman.ru

### 1. Обновить файлы на сервере

**Вариант А: Через SCP (с локальной машины Windows)**
```powershell
# Скопируйте обновленные файлы на сервер
scp server\routes\timeTracking.js user@ohr.naguman.ru:/path/to/personnel-tracking/server/routes/
scp server\routes\personnel.js user@ohr.naguman.ru:/path/to/personnel-tracking/server/routes/
```

**Вариант Б: Через SSH (на сервере)**
```bash
# Подключитесь к серверу
ssh user@ohr.naguman.ru

# Перейдите в директорию проекта
cd ~/personnel-tracking  # или ваш путь

# Если используете Git:
git pull origin main

# Или отредактируйте файлы напрямую через nano/vim
```

### 2. На сервере: обновите код и перезапустите

```bash
# Перейдите в директорию сервера
cd /path/to/personnel-tracking/server

# Убедитесь, что директория uploads существует
mkdir -p uploads
chmod 755 uploads

# Установите зависимости (если нужно)
npm install

# Перезапустите PM2
pm2 restart personnel-tracking

# Или если процесс называется иначе:
pm2 restart all

# Проверьте логи
pm2 logs personnel-tracking --lines 50
```

### 3. Проверьте, что все работает

```bash
# Проверка поиска (замените "test" на любой текст)
curl "http://localhost:5000/api/personnel?q=test"

# Должен вернуть JSON с результатами поиска
```

### 4. Обновите фронтенд (если нужно)

**На локальной машине:**
```powershell
cd client
npm run build
```

**Затем загрузите build на сервер:**
```powershell
# Создайте архив
Compress-Archive -Path client\build\* -DestinationPath build.zip

# Загрузите на сервер
scp build.zip user@ohr.naguman.ru:/tmp/

# На сервере распакуйте в нужную директорию
# (обычно /var/www/html или где настроен Nginx)
```

---

## Что было добавлено:

✅ **Поиск персонала** - параметр `q` в `GET /api/personnel?q=...`

✅ **Редактирование записей времени** - `PATCH /api/time-tracking/:id`

✅ **Удаление записей времени** - `DELETE /api/time-tracking/:id`

✅ **Полное удаление персонала** - `DELETE /api/personnel/:id?hard=true`

---

## Если что-то не работает:

1. Проверьте логи: `pm2 logs personnel-tracking`
2. Проверьте, что файлы обновлены: `grep "router.patch" server/routes/timeTracking.js`
3. Перезапустите сервер: `pm2 restart all`
4. Проверьте Nginx: `sudo nginx -t && sudo systemctl reload nginx`


