// src/App.jsx

import React from 'react';
import LoginPage from './components/LoginPage.jsx'; // Import the new login page
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* Render the LoginPage component */}
        <LoginPage />
      </header>
    </div>
  );
}

export default App;
