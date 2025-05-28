import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Text, Image } from 'react-konva';
import axios from 'axios';
import useImage from 'use-image';

const BackgroundImage = ({ width, height }) => {
  const [image] = useImage('/plan.PNG');
  
  if (!image) return null;

  // Calculate dimensions to maintain aspect ratio
  const imageRatio = image.width / image.height;
  const containerRatio = width / height;
  
  let finalWidth = width;
  let finalHeight = height;

  if (containerRatio > imageRatio) {
    // Container is wider than image ratio
    finalWidth = height * imageRatio;
  } else {
    // Container is taller than image ratio
    finalHeight = width / imageRatio;
  }

  return (
    <Image
      image={image}
      width={finalWidth}
      height={finalHeight}
      x={(width - finalWidth) / 2}
      y={(height - finalHeight) / 2}
    />
  );
};

const FloorPlan = () => {
  const [sensors, setSensors] = useState([]);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.9,
    height: window.innerHeight * 0.8,
  });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        setDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sensors');
        setSensors(response.data);
      } catch (error) {
        console.error('Error fetching sensors:', error);
      }
    };

    fetchSensors();
    const interval = setInterval(fetchSensors, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSensorClick = async (sensor) => {
    if (sensor.type === 'RELAY') {
      try {
        const newState = !sensor.data.state;
        await axios.post(`http://localhost:5000/api/sensors/${sensor._id}/toggle`, {
          state: newState,
        });
        setSensors(sensors.map(s => 
          s._id === sensor._id 
            ? { ...s, data: { ...s.data, state: newState } }
            : s
        ));
      } catch (error) {
        console.error('Error toggling sensor:', error);
      }
    }
  };

  const renderSensor = (sensor) => {
    const color = sensor.data.state ? '#4CAF50' : '#f44336';
    
    return (
      <React.Fragment key={sensor._id}>
        <Circle
          x={sensor.location.x * dimensions.width}
          y={sensor.location.y * dimensions.height}
          radius={15}
          fill={color}
          stroke="#000"
          strokeWidth={1}
          onClick={() => handleSensorClick(sensor)}
          onTap={() => handleSensorClick(sensor)}
          draggable={false}
        />
        <Text
          x={(sensor.location.x * dimensions.width) - 30}
          y={(sensor.location.y * dimensions.height) + 20}
          text={`${sensor.name}${
            sensor.type === 'DHT22'
              ? `\n${sensor.data.temperature?.toFixed(1)}°C\n${sensor.data.humidity?.toFixed(1)}%`
              : ''
          }`}
          fontSize={12}
          align="center"
          width={60}
        />
      </React.Fragment>
    );
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '90vw', 
        height: '80vh', 
        margin: '0 auto',
        position: 'relative'
      }}
    >
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          <BackgroundImage width={dimensions.width} height={dimensions.height} />
          {sensors.map(renderSensor)}
        </Layer>
      </Stage>
    </div>
  );
};

export default FloorPlan; 