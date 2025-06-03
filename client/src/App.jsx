import React from 'react';
import Plan from './components/Plan/Plan';

function App() {
  return (
    <div style={{ 
      padding: '10px 20px', 
      maxWidth: '100vw',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <Plan />
    </div>
  );
}

export default App;

