// src/api/axiosClient.js

import axios from 'axios';

// 1. Create a new Axios instance with a custom configuration
const axiosClient = axios.create({
  // Set the base URL for all API requests
  // Replace this with your actual backend URL from your .env file
  baseURL: 'http://localhost:8000/api', // Example: Your Laravel API endpoint
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
} );

// 2. Add a request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Retrieve the token from local storage
    const token = localStorage.getItem('authToken');

    // If a token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

export default axiosClient;
