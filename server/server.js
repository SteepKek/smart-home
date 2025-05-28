require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Sensor = require('./models/Sensor');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// Set security headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-home', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Get all sensors
app.get('/api/sensors', async (req, res) => {
  try {
    const sensors = await Sensor.find();
    console.log('\n=== GET Sensors Request ===');
    console.log('Number of sensors:', sensors.length);
    
    // Ensure each sensor has proper data structure
    const formattedSensors = sensors.map(sensor => {
      // Initialize default data if none exists
      if (!sensor.data) {
        sensor.data = {
          state: false,
          ledColor: 'none',
          lightLevel: 0,
          lastUpdate: new Date()
        };
      }
      
      // Ensure all required fields exist
      sensor.data = {
        ...sensor.data,
        state: sensor.data.state || false,
        ledColor: sensor.data.ledColor || 'none',
        lightLevel: sensor.data.lightLevel || 0,
        lastUpdate: sensor.data.lastUpdate || new Date()
      };

      console.log(`\nSensor ${sensor._id}:`);
      console.log('Data:', JSON.stringify(sensor.data, null, 2));
      return sensor;
    });

    console.log('=========================\n');
    res.json(formattedSensors);
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({ error: 'Error fetching sensors' });
  }
});

// Add new sensor
app.post('/api/sensors', async (req, res) => {
  try {
    const sensor = new Sensor(req.body);
    await sensor.save();
    res.status(201).json(sensor);
  } catch (error) {
    res.status(400).json({ error: 'Error creating sensor' });
  }
});

// Update sensor data (from ESP8266)
app.post('/api/sensors/:id/data', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('\n=== Sensor Update Request ===');
    console.log('Sensor ID:', id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const sensor = await Sensor.findById(id);
    if (!sensor) {
      console.log('Sensor not found');
      return res.status(404).json({ error: 'Sensor not found' });
    }

    // Initialize data object if it doesn't exist
    if (!sensor.data) {
      sensor.data = {
        state: false,
        ledColor: 'none',
        lightLevel: 0,
        lastUpdate: new Date()
      };
    }

    // Get the data from the request body
    const newData = req.body.data || req.body;
    console.log('Processing new data:', JSON.stringify(newData, null, 2));

    // Update sensor data
    sensor.data = {
      ...sensor.data,                    // Keep existing data as base
      ...newData,                        // Override with new data
      lastUpdate: new Date()             // Always update timestamp
    };

    console.log('Updated sensor data:', JSON.stringify(sensor.data, null, 2));
    await sensor.save();
    console.log('Saved successfully');
    console.log('=========================\n');
    
    res.json(sensor);
  } catch (error) {
    console.error('Error updating sensor:', error);
    res.status(500).json({ error: 'Error updating sensor data' });
  }
});

// Toggle sensor state (for relays/switches)
app.post('/api/sensors/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;
    
    const sensor = await Sensor.findById(id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    
    sensor.data.state = state;
    sensor.data.lastUpdate = new Date();
    await sensor.save();
    
    res.json(sensor);
  } catch (error) {
    res.status(500).json({ error: 'Error toggling sensor state' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));