const express = require('express');
const multer = require('multer');
const path = require('path');
const Personnel = require('../models/Personnel');
const fs = require('fs');

const router = express.Router();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'personnel-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  }
});

// Получить всех сотрудников
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = { isActive: true };
    if (q && typeof q === 'string' && q.trim() !== '') {
      const rx = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: rx },
        { position: rx },
        { description: rx },
      ];
    }
    const personnel = await Personnel.find(filter).sort({ name: 1 });
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка персонала', error: error.message });
  }
});

// Получить сотрудника по ID
router.get('/:id', async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    if (!personnel) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении сотрудника', error: error.message });
  }
});

// Создать нового сотрудника
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, position, description } = req.body;
    
    const personnel = new Personnel({
      name,
      position,
      description,
      photo: req.file ? req.file.filename : null
    });
    
    await personnel.save();
    res.status(201).json(personnel);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании сотрудника', error: error.message });
  }
});

// Обновить сотрудника
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { name, position, description } = req.body;
    const updateData = { name, position, description };
    
    if (req.file) {
      updateData.photo = req.file.filename;
    }
    
    const personnel = await Personnel.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!personnel) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }
    
    res.json(personnel);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении сотрудника', error: error.message });
  }
});

// Удалить сотрудника (мягкое удаление)
router.delete('/:id', async (req, res) => {
  try {
    const { hard } = req.query;
    if (hard === 'true') {
      const toDelete = await Personnel.findById(req.params.id);
      if (!toDelete) return res.status(404).json({ message: 'Сотрудник не найден' });
      // Удаляем фото с диска, если есть
      if (toDelete.photo) {
        const p = path.join(process.cwd(), 'server', 'uploads', toDelete.photo);
        fs.promises.unlink(p).catch(() => {});
      }
      await Personnel.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Сотрудник удален окончательно' });
    } else {
      const personnel = await Personnel.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      if (!personnel) {
        return res.status(404).json({ message: 'Сотрудник не найден' });
      }
      return res.json({ message: 'Сотрудник помечен как удаленный' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении сотрудника', error: error.message });
  }
});

module.exports = router;
