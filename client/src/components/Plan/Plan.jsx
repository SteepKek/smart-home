import React from 'react'
import './Plan.css';
import SensorData from '../SensorData/SensorData';

// Define device positions - easier to manage all positions in one place
const DEVICE_POSITIONS = [
  // Активна зона (гараж та прилеглі кімнати)
  { id: 'garage-light', type: 'light', x: 25, y: 25, title: 'Світло в гаражі', isActive: true },
  { id: 'window1', type: 'window', x: 3.6, y: 45, title: 'Вікно 1 в гаражі', isActive: true },
  
  // Неактивна зона (решта будинку)
  { id: 'kitchen-light', type: 'light', x: 70, y: 23.5, title: 'Світло на кухні', isActive: false },
  { id: 'bedroom1-light', type: 'light', x: 85, y: 60, title: 'Світло в спальні 1', isActive: false },
  { id: 'wc-light', type: 'light', x: 53, y: 60, title: 'Світло у вбиральні', isActive: false },
  { id: 'bathroom-light', type: 'light', x: 55, y: 70, title: 'Світло у ванній', isActive: false },
  { id: 'bedroom2-light', type: 'light', x: 85, y: 85, title: 'Світло в спальні 2', isActive: false },
  { id: 'bedroom3-light', type: 'light', x: 61, y: 89, title: 'Світло в спальні 3', isActive: false },
  { id: 'window2', type: 'window', x: 3.6, y: 31, title: 'Вікно 2 в гаражі', isActive: false },
  { id: 'window3', type: 'window', x: 57.8, y: 19.6, title: 'Вікно 1 на кухні', isActive: false },
  { id: 'window4', type: 'window', x: 96.5, y: 39, title: 'Вікно 2 на кухні', isActive: false },
  { id: 'window5', type: 'window', x: 96.5, y: 56.3, title: 'Вікно в спальні 1', isActive: false },
  { id: 'window6', type: 'window', x: 83, y: 97.8, title: 'Вікно в спальні 2', isActive: false },
  { id: 'window7', type: 'window', x: 60.8, y: 97.8, title: 'Вікно в спальні 3', isActive: false },
  { id: 'window8', type: 'window', x: 47.3, y: 71.3, title: 'Вікно в ванній', isActive: false },
];

const DeviceButton = ({ type, x, y, title, isActive }) => {
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

  // Додаємо різні стилі для різних типів пристроїв
  const getButtonStyle = (type) => {
    const baseStyle = {
      top: `${y}%`,
      left: `${x}%`,
    };

    switch (type) {
      case 'window':
        return {
          ...baseStyle,
          backgroundColor: '#e3f2fd',
          border: '2px solid #64b5f6'
        };
      default:
        return baseStyle;
    }
  };

  const handleClick = (e) => {
    if (!isActive) {
      e.preventDefault();
      return;
    }
    // Тут буде логіка обробки кліку
  };

  return (
    <button 
      className='device-button'
      style={getButtonStyle(type)}
      title={`${title}${!isActive ? ' (Неактивна зона)' : ''}`}
      onClick={handleClick}
      data-type={type}
      disabled={!isActive}
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
