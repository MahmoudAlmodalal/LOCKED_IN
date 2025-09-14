import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check for the authentication token in local storage
  const token = localStorage.getItem('authToken');

  // 1. If a token exists, the user is authenticated.
  //    In this case, render the child components using the <Outlet /> component.
  //    <Outlet /> is a placeholder for the actual page component (like <TaskList />).
  if (token) {
    return <Outlet />;
  }

  // 2. If no token exists, the user is not authenticated.
  //    Redirect them to the /login page using the <Navigate /> component.
  //    The `replace` prop is used to replace the current entry in the history stack,
  //    so the user can't click the "back" button to get back to the protected page.
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
