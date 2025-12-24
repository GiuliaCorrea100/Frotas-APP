import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

type PrivateRouteProps = {
  requiredPermission?: boolean;
};

const PrivateRoute = ({ requiredPermission = false }: PrivateRouteProps) => {
  const { isAuthenticated, administrador } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredPermission && !administrador) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;