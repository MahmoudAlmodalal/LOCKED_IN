import React, { useState } from 'react';

const LoginPage = () => {
  // Create state variables to hold the values of the input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // This function will be called when the form is submitted
  const handleLogin = (event) => {
    // preventDefault stops the browser from refreshing the page on form submission
    event.preventDefault();

    // For now, we'll just log the data to the console.
    // In a future task, you would send this data to your backend API.
    console.log('Login attempt with:');
    console.log('Email:', email);
    console.log('Password:', password);

    // Here you would typically make an API call:
    // e.g., axios.post('/api/login', { email, password });
  };

  return (
    <div style={{ width: '300px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        {/* Email Field */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email} // Bind the input's value to our state variable
            onChange={(e) => setEmail(e.target.value)} // Update the state on every keystroke
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
            value={password} // Bind the input's value to our state variable
            onChange={(e) => setPassword(e.target.value)} // Update the state on every keystroke
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
