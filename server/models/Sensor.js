const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['DHT22', 'LIGHT', 'MOTION', 'RELAY']
  },
  location: {
    x: Number,
    y: Number,
    room: String
  },
  data: {
    temperature: Number,
    humidity: Number,
    state: Boolean,
    ledColor: String,
    lightLevel: {
      type: Number,
      default: 0
    },
    lastUpdate: {
      type: Date,
      default: Date.now
    }
  }
});

module.exports = mongoose.model('Sensor', sensorSchema); 