# Чеклист обновления сервера

## Файлы, которые нужно обновить на сервере

### 1. server/routes/timeTracking.js
Должен содержать следующие маршруты:
- ✅ `POST /arrival` - отметка прибытия
- ✅ `POST /departure` - отметка убытия  
- ✅ `GET /today` - записи за сегодня
- ✅ `GET /date/:date` - записи за дату
- ✅ `GET /personnel/:personnelId` - записи сотрудника
- ✅ `PATCH /:id/remarks` - обновление замечаний (НОВЫЙ)
- ✅ `PATCH /:id` - обновление времени прибытия/убытия и замечаний (НОВЫЙ)
- ✅ `DELETE /:id` - удаление записи (НОВЫЙ)

### 2. server/routes/personnel.js
Должен содержать:
- ✅ `GET /` с параметром `q` для поиска (НОВОЕ)
- ✅ `GET /:id` - получение сотрудника по ID
- ✅ `POST /` - создание сотрудника
- ✅ `PUT /:id` - обновление сотрудника
- ✅ `DELETE /:id` с поддержкой `?hard=true` для полного удаления (НОВОЕ)

### 3. server/index.js
Должен корректно подключать маршруты и обслуживать статические файлы.

## Быстрая проверка на сервере

Выполните на сервере:

```bash
# Проверить наличие новых маршрутов в timeTracking.js
grep -n "router.patch\|router.delete" server/routes/timeTracking.js

# Должно показать строки с PATCH и DELETE маршрутами

# Проверить поиск в personnel.js
grep -n "req.query" server/routes/personnel.js

# Должно показать строку с параметром q
```

## Инструкция по обновлению

### Вариант 1: Через Git (если используете)
```bash
ssh user@ohr.naguman.ru
cd /path/to/personnel-tracking
git pull origin main
cd server
npm install
pm2 restart personnel-tracking
pm2 logs personnel-tracking
```

### Вариант 2: Ручное обновление файлов

1. **Скопируйте файлы на сервер:**
   - `server/routes/timeTracking.js`
   - `server/routes/personnel.js`

2. **На сервере:**
   ```bash
   cd /path/to/personnel-tracking/server
   # Убедитесь, что директория uploads существует
   mkdir -p uploads
   chmod 755 uploads
   
   # Перезапустите сервер
   pm2 restart personnel-tracking
   
   # Проверьте логи
   pm2 logs personnel-tracking
   ```

### Вариант 3: Используя скрипт update-server.sh
```bash
chmod +x update-server.sh
./update-server.sh
```

## Проверка работоспособности

После обновления проверьте:

```bash
# 1. Проверьте API поиска
curl "http://localhost:5000/api/personnel?q=test"

# 2. Проверьте PATCH для записей времени (замените ID)
curl -X PATCH http://localhost:5000/api/time-tracking/YOUR_RECORD_ID \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Тест"}'

# 3. Проверьте DELETE для записей времени
curl -X DELETE http://localhost:5000/api/time-tracking/YOUR_RECORD_ID
```

## Важно!

После обновления сервера также обновите фронтенд:
```bash
# На локальной машине
cd client
npm run build

# Затем загрузите client/build/ на сервер
```


