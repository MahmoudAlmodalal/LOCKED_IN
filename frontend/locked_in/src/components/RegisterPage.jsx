// src/components/RegisterPage.jsx

import React, { useState } from 'react';

const RegisterPage = () => {
  // State variables for each input field
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // This function is called when the form is submitted
  const handleRegister = (event) => {
    event.preventDefault(); // Prevent the browser from reloading

    // Basic validation to check if passwords match
    if (password !== passwordConfirmation) {
      alert("Passwords do not match!");
      return;
    }

    // Log the registration data to the console for now.
    // Later, this will be sent to your backend API.
    console.log('Registering with:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Password:', password);

    // API call would go here:
    // e.g., axios.post('/api/register', { name, email, password, password_confirmation: passwordConfirmation });
  };

  return (
    <div style={{ width: '300px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Create Account</h2>
      <form onSubmit={handleRegister}>
        {/* Name Field */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Email Field */}
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

        {/* Password Field */}
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

        {/* Password Confirmation Field */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="passwordConfirmation">Confirm Password</label>
          <input
            type="password"
            id="passwordConfirmation"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
