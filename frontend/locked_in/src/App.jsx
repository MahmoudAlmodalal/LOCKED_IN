// src/App.jsx

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Import your components
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import TaskList from './components/TaskList.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // <-- 1. Import
import './App.css';

const HomePage = () => (
  <div>
    <h2>Welcome to Locked In!</h2>
    <p>Please log in or register to continue.</p>
  </div>
);

// A simple component for a 404 Not Found page
const NotFound = () => <h2>404 - Page Not Found</h2>;

function App() {
  // We can add a simple logout button for testing
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    // You might want to redirect to login page as well
    window.location.href = '/login'; // Simple redirect
  };

  const token = localStorage.getItem('authToken');

  return (
    <div className="App">
      <nav style={{ padding: '1rem', backgroundColor: '#282c34', marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'white', marginRight: '1rem' }}>Home</Link>
        <Link to="/tasks" style={{ color: 'white', marginRight: '1rem' }}>Tasks</Link>
        {!token ? (
          <>
            <Link to="/login" style={{ color: 'white', marginRight: '1rem' }}>Login</Link>
            <Link to="/register" style={{ color: 'white' }}>Register</Link>
          </>
        ) : (
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'cyan', cursor: 'pointer' }}>
            Logout
          </button>
        )}
      </nav>

      <main>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- Protected Routes --- */}
          {/* All routes nested under ProtectedRoute will require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/tasks" element={<TaskList />} />
            {/* You can add more protected routes here, e.g., /profile, /settings */}
          </Route>

          {/* --- Catch-all for 404 Not Found --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
