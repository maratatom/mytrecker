const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы для загрузки фотографий
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/personnel_tracking')
.then(() => console.log('MongoDB подключена'))
.catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const personnelRoutes = require('./routes/personnel');
const timeTrackingRoutes = require('./routes/timeTracking');

// Использование маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/time-tracking', timeTrackingRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({ message: 'API для учета персонала работает!' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
