import React, { useState, useEffect } from 'react'
import './Plan.css';
import SensorData from '../SensorData/SensorData';
import config from '../../config';

// Define device positions - easier to manage all positions in one place
const DEVICE_POSITIONS = [
  // Активна зона (гараж та прилеглі кімнати)
  { id: 'garage-light', type: 'light', x: 25, y: 25, title: 'Світло в гаражі', isActive: true },
  { id: 'window1', type: 'window', x: 3.6, y: 45, title: 'Вікно 1 в гаражі', isActive: true },
  { id: 'window2', type: 'window', x: 3.6, y: 31, title: 'Вікно 2 в гаражі', isActive: true },
  
  // Неактивна зона (решта будинку)
  { id: 'kitchen-light', type: 'light', x: 70, y: 23.5, title: 'Світло на кухні', isActive: false },
  { id: 'bedroom1-light', type: 'light', x: 85, y: 60, title: 'Світло в спальні 1', isActive: false },
  { id: 'wc-light', type: 'light', x: 53, y: 60, title: 'Світло у вбиральні', isActive: false },
  { id: 'bathroom-light', type: 'light', x: 55, y: 70, title: 'Світло у ванній', isActive: false },
  { id: 'bedroom2-light', type: 'light', x: 85, y: 85, title: 'Світло в спальні 2', isActive: false },
  { id: 'bedroom3-light', type: 'light', x: 61, y: 89, title: 'Світло в спальні 3', isActive: false },
  { id: 'window3', type: 'window', x: 57.8, y: 19.6, title: 'Вікно 1 на кухні', isActive: false },
  { id: 'window4', type: 'window', x: 96.5, y: 39, title: 'Вікно 2 на кухні', isActive: false },
  { id: 'window5', type: 'window', x: 96.5, y: 56.3, title: 'Вікно в спальні 1', isActive: false },
  { id: 'window6', type: 'window', x: 83, y: 97.8, title: 'Вікно в спальні 2', isActive: false },
  { id: 'window7', type: 'window', x: 60.8, y: 97.8, title: 'Вікно в спальні 3', isActive: false },
  { id: 'window8', type: 'window', x: 47.3, y: 71.3, title: 'Вікно в ванній', isActive: false },
];

const DeviceButton = ({ type, x, y, title, isActive, id }) => {
  const [state, setState] = useState('off');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastServerState, setLastServerState] = useState(null);
  
  const getIcon = (type) => {
    switch (type) {
      case 'light':
        return '💡';
      case 'window':
        return '🪟';
      default:
        return '📱';
    }
  };

  const getStatus = () => {
    if (type === 'light') {
      return state === 'on' ? 'Увімкнено' : 'Вимкнено';
    } else if (type === 'window') {
      return state === 'open' ? 'Відчинено' : 'Зачинено';
    }
    return '';
  };

  const handleClick = async (e) => {
    if (!isActive || isUpdating) {
      e.preventDefault();
      return;
    }

    if (id === 'garage-light') {
      try {
        setIsUpdating(true);
        const newState = state === 'on' ? 'off' : 'on';
        const baseUrl = config.API_URL.endsWith('/') ? config.API_URL.slice(0, -1) : config.API_URL;
        
        const response = await fetch(`${baseUrl}/api/esp8266/led`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            color: newState === 'on' ? 'red' : 'none'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to toggle light');
        }

        setState(newState);
        setLastServerState(newState);
      } catch (error) {
        console.error('Error toggling light:', error);
        // Повертаємо попередній стан у разі помилки
        setState(state);
      } finally {
        setIsUpdating(false);
      }
    } else if (type === 'window' && isActive) {
      setState(state === 'open' ? 'closed' : 'open');
    }
  };

  // Ефект для періодичного оновлення стану з сервера
  useEffect(() => {
    if (id === 'garage-light' && isActive) {
      const fetchState = async () => {
        try {
          const baseUrl = config.API_URL.endsWith('/') ? config.API_URL.slice(0, -1) : config.API_URL;
          const response = await fetch(`${baseUrl}/api/sensors`);
          const data = await response.json();
          const sensor = data.find(s => s._id === '683220f3f7d3fe003c76184e');
          
          if (sensor && !isUpdating) {
            const newState = sensor.data.state ? 'on' : 'off';
            // Оновлюємо стан тільки якщо він відрізняється від останнього відомого стану сервера
            if (newState !== lastServerState) {
              setState(newState);
              setLastServerState(newState);
            }
          }
        } catch (error) {
          console.error('Error fetching light state:', error);
        }
      };

      fetchState();
      const interval = setInterval(fetchState, 2000);
      return () => clearInterval(interval);
    }
  }, [id, isActive, isUpdating, lastServerState]);

  return (
    <button 
      className='device-button'
      style={{
        top: `${y}%`,
        left: `${x}%`,
        backgroundColor: type === 'window' ? '#e3f2fd' : '#fff',
        border: type === 'window' ? '2px solid #64b5f6' : 'none'
      }}
      title={`${title}${!isActive ? ' (Неактивна зона)' : ''}`}
      onClick={handleClick}
      data-type={type}
      data-state={state}
      data-status={getStatus()}
      disabled={!isActive || isUpdating}
    >
      {getIcon(type)}
    </button>
  );
};

function Plan() {
  return (
    <div className='plan-page'>
      <SensorData />
      <div className='plan-container'>
        <div className='plan-wrapper'>
          <img 
            src="plan.PNG" 
            alt="House Floor Plan" 
            className='plan-image'
            loading="eager"
          />
          <div className="buttons-overlay">
            {DEVICE_POSITIONS.map(device => (
              <DeviceButton
                key={device.id}
                {...device}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Plan
