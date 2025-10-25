const express = require('express');
const router = express.Router();

// Простая аутентификация по паролю
const ADMIN_PASSWORD = '123098';

// Проверка пароля
router.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    res.json({ 
      success: true, 
      message: 'Успешная авторизация',
      token: 'admin-token' // В реальном приложении здесь был бы JWT токен
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Неверный пароль' 
    });
  }
});

// Проверка токена (для защищенных маршрутов)
router.get('/verify', (req, res) => {
  const token = req.headers.authorization;
  
  if (token === 'Bearer admin-token') {
    res.json({ success: true, message: 'Токен действителен' });
  } else {
    res.status(401).json({ success: false, message: 'Недействительный токен' });
  }
});

module.exports = router;
