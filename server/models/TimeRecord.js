const mongoose = require('mongoose');

const timeRecordSchema = new mongoose.Schema({
  personnelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  arrivalTime: {
    type: Date,
    default: null
  },
  departureTime: {
    type: Date,
    default: null
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  },
  isPresent: {
    type: Boolean,
    default: false
  }
});

// Индекс для быстрого поиска по персоналу и дате
timeRecordSchema.index({ personnelId: 1, date: 1 });

module.exports = mongoose.model('TimeRecord', timeRecordSchema);
