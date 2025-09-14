// src/components/LoginPage.jsx

import React, { useState } from 'react';
import axiosClient from '../api/axiosClient'; // <-- 1. Import the new client
import { useNavigate } from 'react-router-dom'; // <-- Import for redirection

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // State for login errors
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    try {
      // 2. Use axiosClient to make the API call
      const response = await axiosClient.post('/login', {
        email: email,
        password: password,
      });

      // 3. Assuming the API returns a token in `response.data.access_token`
      const token = response.data.access_token;
      if (token) {
        // 4. Save the token to local storage
        localStorage.setItem('authToken', token);
        
        console.log('Login successful! Token saved.');

        // 5. Redirect the user to the tasks page
        navigate('/tasks');
      }

    } catch (err) {
      console.error('Login failed:', err);
      // Assuming the API returns a 401 with an error message
      setError('Login failed. Please check your credentials.');
      // Clear the token if login fails
      localStorage.removeItem('authToken');
    }
  };

  return (
    <div style={{ width: '300px', margin: '50px auto', /* ... other styles */ }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        {/* Display error message if login fails */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {/* ... rest of the form (email and password fields) ... */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', /* ... other styles */ }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
