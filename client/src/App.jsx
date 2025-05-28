import React, { useState, useEffect } from 'react';
import Plan from './components/Plan/Plan';
import config from './config';

function App() {
  // Your ESP8266 sensor ID
  const SENSOR_ID = '683220f3f7d3fe003c76184e';
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Видаляємо слеш з кінця базового URL якщо він є
  const baseUrl = config.API_URL.endsWith('/') ? config.API_URL.slice(0, -1) : config.API_URL;

  // Fetch sensor data
  const fetchSensorData = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/sensors`);
      const data = await response.json();
      console.log('All sensors data:', data);

      const sensor = data.find(s => s._id === SENSOR_ID);
      console.log('Current sensor data:', sensor);
      
      if (sensor) {
        setSensorData(sensor);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  // Control LED color
  const setLEDColor = async (color) => {
    try {
      setLoading(true);
      console.log(`Setting LED color to: ${color}`);
      
      const response = await fetch(`${baseUrl}/api/esp8266/led`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ color }),
      });

      const data = await response.json();
      console.log('Response from LED update:', data);
      
      if (data.success) {
        // Update local state with new color
        setSensorData(prev => ({
          ...prev,
          data: {
            ...prev.data,
            ledColor: color
          }
        }));
      }
    } catch (error) {
      console.error('Error setting LED color:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sensor data every 2 seconds
  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Smart Home Dashboard</h1>
      
      {/* Debug Information */}
      <div style={{ 
        marginBottom: 20, 
        padding: 15, 
        backgroundColor: '#f5f5f5', 
        borderRadius: 8,
        fontFamily: 'monospace'
      }}>
        <h3>Debug Information</h3>
        <p>Last Update: {lastUpdate}</p>
        <p>Current Color: {sensorData?.data?.ledColor || 'none'}</p>
        <p>Light Level: {sensorData?.data?.lightLevel !== undefined ? sensorData.data.lightLevel : 'N/A'}</p>
        <p>LED State: {sensorData?.data?.state ? 'ON' : 'OFF'}</p>
        <details>
          <summary>Raw Sensor Data</summary>
          <pre>{JSON.stringify(sensorData, null, 2)}</pre>
        </details>
      </div>

      {/* Light Level Display */}
      <div style={{ marginBottom: 20, padding: 15, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Light Sensor</h2>
        {sensorData?.data?.lightLevel !== undefined ? (
          <div>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              Light Level: {sensorData.data.lightLevel}
            </p>
            <div style={{ 
              width: '100%', 
              height: '20px', 
              backgroundColor: '#eee',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(sensorData.data.lightLevel / 1024) * 100}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                transition: 'width 0.3s ease'
              }}/>
            </div>
          </div>
        ) : (
          <p>Loading light sensor data...</p>
        )}
      </div>

      {/* LED Control */}
      <div style={{ marginBottom: 20 }}>
        <h2>LED Control</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {['red', 'green', 'blue'].map(color => (
            <button
              key={color}
              onClick={() => setLEDColor(color)}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: color,
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                textTransform: 'uppercase',
                fontWeight: 'bold',
                boxShadow: sensorData?.data?.ledColor === color ? '0 0 10px' : 'none'
              }}
            >
              {loading ? 'Setting...' : `${color} LED`}
            </button>
          ))}
        </div>
      </div>

      <Plan />
    </div>
  );
}

export default App;

