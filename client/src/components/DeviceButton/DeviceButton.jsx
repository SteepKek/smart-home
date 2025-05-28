import React from 'react';
import './DeviceButton.css'; // стилі — окремо

const DeviceButton = ({ type, status, onToggle, top, left }) => {
  const icons = {
    light: '💡',
    ac: '❄️',
    humidifier: '💧'
  };

  const getColor = () => {
    if (!status) return '#aaa';
    switch (type) {
      case 'light':
        return 'yellow';
      case 'ac':
        return 'skyblue';
      case 'humidifier':
        return 'lightgreen';
      default:
        return 'white';
    }
  };

  return (
    <button
      className="device-button"
      onClick={onToggle}
      style={{
        top: top,
        left: left,
        backgroundColor: getColor()
      }}
      title={type}
    >
      {icons[type] || '❔'}
    </button>
  );
};

export default DeviceButton;