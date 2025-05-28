const http = require('http');

const data = JSON.stringify({
  name: 'ESP8266_LED',
  type: 'RELAY',  // Using RELAY type as it's one of the allowed types
  location: {
    x: 0,
    y: 0,
    room: 'Living Room'
  },
  data: {
    state: false,  // LED is initially off
    lastUpdate: new Date()
  }
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/sensors',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => { 
    console.log('Response:', body);
    try {
      const sensor = JSON.parse(body);
      console.log('\nYour sensor ID is:', sensor._id);
      console.log('\nUse this ID in your App.jsx file.');
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end(); 