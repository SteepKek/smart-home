const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Логуємо всі запити для налагодження
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  next();
});

// Налаштування CORS для доступу з фронтенду та ESP8266
app.use(cors({
  origin: ['https://smart-home-client.onrender.com', 'null'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Конфігурація ESP8266
const ESP_IP = process.env.ESP_IP || '192.168.0.100';
const ESP_PORT = process.env.ESP_PORT || 80;
const ESP_URL = `http://${ESP_IP}:${ESP_PORT}`;

// Зберігання останніх даних з датчиків
let sensorData = {
  temperature: 0,
  humidity: 0,
  motion: false,
  lightLevel: 0,
  ledColor: 'none',
  devices: {
    lights: [
      { id: 'garage-light', state: false }
    ],
    windows: [
      { id: 'window1', state: false },
      { id: 'window2', state: false }
    ]
  }
};

// Функція для оновлення даних з ESP8266
async function updateSensorData() {
  try {
    const response = await axios.get(`${ESP_URL}/sensor-data`);
    const data = response.data;
    
    sensorData = {
      ...sensorData,
      temperature: data.temperature,
      humidity: data.humidity,
      motion: data.motion
    };
  } catch (error) {
    console.error('Помилка отримання даних з ESP8266:', error.message);
  }
}

// Періодичне оновлення даних
setInterval(updateSensorData, 2000);

// API endpoint для ESP8266
app.post('/api/esp8266/data', (req, res) => {
  console.log('Received data from ESP8266:', req.body);
  
  if (req.body && req.body.data) {
    // Оновлюємо дані з датчиків
    sensorData.lightLevel = req.body.data.lightLevel || sensorData.lightLevel;
    
    // Відправляємо поточний колір LED
    res.json({
      success: true,
      data: {
        ledColor: sensorData.ledColor
      }
    });
  } else {
    res.status(400).json({ error: 'Invalid data format' });
  }
});

// API endpoint для керування LED
app.post('/api/esp8266/led', (req, res) => {
  const { color } = req.body;
  if (color && ['red', 'green', 'blue', 'none'].includes(color)) {
    sensorData.ledColor = color;
    res.json({ success: true, data: { ledColor: color } });
  } else {
    res.status(400).json({ error: 'Invalid color' });
  }
});

// API endpoint для отримання даних з датчиків
app.get('/api/sensors', (req, res) => {
  res.json([{
    _id: '683220f3f7d3fe003c76184e',
    data: {
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      motion: sensorData.motion,
      lightLevel: sensorData.lightLevel,
      ledColor: sensorData.ledColor,
      state: true
    }
  }]);
});

// API endpoint для отримання даних з датчиків (альтернативний формат)
app.get('/api/sensor-data', (req, res) => {
  res.json(sensorData);
});

// API endpoint для керування пристроями
app.post('/api/control', async (req, res) => {
  const { deviceId, type, state } = req.body;

  try {
    if (type === 'light') {
      sensorData.devices.lights = sensorData.devices.lights.map(light =>
        light.id === deviceId ? { ...light, state } : light
      );
    } else if (type === 'window') {
      sensorData.devices.windows = sensorData.devices.windows.map(window =>
        window.id === deviceId ? { ...window, state } : window
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Помилка керування пристроєм:', error.message);
    res.status(500).json({ 
      error: 'Помилка керування пристроєм',
      details: error.message 
    });
  }
});

// Запуск сервера
app.listen(port, '0.0.0.0', () => {
  console.log(`Сервер запущено на порту ${port}`);
  console.log(`ESP8266 URL: ${ESP_URL}`);
}); 