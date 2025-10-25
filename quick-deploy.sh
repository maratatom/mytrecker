#!/bin/bash

# Быстрый скрипт развертывания Personnel Tracker
# Использование: bash quick-deploy.sh your-domain.com

DOMAIN=${1:-"localhost"}

echo "🚀 Быстрое развертывание Personnel Tracker на $DOMAIN"

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с правами root: sudo bash quick-deploy.sh"
    exit 1
fi

# 1. Обновление системы
echo "📦 Обновление системы..."
apt update && apt upgrade -y

# 2. Установка пакетов
echo "📦 Установка пакетов..."
apt install -y curl wget git nginx ufw fail2ban

# 3. Установка Node.js
echo "📦 Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 4. Установка MongoDB
echo "📦 Установка MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# 5. Настройка файрвола
echo "🔒 Настройка файрвола..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# 6. Установка PM2
echo "📦 Установка PM2..."
npm install -g pm2

# 7. Создание пользователя
echo "👤 Создание пользователя..."
useradd -m -s /bin/bash appuser 2>/dev/null || true
usermod -aG sudo appuser

# 8. Клонирование и настройка приложения
echo "📱 Настройка приложения..."
cd /home/appuser
sudo -u appuser git clone https://github.com/maratatom/mytrecker.git personnel-tracking
cd personnel-tracking

# Настройка сервера
cd server
sudo -u appuser npm install --production
sudo -u appuser mkdir -p uploads
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/personnel_tracking
NODE_ENV=production
EOF

# Сборка клиента
cd ../client
sudo -u appuser npm install
sudo -u appuser npm run build

# 9. Настройка PM2
echo "⚙️ Настройка PM2..."
cd ../server
sudo -u appuser cat > ecosystem.config.js << EOF
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
    }
  }]
};
EOF

sudo -u appuser pm2 start ecosystem.config.js
sudo -u appuser pm2 save
sudo -u appuser pm2 startup

# 10. Настройка Nginx
echo "🌐 Настройка Nginx..."
cat > /etc/nginx/sites-available/personnel-tracking << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        root /home/appuser/personnel-tracking/client/build;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /uploads {
        alias /home/appuser/personnel-tracking/server/uploads;
    }
}
EOF

ln -sf /etc/nginx/sites-available/personnel-tracking /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 11. Настройка SSL (если домен не localhost)
if [ "$DOMAIN" != "localhost" ]; then
    echo "🔒 Настройка SSL..."
    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

echo ""
echo "✅ Развертывание завершено!"
echo ""
echo "🌐 Приложение доступно по адресу:"
if [ "$DOMAIN" != "localhost" ]; then
    echo "   https://$DOMAIN"
else
    echo "   http://$(curl -s ifconfig.me)"
fi
echo ""
echo "🔑 Пароль для входа: 123098"
echo ""
echo "📊 Полезные команды:"
echo "   pm2 status                    # Статус приложения"
echo "   pm2 logs personnel-tracking   # Логи приложения"
echo "   sudo systemctl status nginx   # Статус Nginx"
echo "   sudo systemctl status mongod  # Статус MongoDB"
echo ""
echo "🔄 Обновление приложения:"
echo "   cd /home/appuser/personnel-tracking"
echo "   git pull origin main"
echo "   cd client && npm run build"
echo "   cd ../server && pm2 restart personnel-tracking"
