import React, { useState, useEffect } from 'react';
import './SensorData.css';
import config from '../../config';

const ZONES = [
  {
    id: 1,
    name: 'Гараж та прилеглі приміщення',
    isActive: true,
    temperature: 22,
    humidity: 45,
    motion: false,
    devices: {
      lights: [
        { id: 'garage-light', name: 'Світло в гаражі', state: false }
      ],
      windows: [
        { id: 'window1', name: 'Вікно 1 в гаражі', state: false },
        { id: 'window2', name: 'Вікно 2 в гаражі', state: false }
      ]
    }
  },
  {
    id: 2,
    name: 'Спальні кімнати',
    isActive: false,
    temperature: '--',
    humidity: '--',
    motion: '--',
    devices: {
      lights: [],
      windows: []
    }
  },
  {
    id: 3,
    name: 'Кухня, туалет та ванна',
    isActive: false,
    temperature: '--',
    humidity: '--',
    motion: '--',
    devices: {
      lights: [],
      windows: []
    }
  }
];

const SensorData = () => {
  const [zones, setZones] = useState(ZONES);
  const [error, setError] = useState(null);

  // Видаляємо слеш з кінця базового URL якщо він є
  const baseUrl = config.API_URL.endsWith('/') ? config.API_URL.slice(0, -1) : config.API_URL;

  // Функція для оновлення даних з сервера
  const fetchSensorData = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/sensor-data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Оновлюємо тільки активну зону
      setZones(prevZones => 
        prevZones.map(zone => 
          zone.isActive ? { ...zone, ...data } : zone
        )
      );
      setError(null);
    } catch (error) {
      console.error('Помилка отримання даних:', error);
      setError(error.message);
    }
  };

  // Функція для керування пристроями
  const handleDeviceControl = async (deviceId, type, newState) => {
    try {
      const response = await fetch(`${baseUrl}/api/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          type,
          state: newState
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setZones(prevZones =>
          prevZones.map(zone => {
            if (!zone.isActive) return zone;
            
            const updatedDevices = { ...zone.devices };
            const deviceType = type === 'light' ? 'lights' : 'windows';
            
            updatedDevices[deviceType] = updatedDevices[deviceType].map(device =>
              device.id === deviceId ? { ...device, state: newState } : device
            );

            return {
              ...zone,
              devices: updatedDevices
            };
          })
        );
        setError(null);
      }
    } catch (error) {
      console.error('Помилка керування пристроєм:', error);
      setError(error.message);
    }
  };

  // Запускаємо періодичне оновлення даних
  useEffect(() => {
    fetchSensorData(); // Початкове завантаження
    const interval = setInterval(fetchSensorData, 5000); // Оновлення кожні 5 секунд
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sensor-data">
      <div className="zones-grid">
        {zones.map(zone => (
          <div 
            key={zone.id} 
            className={`zone-card ${zone.isActive ? 'active' : 'inactive'}`}
          >
            <h3 className="zone-title">Зона {zone.id}: {zone.name}</h3>
            <div className="sensor-values">
              <div className="sensor-value">
                <span className="sensor-label">Температура:</span>
                <span className="sensor-reading">
                  {zone.isActive ? `${zone.temperature}°C` : '--'}
                </span>
              </div>
              <div className="sensor-value">
                <span className="sensor-label">Вологість:</span>
                <span className="sensor-reading">
                  {zone.isActive ? `${zone.humidity}%` : '--'}
                </span>
              </div>
              <div className="sensor-value">
                <span className="sensor-label">Рух:</span>
                <span className="sensor-reading">
                  {zone.isActive 
                    ? (zone.motion ? 'Виявлено' : 'Не виявлено')
                    : '--'}
                </span>
              </div>
              
              {zone.isActive && (
                <>
                  <div className="devices-section">
                    <h4 className="devices-title">Світло:</h4>
                    {zone.devices.lights.map(light => (
                      <div key={light.id} className="device-control">
                        <span className="device-name">{light.name}:</span>
                        <button
                          className={`control-button ${light.state ? 'on' : 'off'}`}
                          onClick={() => handleDeviceControl(light.id, 'light', !light.state)}
                        >
                          {light.state ? 'Увімкнено' : 'Вимкнено'}
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="devices-section">
                    <h4 className="devices-title">Вікна:</h4>
                    {zone.devices.windows.map(window => (
                      <div key={window.id} className="device-control">
                        <span className="device-name">{window.name}:</span>
                        <button
                          className={`control-button ${window.state ? 'open' : 'closed'}`}
                          onClick={() => handleDeviceControl(window.id, 'window', !window.state)}
                        >
                          {window.state ? 'Відчинено' : 'Зачинено'}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorData; 