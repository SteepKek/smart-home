import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Switch,
} from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const DEVICE_POSITIONS = [
  // { id: 'living-light-1', type: 'light', x: 100, y: 100, title: 'Living Room Light 1' },
  // { id: 'kitchen-light', type: 'light', x: 100, y: 100, title: 'Kitchen Light' },
  // // Add more like this:
  // { id: 'ac-living', type: 'ac', x: 60, y: 45, title: 'Living Room AC' },
  // { id: 'humidity-bath', type: 'humidity', x: 80, y: 75, title: 'Bathroom Humidity Sensor' },
];

const DeviceCard = ({ device }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'DHT22':
        return <ThermostatIcon sx={{ fontSize: 40 }} />;
      case 'RELAY':
        return <LightbulbIcon sx={{ fontSize: 40 }} />;
      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getIcon(device.type)}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {device.name}
          </Typography>
        </Box>
        
        {device.type === 'DHT22' && (
          <>
            <Typography color="text.secondary">
              Temperature: {device.data?.temperature?.toFixed(1)}°C
            </Typography>
            <Typography color="text.secondary">
              Humidity: {device.data?.humidity?.toFixed(1)}%
            </Typography>
          </>
        )}
        
        {device.type === 'RELAY' && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography color="text.secondary">State:</Typography>
            <Switch
              checked={device.data?.state || false}
              onChange={() => {}}
              color="primary"
            />
          </Box>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" color="primary">
          Details
        </Button>
      </CardActions>
    </Card>
  );
};

const DevicesGrid = ({ devices = [] }) => {
  return (
    <Grid container spacing={3}>
      {devices.map((device) => (
        <Grid item key={device._id} xs={12} sm={6} md={4} lg={3}>
          <DeviceCard device={device} />
        </Grid>
      ))}
    </Grid>
  );
};

export default DevicesGrid; 