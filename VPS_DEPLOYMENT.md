# 🚀 Развертывание Personnel Tracker на VPS Debian 12

## 📋 Предварительные требования

- VPS сервер с Debian 12
- Root доступ к серверу
- Домен (опционально, для SSL)
- Минимум 1GB RAM, 20GB диска

## 🔧 Шаг 1: Подготовка сервера

### Подключение к серверу:
```bash
ssh root@your-server-ip
```

### Запуск скрипта автоматической настройки:
```bash
# Скачайте и запустите скрипт
wget https://raw.githubusercontent.com/maratatom/mytrecker/main/deploy-script.sh
chmod +x deploy-script.sh
bash deploy-script.sh
```

### Или ручная настройка:

```bash
# 1. Обновление системы
apt update && apt upgrade -y

# 2. Установка базовых пакетов
apt install -y curl wget git nginx ufw fail2ban htop

# 3. Установка Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 4. Установка MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Запуск MongoDB
systemctl start mongod
systemctl enable mongod

# 5. Настройка файрвола
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000
ufw --force enable

# 6. Установка PM2
npm install -g pm2

# 7. Создание пользователя
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser
```

## 📱 Шаг 2: Загрузка и настройка приложения

### Переключение на пользователя приложения:
```bash
su - appuser
```

### Клонирование репозитория:
```bash
cd /home/appuser
git clone https://github.com/maratatom/mytrecker.git personnel-tracking
cd personnel-tracking
```

### Настройка серверной части:
```bash
cd server

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
chmod 755 uploads
```

### Сборка клиентской части:
```bash
cd ../client

# Установка зависимостей
npm install

# Сборка для продакшена
npm run build
```

## 🔧 Шаг 3: Настройка PM2

### Создание конфигурации PM2:
```bash
cd /home/appuser/personnel-tracking/server

cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'personnel-tracking',
    script: 'index.js',
    cwd: '/home/appuser/personnel-tracking/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/home/appuser/personnel-tracking/logs/err.log',
    out_file: '/home/appuser/personnel-tracking/logs/out.log',
    log_file: '/home/appuser/personnel-tracking/logs/combined.log',
    time: true
  }]
};
EOF

# Создание папки для логов
mkdir -p /home/appuser/personnel-tracking/logs

# Запуск приложения
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Шаг 4: Настройка Nginx

### Создание конфигурации Nginx:
```bash
sudo nano /etc/nginx/sites-available/personnel-tracking
```

### Содержимое конфигурации:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Замените на ваш домен или IP

    # Статические файлы клиента
    location / {
        root /home/appuser/personnel-tracking/client/build;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
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
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Загрузки
    location /uploads {
        alias /home/appuser/personnel-tracking/server/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### Активация конфигурации:
```bash
# Активация сайта
sudo ln -s /etc/nginx/sites-available/personnel-tracking /etc/nginx/sites-enabled/

# Удаление дефолтного сайта
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезагрузка Nginx
sudo systemctl reload nginx
```

## 🔒 Шаг 5: Настройка SSL (Let's Encrypt)

### Установка Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Получение SSL сертификата:
```bash
# Замените your-domain.com на ваш домен
sudo certbot --nginx -d your-domain.com
```

### Автоматическое обновление сертификата:
```bash
# Добавление в crontab
sudo crontab -e

# Добавьте строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Шаг 6: Настройка автозапуска

### Создание systemd сервиса:
```bash
sudo nano /etc/systemd/system/personnel-tracking.service
```

### Содержимое сервиса:
```ini
[Unit]
Description=Personnel Tracking App
After=network.target

[Service]
Type=forking
User=appuser
WorkingDirectory=/home/appuser/personnel-tracking/server
ExecStart=/usr/bin/pm2 start ecosystem.config.js
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill

[Install]
WantedBy=multi-user.target
```

### Активация сервиса:
```bash
sudo systemctl daemon-reload
sudo systemctl enable personnel-tracking
sudo systemctl start personnel-tracking
```

## 📊 Шаг 7: Мониторинг и логи

### Полезные команды:
```bash
# Статус приложения
pm2 status
pm2 logs personnel-tracking

# Статус сервисов
sudo systemctl status nginx
sudo systemctl status mongod
sudo systemctl status personnel-tracking

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Логи MongoDB
sudo tail -f /var/log/mongodb/mongod.log

# Мониторинг ресурсов
htop
pm2 monit
```

## 🔄 Шаг 8: Обновление приложения

### Создание скрипта обновления:
```bash
cat > /home/appuser/update-app.sh << EOF
#!/bin/bash
cd /home/appuser/personnel-tracking
git pull origin main
cd client
npm run build
cd ../server
pm2 restart personnel-tracking
echo "Приложение обновлено!"
EOF

chmod +x /home/appuser/update-app.sh
```

### Использование:
```bash
# Обновление приложения
/home/appuser/update-app.sh
```

## 🧪 Шаг 9: Тестирование

### Проверка работы:
1. **Откройте браузер** и перейдите на `http://your-server-ip`
2. **Введите пароль:** `123098`
3. **Проверьте функции:**
   - Добавление персонала
   - Отметка времени
   - Просмотр отчетов

### Проверка API:
```bash
# Тест API
curl http://localhost:5000/api/personnel
curl http://localhost:5000/api/time-tracking/today
```

## 🛠️ Устранение проблем

### Частые проблемы:

1. **"Permission denied"**
   ```bash
   sudo chown -R appuser:appuser /home/appuser/personnel-tracking
   ```

2. **"Port already in use"**
   ```bash
   sudo netstat -tulpn | grep :5000
   sudo kill -9 PID
   ```

3. **"MongoDB connection failed"**
   ```bash
   sudo systemctl restart mongod
   sudo systemctl status mongod
   ```

4. **"Nginx configuration error"**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **"PM2 not found"**
   ```bash
   npm install -g pm2
   pm2 startup
   ```

## 📋 Чек-лист развертывания

- [ ] Сервер обновлен и настроен
- [ ] Node.js и MongoDB установлены
- [ ] Файрвол настроен
- [ ] Приложение загружено и настроено
- [ ] PM2 настроен и запущен
- [ ] Nginx настроен и работает
- [ ] SSL сертификат установлен (если есть домен)
- [ ] Автозапуск настроен
- [ ] Мониторинг настроен
- [ ] Приложение протестировано

## 🎯 Результат

После выполнения всех шагов у вас будет:
- ✅ **Веб-приложение** доступно по адресу вашего сервера
- ✅ **API сервер** работает на порту 5000
- ✅ **База данных** MongoDB настроена
- ✅ **SSL сертификат** (если настроен домен)
- ✅ **Автозапуск** при перезагрузке сервера
- ✅ **Мониторинг** и логи

Приложение готово к использованию! 🚀
