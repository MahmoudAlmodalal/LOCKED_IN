// src/App.jsx

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Import your page components
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import TaskList from './components/TaskList.jsx';
import './App.css';

// A simple component for the home page
const HomePage = () => (
  <div>
    <h2>Welcome to Locked In!</h2>
    <p>Please log in or register to continue.</p>
  </div>
);

function App() {
  return (
    <div className="App">
      {/* --- Navigation Bar --- */}
      <nav style={{ padding: '1rem', backgroundColor: '#282c34', marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'white', marginRight: '1rem' }}>Home</Link>
        <Link to="/tasks" style={{ color: 'white', marginRight: '1rem' }}>Tasks</Link>
        <Link to="/login" style={{ color: 'white', marginRight: '1rem' }}>Login</Link>
        <Link to="/register" style={{ color: 'white' }}>Register</Link>
      </nav>

      {/* --- Route Definitions --- */}
      <main>
        <Routes>
          {/* When the URL is "/", show the HomePage component */}
          <Route path="/" element={<HomePage />} />
          
          {/* When the URL is "/tasks", show the TaskList component */}
          <Route path="/tasks" element={<TaskList />} />

          {/* When the URL is "/login", show the LoginPage component */}
          <Route path="/login" element={<LoginPage />} />

          {/* When the URL is "/register", show the RegisterPage component */}
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
