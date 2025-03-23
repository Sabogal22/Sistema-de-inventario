import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('access_token'); // Verifica si hay un token

  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
