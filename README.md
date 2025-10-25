# Система учета персонала

Веб-приложение для учета времени прибытия и убытия персонала с возможностью добавления новых сотрудников и просмотра отчетов.

## Функциональность

- 🔐 **Аутентификация**: Вход по паролю (123098)
- 👥 **Управление персоналом**: Добавление, редактирование, просмотр сотрудников
- 📸 **Фотографии**: Загрузка и отображение фотографий сотрудников
- ⏰ **Учет времени**: Отметка прибытия/убытия с замечаниями
- 📊 **Отчеты**: Ежедневные отчеты с экспортом в CSV
- 📱 **Адаптивный дизайн**: Работает на всех устройствах

## Структура проекта

```
MyohrProject/
├── client/          # React приложение (фронтенд)
├── server/          # Node.js сервер (бэкенд)
└── README.md
```

## Локальная разработка

### Предварительные требования

- Node.js (версия 16 или выше)
- MongoDB
- npm или yarn

### Установка и запуск

1. **Клонирование и установка зависимостей:**
```bash
# Установка зависимостей для сервера
cd server
npm install

# Установка зависимостей для клиента
cd ../client
npm install
```

2. **Запуск MongoDB:**
```bash
# Убедитесь, что MongoDB запущена
mongod
```

3. **Запуск сервера:**
```bash
cd server
npm start
# или для разработки с автоперезагрузкой:
npm run dev
```

4. **Запуск клиента:**
```bash
cd client
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

## Развертывание на VPS (Debian 12)

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Запуск MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Установка Nginx
sudo apt install nginx -y

# Установка PM2 для управления процессами
sudo npm install -g pm2
```

### 2. Настройка файрвола

```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw enable
```

### 3. Загрузка приложения

```bash
# Создание директории для приложения
sudo mkdir -p /var/www/personnel-tracking
sudo chown -R $USER:$USER /var/www/personnel-tracking

# Копирование файлов (замените на ваш способ загрузки)
# Например, через git:
git clone <your-repo-url> /var/www/personnel-tracking
```

### 4. Настройка сервера

```bash
cd /var/www/personnel-tracking/server

# Установка зависимостей
npm install --production

# Создание .env файла
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/personnel_tracking
NODE_ENV=production
EOF

# Создание папки для загрузок
mkdir -p uploads
```

### 5. Сборка клиента

```bash
cd /var/www/personnel-tracking/client

# Установка зависимостей
npm install

# Сборка для продакшена
npm run build
```

### 6. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/personnel-tracking
```

Содержимое файла:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Замените на ваш домен

    # Статические файлы клиента
    location / {
        root /var/www/personnel-tracking/client/build;
        try_files $uri $uri/ /index.html;
    }

    # API сервера
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Загрузки
    location /uploads {
        alias /var/www/personnel-tracking/server/uploads;
    }
}
```

Активация конфигурации:
```bash
sudo ln -s /etc/nginx/sites-available/personnel-tracking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Настройка SSL (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com
```

### 8. Запуск приложения

```bash
cd /var/www/personnel-tracking/server

# Создание PM2 конфигурации
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'personnel-tracking',
    script: 'index.js',
    cwd: '/var/www/personnel-tracking/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF

# Запуск приложения
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 9. Автоматическое обновление (опционально)

Создайте скрипт для обновления:
```bash
cat > /var/www/personnel-tracking/update.sh << EOF
#!/bin/bash
cd /var/www/personnel-tracking
git pull origin main
cd client
npm run build
cd ../server
pm2 restart personnel-tracking
EOF

chmod +x /var/www/personnel-tracking/update.sh
```

## Использование

1. Откройте приложение в браузере
2. Введите пароль: `123098`
3. Используйте функции:
   - **Главная страница**: Выбор сотрудника для отметки времени
   - **Добавить сотрудника**: Создание нового профиля
   - **Учет времени**: Отметка прибытия/убытия
   - **Отчеты**: Просмотр и экспорт данных

## API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/verify` - Проверка токена

### Персонал
- `GET /api/personnel` - Получить список сотрудников
- `POST /api/personnel` - Создать сотрудника
- `PUT /api/personnel/:id` - Обновить сотрудника
- `DELETE /api/personnel/:id` - Удалить сотрудника

### Учет времени
- `POST /api/time-tracking/arrival` - Отметить прибытие
- `POST /api/time-tracking/departure` - Отметить убытие
- `GET /api/time-tracking/today` - Записи за сегодня
- `GET /api/time-tracking/date/:date` - Записи за дату

## Технологии

**Frontend:**
- React 18
- TypeScript
- Material-UI
- React Router
- Axios

**Backend:**
- Node.js
- Express
- MongoDB
- Multer (загрузка файлов)
- CORS

**DevOps:**
- Nginx
- PM2
- Let's Encrypt SSL
- MongoDB

## Безопасность

- Пароль хранится в коде (для демо). В продакшене используйте хеширование
- CORS настроен для локальной разработки
- Загрузка файлов ограничена изображениями
- SSL сертификат для HTTPS

## Поддержка

При возникновении проблем проверьте:
1. Логи PM2: `pm2 logs personnel-tracking`
2. Статус Nginx: `sudo systemctl status nginx`
3. Статус MongoDB: `sudo systemctl status mongod`
4. Логи Nginx: `sudo tail -f /var/log/nginx/error.log`
