const express = require('express');
const TimeRecord = require('../models/TimeRecord');
const Personnel = require('../models/Personnel');

const router = express.Router();

// Отметить прибытие
router.post('/arrival', async (req, res) => {
  try {
    const { personnelId, remarks } = req.body;
    
    // Проверяем, существует ли сотрудник
    const personnel = await Personnel.findById(personnelId);
    if (!personnel) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }
    
    // Получаем или создаем запись на сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let timeRecord = await TimeRecord.findOne({
      personnelId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    if (!timeRecord) {
      timeRecord = new TimeRecord({
        personnelId,
        date: new Date(),
        arrivalTime: new Date(),
        remarks: remarks || '',
        isPresent: true
      });
    } else {
      timeRecord.arrivalTime = new Date();
      timeRecord.isPresent = true;
      if (remarks) {
        timeRecord.remarks = remarks;
      }
    }
    
    await timeRecord.save();
    
    // Получаем данные сотрудника для ответа
    const result = await TimeRecord.findById(timeRecord._id).populate('personnelId', 'name position photo');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при отметке прибытия', error: error.message });
  }
});

// Отметить убытие
router.post('/departure', async (req, res) => {
  try {
    const { personnelId, remarks } = req.body;
    
    // Проверяем, существует ли сотрудник
    const personnel = await Personnel.findById(personnelId);
    if (!personnel) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }
    
    // Находим запись на сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const timeRecord = await TimeRecord.findOne({
      personnelId,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    if (!timeRecord) {
      return res.status(404).json({ message: 'Запись о прибытии не найдена' });
    }
    
    timeRecord.departureTime = new Date();
    if (remarks) {
      timeRecord.remarks = remarks;
    }
    
    await timeRecord.save();
    
    // Получаем данные сотрудника для ответа
    const result = await TimeRecord.findById(timeRecord._id).populate('personnelId', 'name position photo');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при отметке убытия', error: error.message });
  }
});

// Получить записи за сегодня
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    const records = await TimeRecord.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('personnelId', 'name position photo');
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении записей за сегодня', error: error.message });
  }
});

// Получить записи за определенную дату
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    
    const records = await TimeRecord.find({
      date: { $gte: date, $lt: nextDay }
    }).populate('personnelId', 'name position photo');
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении записей за дату', error: error.message });
  }
});

// Получить записи конкретного сотрудника
router.get('/personnel/:personnelId', async (req, res) => {
  try {
    const { personnelId } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = { personnelId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const records = await TimeRecord.find(query)
      .populate('personnelId', 'name position photo')
      .sort({ date: -1 });
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении записей сотрудника', error: error.message });
  }
});

module.exports = router;
